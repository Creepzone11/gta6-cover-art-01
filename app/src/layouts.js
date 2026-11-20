// Layouts: each one maps a cover of width w and height h to a list of panels.
// A panel is {x, y, w, h, rot} in pixels, rot in radians (0 for straight grids).
// titleZone says where the title band sits: 'bottom' overlays the foot of the
// cover, 'top' sits above the photos.

function gridPanels(w, h, cols, rows, gap) {
  const panels = [];
  const cw = (w - gap * (cols + 1)) / cols;
  const ch = (h - gap * (rows + 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      panels.push({ x: gap + c * (cw + gap), y: gap + r * (ch + gap), w: cw, h: ch, rot: 0 });
    }
  }
  return panels;
}

export const LAYOUTS = {
  grid4: {
    name: 'Four Panel',
    titleZone: 'bottom',
    panels(w, h) { return gridPanels(w, h, 2, 2, Math.round(Math.min(w, h) * 0.012)); },
  },
  hero3: {
    name: 'Hero + Three',
    titleZone: 'bottom',
    panels(w, h) {
      const gap = Math.round(Math.min(w, h) * 0.012);
      const heroW = Math.round(w * 0.60);
      const sideX = heroW + gap;
      const sideW = w - sideX - gap;
      const sh = (h - gap * 4) / 3;
      return [
        { x: gap, y: gap, w: heroW - gap, h: h - gap * 2, rot: 0 },
        { x: sideX, y: gap, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: gap * 2 + sh, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: gap * 3 + sh * 2, w: sideW, h: sh, rot: 0 },
      ];
    },
  },
  full: {
    name: 'Full Bleed',
    titleZone: 'bottom',
    panels(w, h) { return [{ x: 0, y: 0, w, h, rot: 0 }]; },
  },
  grid9: {
    name: 'Nine Panel',
    titleZone: 'bottom',
    panels(w, h) { return gridPanels(w, h, 3, 3, Math.round(Math.min(w, h) * 0.01)); },
  },
  tilt: {
    name: 'Tilted Snapshots',
    titleZone: 'top',
    panels(w, h) {
      const s = Math.min(w, h);
      return [
        { x: w * 0.06, y: h * 0.30, w: w * 0.44, h: h * 0.42, rot: -0.10 },
        { x: w * 0.50, y: h * 0.26, w: w * 0.44, h: h * 0.42, rot: 0.07 },
        { x: w * 0.28, y: h * 0.60, w: w * 0.44, h: h * 0.34, rot: -0.03 },
      ];
    },
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** Sizes the app exports, in pixels. */
export const SIZES = [
  { id: '1080x1080', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Landscape 1920 x 1080', w: 1920, h: 1080 },
];
