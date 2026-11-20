// Fixed scenes for screenshots: ?shot=cover shows the cover alone at a chosen
// size, ?shot=editor shows the editor with a sample photo loaded. Query keys:
// photo (sample name), caption (title), subtitle, layout, grade, size (WxH).
// window.__shotReady is set once the scene is painted.

import { loadFonts } from './fonts.js';
import { SIZES } from './layouts.js';

/** Parses a WxH size string into {w, h}, or null. */
function parseSize(text) {
  if (!text) return null;
  const m = /^(\d+)x(\d+)$/.exec(text);
  if (!m) return null;
  return { w: Number(m[1]), h: Number(m[2]) };
}

export async function runShot(shot, query, editor) {
  await loadFonts();
  const names = (query.get('photos') || query.get('photo') || 'pier').split(',').map((s) => s.trim()).filter(Boolean);
  const caption = query.get('caption') || 'Sunset Heist';
  const subtitle = query.get('subtitle') || 'a Vice City story';
  const layout = query.get('layout') || 'hero3';
  const grade = query.get('grade') || 'sunset';

  editor.title = caption;
  editor.subtitle = subtitle;
  editor.setLayout(layout);
  editor.setGrade(grade);
  await editor.addPhotos(names.map((name) => ({ url: `samples/${name}.jpg`, name })));

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = parseSize(query.get('size')) || { w: 1920, h: 1080 };
    const known = SIZES.find((s) => s.w === size.w && s.h === size.h);
    if (known) editor.setSize(known.id);
    editor.redraw();
  } else {
    const size = parseSize(query.get('size'));
    if (size) {
      const known = SIZES.find((s) => s.w === size.w && s.h === size.h);
      if (known) editor.setSize(known.id);
    }
    editor.redraw();
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
