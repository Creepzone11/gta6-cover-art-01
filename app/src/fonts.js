// Loads the OFL fonts bundled under app/fonts/ so the canvas can draw with them.
// Fonts are loaded once; every draw waits for them before painting text.

let loaded = null;

export function loadCoverFonts() {
  if (loaded) return loaded;
  loaded = (async () => {
    const anton = new FontFace('Anton', 'url(./fonts/Anton-Regular.ttf)');
    const pacifico = new FontFace('Pacifico', 'url(./fonts/Pacifico-Regular.ttf)');
    const [a, p] = await Promise.all([anton.load(), pacifico.load()]);
    document.fonts.add(a);
    document.fonts.add(p);
    await document.fonts.ready;
  })();
  return loaded;
}
