// Draws the cover: panels of photos with a colour grade, white poster borders,
// grain, a vignette, and the title block in Anton with a sunset-gradient fill
// and a Pacifico script subtitle. Everything is drawn on a 2D canvas, so the
// same state renders identically at any export size.

import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';

/** Tiny seeded random generator, so the grain looks the same every render. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 128; tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  const rand = mulberry32(20261119);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = tile;
  return tile;
}

/** Draws one photo into a panel rect, cover-fit, with per-panel pan/zoom. */
function drawPanelPhoto(ctx, photo, panel, pan) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const scale = base * (pan.scale || 1);
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const cx = x + w / 2 + (pan.ox || 0);
  const cy = y + h / 2 + (pan.oy || 0);
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

/** Tints one panel with the grade's overlay gradient and soft wash. */
function gradePanel(ctx, panel, grade) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, grade.overlayTop);
  g.addColorStop(1, grade.overlayBottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = grade.overlayAlpha;
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = grade.washAlpha;
  ctx.fillStyle = grade.wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = grade.multiplyAlpha;
  ctx.fillStyle = grade.multiply;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Halftone dots along a band: small circles shrinking left to right. */
function halftoneRow(ctx, x, y, w, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  const step = r * 2.6;
  let i = 0;
  for (let px = x; px < x + w; px += step, i++) {
    const rr = Math.max(0.6, r * (1 - i / (w / step) * 0.7));
    ctx.beginPath();
    ctx.arc(px, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draws the title band: scrim, halftone, Anton title with gradient fill and
 *  dark outline, and the Pacifico subtitle. */
function drawTitleBand(ctx, w, h, grade, title, subtitle, zone) {
  const bandH = Math.round(h * 0.24);
  const bandY = zone === 'top' ? 0 : h - bandH;
  // Scrim so the lettering reads over any photo.
  const scrim = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (zone === 'top') {
    scrim.addColorStop(0, 'rgba(10, 4, 20, 0.82)');
    scrim.addColorStop(1, 'rgba(10, 4, 20, 0)');
  } else {
    scrim.addColorStop(0, 'rgba(10, 4, 20, 0)');
    scrim.addColorStop(1, 'rgba(10, 4, 20, 0.85)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, w, bandH);
  // Halftone dots along the band's inner edge.
  const dotY = zone === 'top' ? bandY + bandH - Math.round(h * 0.02) : bandY + Math.round(h * 0.02);
  halftoneRow(ctx, w * 0.05, dotY, w * 0.9, Math.max(2, h * 0.004), 'rgba(255, 255, 255, 0.55)');

  const text = (title || '').trim().toUpperCase();
  const sub = (subtitle || '').trim();
  const cx = w / 2;
  if (sub) {
    const subSize = Math.round(h * 0.038);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grade.subtitle;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = subSize * 0.25;
    const subY = zone === 'top' ? bandY + bandH * 0.30 : bandY + bandH * 0.26;
    ctx.fillText(sub, cx, subY);
    ctx.shadowBlur = 0;
  }
  if (text) {
    let size = Math.round(h * 0.105);
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(text).width > w * 0.92 && size > 12) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    const grad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
    grad.addColorStop(0, grade.titleFrom);
    grad.addColorStop(1, grade.titleTo);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleY = zone === 'top' ? bandY + bandH * 0.62 : bandY + bandH * 0.60;
    ctx.lineWidth = Math.max(2, size * 0.10);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#160a24';
    ctx.strokeText(text, cx, titleY);
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, titleY);
  }
}

/** Draws the whole cover onto `canvas` from `state`.
 *  state: { photos, panels, layoutId, gradeId, title, subtitle }.
 *  panels[i] is { photo, scale, ox, oy } for panel i (photo = index into
 *  photos, or -1 for an empty panel). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layoutId] || LAYOUTS.grid4;
  const grade = GRADES[state.gradeId] || GRADES.sunset;
  const panels = layout.panels(w, h);
  const border = Math.max(2, Math.round(Math.min(w, h) * 0.008));

  // Backdrop (shows through gaps and behind tilted snapshots).
  ctx.fillStyle = grade.backdrop;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const pan = state.panels[i] || { photo: -1, scale: 1, ox: 0, oy: 0 };
    const photo = pan.photo >= 0 ? state.photos[pan.photo] : null;
    ctx.save();
    if (panel.rot) {
      ctx.translate(panel.x + panel.w / 2, panel.y + panel.h / 2);
      ctx.rotate(panel.rot);
      ctx.translate(-panel.w / 2, -panel.h / 2);
    }
    const rect = panel.rot ? { x: 0, y: 0, w: panel.w, h: panel.h } : panel;
    if (photo) {
      drawPanelPhoto(ctx, photo, rect, pan);
      gradePanel(ctx, rect, grade);
    } else {
      ctx.fillStyle = '#3a2b52';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    // White poster border around the panel.
    ctx.lineWidth = border;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  // Grain over everything.
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.10;
  const tile = getGrainTile();
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Vignette: darkened corners.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  drawTitleBand(ctx, w, h, grade, state.title, state.subtitle, layout.titleZone);
}

/** Builds the default per-panel state for a layout: panel 0 gets photo 0,
 *  the rest cycle through the photos. */
export function defaultPanels(layoutId, photoCount) {
  const layout = LAYOUTS[layoutId] || LAYOUTS.grid4;
  const n = layout.panels(100, 100).length;
  const panels = [];
  for (let i = 0; i < n; i++) {
    panels.push({ photo: photoCount > 0 ? i % photoCount : -1, scale: 1, ox: 0, oy: 0 });
  }
  return panels;
}
