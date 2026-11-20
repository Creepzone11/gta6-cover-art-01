// Loads the vendored fonts (Anton for titles, Pacifico for the script
// subtitle) so the canvas can draw with them. Both are SIL Open Font License
// files under app/fonts/.

let loaded = false;

/** Loads both fonts and resolves once they are usable on a canvas. */
export async function loadFonts() {
  if (loaded) return;
  const anton = new FontFace('Anton', 'url(./fonts/Anton-Regular.ttf)');
  const pacifico = new FontFace('Pacifico', 'url(./fonts/Pacifico-Regular.ttf)');
  const [a, p] = await Promise.all([anton.load(), pacifico.load()]);
  document.fonts.add(a);
  document.fonts.add(p);
  // Wait until the browser actually has them ready for measuring.
  await Promise.all([document.fonts.load('40px Anton'), document.fonts.load('40px Pacifico')]);
  loaded = true;
}
