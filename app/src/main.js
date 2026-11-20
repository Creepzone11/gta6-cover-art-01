// Wires the page: builds the pickers, loads photos, keeps the preview live,
// exports the PNG. A `?shot=` query sets up a fixed scene for a screenshot
// instead (./shots.js).

import { Editor, loadImage } from './editor.js';
import { LAYOUTS, LAYOUT_IDS, SIZES } from './layouts.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { loadFonts } from './fonts.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const editor = new Editor(canvas);

function buildPicker(el, items, active, onPick) {
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    if (item.id === active) b.classList.add('active');
    b.addEventListener('click', () => {
      el.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      onPick(item.id);
    });
    el.appendChild(b);
  }
}

function buildLayoutPicker() {
  buildPicker(
    document.getElementById('layouts'),
    LAYOUT_IDS.map((id) => ({ id, label: LAYOUTS[id].name })),
    editor.layoutId,
    (id) => editor.setLayout(id),
  );
}

function buildGradePicker() {
  buildPicker(
    document.getElementById('grades'),
    GRADE_IDS.map((id) => ({ id, label: GRADES[id].name })),
    editor.gradeId,
    (id) => editor.setGrade(id),
  );
}

function buildSizePicker() {
  buildPicker(
    document.getElementById('sizes'),
    SIZES.map((s) => ({ id: s.id, label: s.label })),
    editor.sizeId,
    (id) => editor.setSize(id),
  );
}

/** Rebuilds the photo thumbnail strip; clicking a thumb assigns it to the
 *  selected panel. */
function renderThumbs() {
  const strip = document.getElementById('thumbs');
  strip.innerHTML = '';
  editor.photos.forEach((img, i) => {
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = editor.photoNames[i] || `Photo ${i + 1}`;
    thumb.title = editor.photoNames[i] || `Photo ${i + 1}`;
    const assigned = editor.panels[editor.selected] && editor.panels[editor.selected].photo === i;
    if (assigned) thumb.classList.add('assigned');
    thumb.addEventListener('click', () => {
      editor.assignToSelected(i);
      renderThumbs();
    });
    strip.appendChild(thumb);
  });
}

/** Syncs the controls with the editor state (title, subtitle, active picker
 *  buttons), so a state set in code — e.g. a ?shot= scene — shows correctly. */
function syncControls() {
  // Only write a field when it differs, so typing in it never moves the caret.
  const titleInput = document.getElementById('title');
  if (titleInput.value !== editor.title) titleInput.value = editor.title;
  const subtitleInput = document.getElementById('subtitle');
  if (subtitleInput.value !== editor.subtitle) subtitleInput.value = editor.subtitle;
  const mark = (el, active) => {
    el.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.textContent === active);
    });
  };
  mark(document.getElementById('layouts'), LAYOUTS[editor.layoutId].name);
  mark(document.getElementById('grades'), GRADES[editor.gradeId].name);
  const size = SIZES.find((s) => s.id === editor.sizeId);
  if (size) mark(document.getElementById('sizes'), size.label);
}

editor.onchange = () => { renderThumbs(); syncControls(); };

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  await editor.addPhotos(files);
  status.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} loaded.`;
});

document.querySelectorAll('[data-sample]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const name = btn.dataset.sample;
    await editor.addPhotos([{ url: `samples/${name}.jpg`, name }]);
    status.textContent = `Sample "${name}" loaded.`;
  });
});

document.getElementById('title').addEventListener('input', (e) => {
  editor.title = e.target.value;
  editor.redraw();
});
document.getElementById('subtitle').addEventListener('input', (e) => {
  editor.subtitle = e.target.value;
  editor.redraw();
});
document.getElementById('export').addEventListener('click', async () => {
  const name = await editor.exportPng();
  status.textContent = `Saved ${name}`;
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
buildLayoutPicker();
buildGradePicker();
buildSizePicker();
editor.bindPointer();

if (shot) {
  await loadFonts();
  await runShot(shot, query, editor);
  renderThumbs();
} else {
  await loadFonts();
  await editor.addPhotos([{ url: 'samples/pier.jpg', name: 'pier' }]);
  renderThumbs();
}
