// Wires the page: the editor, its controls, and the ?shot= screenshot scenes.
import { createEditor, SIZES } from './editor.js';
import { LAYOUT_IDS, LAYOUT_NAMES } from './layouts.js';
import { GRADE_IDS, GRADES } from './grades.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('preview');
const editor = createEditor(canvas);
const status = document.getElementById('status');

/** Loads an image from a file, resolving to the image once it can be drawn. */
function loadFileImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Builds a row of buttons from an id list, one active at a time. */
function buttonRow(container, ids, names, current, onPick) {
  container.textContent = '';
  ids.forEach((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = names[id] ?? id;
    b.className = id === current ? 'active' : '';
    b.addEventListener('click', () => {
      container.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      onPick(id);
    });
    container.appendChild(b);
  });
}

const layoutRow = document.getElementById('layouts');
buttonRow(layoutRow, LAYOUT_IDS, LAYOUT_NAMES, editor.state.layout, (id) => editor.setLayout(id));

const gradeRow = document.getElementById('grades');
buttonRow(gradeRow, GRADE_IDS, Object.fromEntries(GRADE_IDS.map((id) => [id, GRADES[id].name])), editor.state.grade, (id) => editor.setGrade(id));

const sizeRow = document.getElementById('sizes');
buttonRow(sizeRow, Object.keys(SIZES), Object.fromEntries(Object.values(SIZES).map((s) => [s.id, s.name])), editor.state.size, (id) => editor.setSize(id));

/** The photo thumbnails: click one to put it in the selected panel. */
const thumbs = document.getElementById('thumbs');
function renderThumbs() {
  thumbs.textContent = '';
  editor.state.photos.forEach((p, i) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'thumb';
    t.title = p.name;
    const img = document.createElement('img');
    img.src = p.img.src;
    img.alt = p.name;
    t.appendChild(img);
    t.addEventListener('click', () => editor.assignPhoto(i));
    thumbs.appendChild(t);
  });
}

document.getElementById('addPhotos').addEventListener('click', () => {
  document.getElementById('photoFiles').click();
});

document.getElementById('photoFiles').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const img = await loadFileImage(file);
    editor.addPhoto(img, file.name);
  }
  renderThumbs();
  e.target.value = '';
});

document.querySelectorAll('[data-sample]').forEach((b) => {
  b.addEventListener('click', async () => {
    const name = b.dataset.sample;
    const img = new Image();
    img.src = `samples/${name}.jpg`;
    await img.decode();
    editor.addPhoto(img, name);
    renderThumbs();
  });
});

const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
titleInput.value = editor.state.title;
subtitleInput.value = editor.state.subtitle;
titleInput.addEventListener('input', () => editor.setTitle(titleInput.value));
subtitleInput.addEventListener('input', () => editor.setSubtitle(subtitleInput.value));

document.getElementById('export').addEventListener('click', async () => {
  status.textContent = 'Exporting…';
  const name = await editor.exportPNG((n) => {
    status.textContent = `Saved ${n}`;
  });
  status.textContent = `Saved ${name}`;
});

/** Keeps the title inputs in step when a scene sets the state (the ?shot= mode). */
editor.syncControls = () => {
  titleInput.value = editor.state.title;
  subtitleInput.value = editor.state.subtitle;
  renderThumbs();
};

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), editor).then(() => editor.syncControls());
}
