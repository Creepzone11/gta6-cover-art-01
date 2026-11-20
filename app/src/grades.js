// Colour grades: each grade is the set of overlays the renderer paints over the
// photos, plus the colours the title and subtitle are drawn in. All of them are
// our own mixes of a Vice City sunset and neon palette.

export const GRADE_IDS = ['sunset', 'neon', 'golden', 'midnight'];

export const GRADES = {
  sunset: {
    id: 'sunset',
    name: 'Vice City Sunset',
    wash: ['rgba(255,170,80,0)', 'rgba(255,110,90,0.30)', 'rgba(190,40,120,0.55)'],
    tint: 'rgba(255,120,60,0.08)',
    title: ['#ffd166', '#ff5e7a', '#c44dff'],
    subtitle: '#7ef9e2',
  },
  neon: {
    id: 'neon',
    name: 'Neon Pink / Teal',
    wash: ['rgba(0,240,255,0)', 'rgba(255,60,180,0.30)', 'rgba(120,0,160,0.55)'],
    tint: 'rgba(255,40,160,0.08)',
    title: ['#7ef9ff', '#ff7ad9', '#ff2e88'],
    subtitle: '#ffe066',
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    wash: ['rgba(255,220,120,0)', 'rgba(255,180,60,0.28)', 'rgba(200,110,20,0.45)'],
    tint: 'rgba(255,190,80,0.10)',
    title: ['#fff3b0', '#ffb703', '#fb8500'],
    subtitle: '#ffffff',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Purple',
    wash: ['rgba(80,60,200,0)', 'rgba(90,40,180,0.32)', 'rgba(20,8,60,0.60)'],
    tint: 'rgba(90,60,220,0.10)',
    title: ['#c7b9ff', '#8b7cf6', '#5b4bc4'],
    subtitle: '#7ef9e2',
  },
};

/** The grade for an id, falling back to sunset. */
export function gradeById(id) {
  return GRADES[id] ?? GRADES.sunset;
}
