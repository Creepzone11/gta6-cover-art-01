// Editor state: photos, per-panel transforms, layout, grade, size, caption.
// Owns the preview canvas, drag and zoom on panels, and the full-size export.
import { drawCover } from './cover.js';
import { panelCount, panelsFor } from './layouts.js';
import { loadCoverFonts } from './fonts.js';

/** The post sizes the app exports, keyed by id. */
export const SIZES = {
  square: { id: 'square', name: '1080 x 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', name: '1080 x 1350', w: 1080, h: 1350 },
  landscape: { id: 'landscape', name: '1920 x 1080', w: 1920, h: 1080 },
};

/** Fresh panel slots for a layout, keeping each slot's photo where it fits.
 * New slots start empty (photo null) so addPhoto fills them in order; the
 * renderer falls back to alternating photos for empty slots. */
function freshPanels(layoutId, oldPanels) {
  const count = panelCount(layoutId);
  const out = [];
  for (let i = 0; i < count; i++) {
    const old = oldPanels[i];
    out.push({ photo: old ? old.photo : null, scale: 1, dx: 0, dy: 0 });
  }
  return out;
}

/** Creates the editor around a preview canvas. */
export function createEditor(canvas) {
  const state = {
    photos: [],
    panels: freshPanels('four', []),
    layout: 'four',
    grade: 'sunset',
    size: 'landscape',
    title: 'Neon Shore',
    subtitle: 'a Vice City story',
    selected: 0,
  };

  let fontsReady = loadCoverFonts();
  let drag = null;

  function sizeOf() {
    return SIZES[state.size] ?? SIZES.landscape;
  }

  /** Redraws the preview at the cover's own size. */
  function redraw() {
    const { w, h } = sizeOf();
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    fontsReady.then(() => drawCover(canvas, state));
  }

  function setLayout(id) {
    state.layout = id;
    state.panels = freshPanels(id, state.panels);
    state.selected = 0;
    redraw();
  }

  function setGrade(id) {
    state.grade = id;
    redraw();
  }

  function setSize(id) {
    state.size = id;
    redraw();
  }

  function setTitle(text) {
    state.title = text;
    redraw();
  }

  function setSubtitle(text) {
    state.subtitle = text;
    redraw();
  }

  /** Adds a loaded photo; fills the first empty slot, else the selected one. */
  function addPhoto(img, name) {
    const index = state.photos.length;
    state.photos.push({ img, name });
    const empty = state.panels.findIndex((p) => p.photo == null);
    if (empty >= 0) state.panels[empty].photo = index;
    else state.panels[state.selected].photo = index;
    redraw();
    return index;
  }

  /** Puts a photo into the selected panel. */
  function assignPhoto(photoIndex) {
    if (!state.photos[photoIndex]) return;
    state.panels[state.selected].photo = photoIndex;
    redraw();
  }

  /** The panel under a canvas point, topmost first (tilted panels overlap). */
  function hitPanel(px, py) {
    const { w, h } = sizeOf();
    const rects = panelsFor(state.layout, w, h);
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const cos = Math.cos(-r.rot);
      const sin = Math.sin(-r.rot);
      const dx = px - cx;
      const dy = py - cy;
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return i;
    }
    return -1;
  }

  /** Canvas coordinates of a pointer event. */
  function toCanvas(e) {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * canvas.width,
      y: ((e.clientY - box.top) / box.height) * canvas.height,
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const hit = hitPanel(p.x, p.y);
    if (hit < 0) return;
    state.selected = hit;
    const slot = state.panels[hit];
    drag = { x: p.x, y: p.y, dx: slot.dx || 0, dy: slot.dy || 0 };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toCanvas(e);
    const slot = state.panels[state.selected];
    slot.dx = drag.dx + (p.x - drag.x);
    slot.dy = drag.dy + (p.y - drag.y);
    redraw();
  });

  canvas.addEventListener('pointerup', () => {
    drag = null;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = toCanvas(e);
    const hit = hitPanel(p.x, p.y);
    const slot = state.panels[hit >= 0 ? hit : state.selected];
    const next = (slot.scale || 1) * Math.exp(-e.deltaY * 0.001);
    slot.scale = Math.min(4, Math.max(1, next));
    redraw();
  }, { passive: false });

  /** Draws the cover at full size and returns its PNG blob. */
  async function exportBlob() {
    await fontsReady;
    const { w, h } = sizeOf();
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    drawCover(off, state);
    return new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  }

  /** Downloads the cover at full size. */
  async function exportPNG(onSaved) {
    const blob = await exportBlob();
    const { w, h } = sizeOf();
    const name = `cover-${w}x${h}.png`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    if (onSaved) onSaved(name);
    return name;
  }

  redraw();
  return {
    state,
    redraw,
    setLayout,
    setGrade,
    setSize,
    setTitle,
    setSubtitle,
    addPhoto,
    assignPhoto,
    exportBlob,
    exportPNG,
  };
}
