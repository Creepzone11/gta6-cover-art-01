// Fixed scenes for screenshots: ?shot=cover renders a cover full-frame;
// ?shot=editor renders the editor with sample photos loaded.
// window.__shotReady is set once fonts are loaded and the cover is painted.
import { loadCoverFonts } from './fonts.js';

/** Loads an image from a URL, resolving to the image once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Sets up a screenshot scene from the query and paints it:
 * photos=pier,boulevard&layout=tilted&grade=sunset&size=1920x1080
 * &title=Neon%20Shore&subtitle=a%20Vice%20City%20story
 */
export async function runShot(shot, query, editor) {
  await loadCoverFonts();
  const names = (query.get('photos') ?? 'pier').split(',').filter(Boolean);
  for (const name of names) {
    const img = await loadImage(`samples/${name}.jpg`);
    editor.addPhoto(img, name);
  }
  if (query.get('layout')) editor.setLayout(query.get('layout'));
  if (query.get('grade')) editor.setGrade(query.get('grade'));
  if (query.get('size')) editor.setSize(query.get('size'));
  if (query.get('title') !== null) editor.setTitle(query.get('title'));
  if (query.get('subtitle') !== null) editor.setSubtitle(query.get('subtitle'));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  editor.redraw();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
