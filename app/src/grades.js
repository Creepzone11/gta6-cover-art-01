// Colour grades: each one tints the photos with a gradient overlay and a soft
// colour wash, then the renderer adds grain and a vignette on top. Colours are
// chosen per grade so the same photo reads differently under each one.

/**
 * A grade: an overlay gradient (top colour to bottom colour, applied with
 * 'overlay'), a soft-light wash colour and alpha, and a multiply tint.
 */
export const GRADES = {
  sunset: {
    name: 'Vice City Sunset',
    overlayTop: '#ff9a3d',
    overlayBottom: '#e83e8c',
    overlayAlpha: 0.38,
    wash: '#ff7a18',
    washAlpha: 0.16,
    multiply: '#ff8c42',
    multiplyAlpha: 0.10,
    titleFrom: '#ffd166',
    titleTo: '#ff5e8a',
    subtitle: '#7df9ff',
    backdrop: '#2b103f',
  },
  neon: {
    name: 'Neon Pink / Teal',
    overlayTop: '#ff2e88',
    overlayBottom: '#00e5d4',
    overlayAlpha: 0.34,
    wash: '#ff2e88',
    washAlpha: 0.14,
    multiply: '#b5179e',
    multiplyAlpha: 0.12,
    titleFrom: '#ff7ad9',
    titleTo: '#00f5d4',
    subtitle: '#ffe66d',
    backdrop: '#12041f',
  },
  golden: {
    name: 'Golden Hour',
    overlayTop: '#ffc53d',
    overlayBottom: '#ff7a18',
    overlayAlpha: 0.32,
    wash: '#ffb703',
    washAlpha: 0.16,
    multiply: '#e07a1f',
    multiplyAlpha: 0.10,
    titleFrom: '#fff3b0',
    titleTo: '#ff9f1c',
    subtitle: '#ff5e8a',
    backdrop: '#331a05',
  },
  midnight: {
    name: 'Midnight Purple',
    overlayTop: '#7b2fbe',
    overlayBottom: '#1b2a6b',
    overlayAlpha: 0.36,
    wash: '#7b2fbe',
    washAlpha: 0.15,
    multiply: '#3a0ca3',
    multiplyAlpha: 0.14,
    titleFrom: '#c77dff',
    titleTo: '#7df9ff',
    subtitle: '#ffd166',
    backdrop: '#0d0620',
  },
};

export const GRADE_IDS = Object.keys(GRADES);
