// Draws a GTA-style multi-panel cover onto a canvas: panels, colour grade,
// grain, vignette and the title band. Everything is deterministic for a given
// state, so the same state always draws the same cover.
import { panelsFor } from './layouts.js';
import { gradeById } from './grades.js';

/** Seeded random: the same seed always draws the same grain. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws one photo cover-fit into a panel rect, with its pan/zoom transform. */
function drawPhotoPanel(ctx, img, rect, transform, border) {
  const { x, y, w, h, rot } = rect;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  ctx.clip();
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * (transform.scale || 1);
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  ctx.drawImage(img, (transform.dx || 0) - pw / 2, (transform.dy || 0) - ph / 2, pw, ph);
  ctx.restore();
  if (border > 0) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = border;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

/** Paints the grade's wash and tint over the photos. */
function applyGrade(ctx, w, h, grade) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(0.5, grade.wash[1]);
  wash.addColorStop(1, grade.wash[2]);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Seeded film grain, the same dots for the same cover. */
function drawGrain(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  const count = Math.round((w * h) / 900);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  ctx.restore();
}

/** Darkens the corners so the cover reads as one poster. */
function drawVignette(ctx, w, h) {
  const r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** The title band: scrim, halftone dots, script subtitle, big gradient title. */
function drawTitleBand(ctx, w, h, title, subtitle, grade) {
  const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
  scrim.addColorStop(0, 'rgba(10,4,18,0)');
  scrim.addColorStop(1, 'rgba(10,4,18,0.85)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  const dotY = h - h * 0.235;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const step = Math.max(10, w * 0.012);
  for (let x = w * 0.05; x < w * 0.95; x += step) {
    ctx.beginPath();
    ctx.arc(x, dotY, Math.max(1.5, w * 0.002), 0, Math.PI * 2);
    ctx.fill();
  }

  const sub = (subtitle || '').trim();
  if (sub) {
    const subSize = Math.round(h * 0.038);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.subtitle;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(sub, w / 2, h - h * 0.175);
    ctx.shadowBlur = 0;
  }

  const text = (title || '').trim().toUpperCase();
  if (!text) return;
  let size = Math.round(h * 0.115);
  ctx.textAlign = 'center';
  const fits = () => {
    ctx.font = `${size}px Anton, sans-serif`;
    return ctx.measureText(text).width <= w * 0.92;
  };
  while (!fits() && size > 14) size -= 2;
  ctx.font = `${size}px Anton, sans-serif`;
  const grad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
  grad.addColorStop(0, grade.title[0]);
  grad.addColorStop(0.5, grade.title[1]);
  grad.addColorStop(1, grade.title[2]);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(18,6,26,0.92)';
  ctx.lineWidth = Math.max(3, size / 14);
  ctx.strokeText(text, w / 2, h - h * 0.055);
  ctx.fillStyle = grad;
  ctx.fillText(text, w / 2, h - h * 0.055);
}

/**
 * Draws the whole cover onto `canvas` from a state:
 * { photos: [img], panels: [{photo, scale, dx, dy}], layout, grade,
 *   title, subtitle }. Panels with no photo are left as the dark base.
 */
export function drawCover(canvas, state) {
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  ctx.fillStyle = '#160a20';
  ctx.fillRect(0, 0, w, h);
  const rects = panelsFor(state.layout, w, h);
  const border = Math.max(3, Math.round(w * 0.004));
  rects.forEach((rect, i) => {
    const slot = state.panels[i] || {};
    const photoCount = Math.max(1, state.photos.length);
    const entry = state.photos[slot.photo ?? (i % photoCount)];
    const img = entry && entry.img;
    if (!img) return;
    drawPhotoPanel(ctx, img, rect, slot, border);
  });
  applyGrade(ctx, w, h, grade);
  drawVignette(ctx, w, h);
  drawGrain(ctx, w, h, 1337);
  drawTitleBand(ctx, w, h, state.title, state.subtitle, grade);
}
