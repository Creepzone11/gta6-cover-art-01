// Panel layouts: each layout maps a cover size to the panels it is drawn from.
// A panel is {x, y, w, h, rot}: its rectangle in pixels and its rotation in
// radians around its own centre. The title band is drawn over the bottom of the
// cover, so layouts keep their panels short of the band where it matters.

export const LAYOUT_IDS = ['four', 'hero3', 'bleed', 'nine', 'tilted'];

export const LAYOUT_NAMES = {
  four: 'Four Panel',
  hero3: 'Hero + Three',
  bleed: 'Full Bleed',
  nine: 'Nine Panel',
  tilted: 'Tilted Snapshots',
};

/** How many photo slots a layout has. */
export function panelCount(layoutId) {
  return { four: 4, hero3: 4, bleed: 1, nine: 9, tilted: 3 }[layoutId] ?? 4;
}

/** Panels for a layout at a cover of w by h pixels. */
export function panelsFor(layoutId, w, h) {
  const gap = Math.max(4, Math.round(w * 0.006));
  switch (layoutId) {
    case 'four': {
      const cw = (w - gap * 3) / 2;
      const ch = (h - gap * 3) / 2;
      return [
        { x: gap, y: gap, w: cw, h: ch, rot: 0 },
        { x: gap * 2 + cw, y: gap, w: cw, h: ch, rot: 0 },
        { x: gap, y: gap * 2 + ch, w: cw, h: ch, rot: 0 },
        { x: gap * 2 + cw, y: gap * 2 + ch, w: cw, h: ch, rot: 0 },
      ];
    }
    case 'hero3': {
      const heroW = Math.round(w * 0.6);
      const sideX = heroW + gap;
      const sideW = w - sideX - gap;
      const sh = (h - gap * 4) / 3;
      return [
        { x: gap, y: gap, w: heroW - gap, h: h - gap * 2, rot: 0 },
        { x: sideX, y: gap, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: gap * 2 + sh, w: sideW, h: sh, rot: 0 },
        { x: sideX, y: gap * 3 + sh * 2, w: sideW, h: sh, rot: 0 },
      ];
    }
    case 'bleed':
      return [{ x: 0, y: 0, w, h, rot: 0 }];
    case 'nine': {
      const cw = (w - gap * 4) / 3;
      const ch = (h - gap * 4) / 3;
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          out.push({ x: gap + c * (cw + gap), y: gap + r * (ch + gap), w: cw, h: ch, rot: 0 });
        }
      }
      return out;
    }
    case 'tilted': {
      const pw = w * 0.4;
      const ph = h * 0.58;
      const cy = h * 0.38;
      return [
        { x: w * 0.03, y: cy - ph / 2, w: pw, h: ph, rot: -0.09 },
        { x: w * 0.3, y: cy - ph / 2 - h * 0.02, w: pw, h: ph, rot: 0.02 },
        { x: w * 0.57, y: cy - ph / 2, w: pw, h: ph, rot: 0.08 },
      ];
    }
    default:
      return panelsFor('four', w, h);
  }
}
