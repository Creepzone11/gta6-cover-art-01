// The editor: holds the cover state, wires the controls, and lets the user
// drag a panel's photo to move it and scroll to zoom it. The preview canvas
// always shows the live cover; export redraws it at full size.

import { drawCover, defaultPanels } from './cover.js';
import { LAYOUTS, LAYOUT_IDS, SIZES } from './layouts.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { loadFonts } from './fonts.js';

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export class Editor {
  constructor(canvas) {
    this.canvas = canvas;
    this.photos = [];
    this.photoNames = [];
    this.layoutId = 'hero3';
    this.gradeId = 'sunset';
    this.sizeId = '1920x1080';
    this.title = 'NEON SHORE';
    this.subtitle = 'a Vice City story';
    this.panels = defaultPanels(this.layoutId, 0);
    this.selected = 0;
    this.drag = null;
    this.onchange = null;
  }

  get size() {
    return SIZES.find((s) => s.id === this.sizeId) || SIZES[0];
  }

  /** Replaces the panel list when the layout or photo count changes. A panel
   *  keeps its old photo when that photo still exists; an empty panel takes
   *  the default assignment, so adding a photo fills the empty panels. */
  resetPanels() {
    const old = this.panels;
    this.panels = defaultPanels(this.layoutId, this.photos.length);
    for (let i = 0; i < Math.min(old.length, this.panels.length); i++) {
      if (old[i].photo >= 0 && old[i].photo < this.photos.length) {
        this.panels[i] = old[i];
      }
    }
    if (this.selected >= this.panels.length) this.selected = 0;
  }

  /** Adds photos (File objects or {url, name} entries) and redraws. */
  async addPhotos(items) {
    for (const item of items) {
      const url = item.url || URL.createObjectURL(item);
      const img = await loadImage(url);
      this.photos.push(img);
      this.photoNames.push(item.name || `Photo ${this.photos.length}`);
    }
    this.resetPanels();
    this.redraw();
  }

  /** Assigns photo `index` to the selected panel. */
  assignToSelected(index) {
    this.panels[this.selected] = { ...this.panels[this.selected], photo: index, scale: 1, ox: 0, oy: 0 };
    this.redraw();
  }

  setLayout(id) {
    if (!LAYOUTS[id]) return;
    this.layoutId = id;
    this.resetPanels();
    this.redraw();
  }

  setGrade(id) {
    if (!GRADES[id]) return;
    this.gradeId = id;
    this.redraw();
  }

  setSize(id) {
    if (!SIZES.find((s) => s.id === id)) return;
    this.sizeId = id;
    this.redraw();
  }

  redraw() {
    const size = this.size;
    if (this.canvas.width !== size.w || this.canvas.height !== size.h) {
      this.canvas.width = size.w;
      this.canvas.height = size.h;
    }
    drawCover(this.canvas, {
      photos: this.photos,
      panels: this.panels,
      layoutId: this.layoutId,
      gradeId: this.gradeId,
      title: this.title,
      subtitle: this.subtitle,
    });
    if (this.onchange) this.onchange();
  }

  /** Which panel (index) contains canvas point (x, y), or -1. */
  hitPanel(x, y) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const panels = LAYOUTS[this.layoutId].panels(w, h);
    for (let i = panels.length - 1; i >= 0; i--) {
      const p = panels[i];
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
    }
    return -1;
  }

  /** Pointer position in canvas pixels. */
  eventPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }

  /** Wires pointer drag (pan) and wheel (zoom) on the preview canvas. */
  bindPointer() {
    const canvas = this.canvas;
    canvas.addEventListener('pointerdown', (e) => {
      const pt = this.eventPoint(e);
      const hit = this.hitPanel(pt.x, pt.y);
      if (hit < 0) return;
      this.selected = hit;
      this.drag = { panel: hit, lastX: pt.x, lastY: pt.y };
      canvas.setPointerCapture(e.pointerId);
      if (this.onchange) this.onchange();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      const pt = this.eventPoint(e);
      const pan = this.panels[this.drag.panel];
      pan.ox += pt.x - this.drag.lastX;
      pan.oy += pt.y - this.drag.lastY;
      this.drag.lastX = pt.x;
      this.drag.lastY = pt.y;
      this.redraw();
    });
    canvas.addEventListener('pointerup', () => { this.drag = null; });
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const pt = this.eventPoint(e);
      const hit = this.hitPanel(pt.x, pt.y);
      if (hit < 0) return;
      const pan = this.panels[hit];
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      pan.scale = Math.min(4, Math.max(0.5, (pan.scale || 1) * factor));
      this.selected = hit;
      this.redraw();
    }, { passive: false });
  }

  /** Draws the cover at full export size and downloads it as a PNG. */
  exportPng() {
    const size = this.size;
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off, {
      photos: this.photos,
      panels: this.panels,
      layoutId: this.layoutId,
      gradeId: this.gradeId,
      title: this.title,
      subtitle: this.subtitle,
    });
    return new Promise((resolve) => {
      off.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cover-${size.id}.png`;
        a.click();
        resolve(`cover-${size.id}.png`);
      }, 'image/png');
    });
  }
}
