// ─── File tree ────────────────────────────────────────────────
const TREE = [
  { name: "100daystodie.txt" },
  { name: "bullit.txt" },
  { name: "cactus-cereal.txt" },
  // { name: "Capria.txt" },
  { name: "Chimera.txt" },
  { name: "convergence.txt" },
  { name: "DANWORKS STEELPIPE MERRYTIME.txt" },
  { name: "Dreams of a Monster.txt" },
  { name: "In Spite of the Blade.txt" },
  { name: "Lost Loop.txt" },
  // { name: "MARTIAN WAR.txt" },
  { name: "messages.txt" },
  { name: "motivational.txt" },
  // { name: "MYDAY=-A.txt" },
  { name: "San Fernando .txt" },
  { name: "sublime-journey.txt" },
  { name: "The Last Accident that caused the end of everything.txt" },
  { name: "The Last King Balthazar.txt" },
  {
    name: "bit::poetry",
    folder: true,
    children: [
      { name: "delot.txt" },
      { name: "HUSTLE.txt" },
      { name: "mile.txt" },
      { name: "SIGNALLOST.txt" },
      { name: "TETRIFIED.txt" },
      { name: "tetre.txt" },
      { name: "understanding the machine.txt" },
      { name: "visage.txt" },
    ]
  }
];

// ─── Elements ─────────────────────────────────────────────────
const win        = document.getElementById('js-win');
const titlebar   = document.getElementById('js-titlebar');
const sidebar    = document.getElementById('js-sidebar');
const btnSidebar = document.getElementById('js-btn-sidebar');
const btnMax     = document.getElementById('js-btn-max');
const maxIcon    = document.getElementById('js-max-icon');

// ─── Window size init ─────────────────────────────────────────
const MIN_W = 420, MIN_H = 300;
let winW = Math.min(1080, window.innerWidth  - 48);
let winH = Math.min(700,  window.innerHeight - 48);

function applySize() {
  win.style.width  = winW + 'px';
  win.style.height = winH + 'px';
}
applySize();

// ─── Drag ─────────────────────────────────────────────────────
let tx = 0, ty = 0;
let drag = null;

titlebar.addEventListener('mousedown', (e) => {
  if (e.target.closest('.titlebar-btns')) return;
  if (isMaximized) return;
  drag = { startX: e.clientX, startY: e.clientY, tx, ty };
});

// ─── Resize ───────────────────────────────────────────────────
let resizing = null;

document.querySelectorAll('.rh').forEach(h => {
  h.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    if (isMaximized) return;
    resizing = {
      dir: h.dataset.dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: win.offsetWidth,
      startH: win.offsetHeight,
    };
    document.body.style.userSelect = 'none';
  });
});

// ─── Shared mousemove / mouseup ───────────────────────────────
document.addEventListener('mousemove', (e) => {
  if (drag) {
    tx = drag.tx + (e.clientX - drag.startX);
    ty = drag.ty + (e.clientY - drag.startY);
    win.style.transform = `translate(${tx}px, ${ty}px)`;
  }
  if (resizing) {
    const dx = e.clientX - resizing.startX;
    const dy = e.clientY - resizing.startY;
    if (resizing.dir.includes('e')) {
      winW = Math.max(MIN_W, resizing.startW + dx);
      win.style.width = winW + 'px';
    }
    if (resizing.dir.includes('s')) {
      winH = Math.max(MIN_H, resizing.startH + dy);
      win.style.height = winH + 'px';
    }
  }
});

document.addEventListener('mouseup', () => {
  drag = null;
  if (resizing) {
    resizing = null;
    document.body.style.userSelect = '';
  }
});

// ─── Sidebar toggle ───────────────────────────────────────────
let sidebarVisible = true;

btnSidebar.addEventListener('mousedown', e => e.stopPropagation());
btnSidebar.addEventListener('click', () => {
  sidebarVisible = !sidebarVisible;
  sidebar.classList.toggle('collapsed', !sidebarVisible);
  btnSidebar.style.color = sidebarVisible ? '' : 'var(--text-1)';
});

// ─── Maximize / Restore ───────────────────────────────────────
let isMaximized = false;
let savedW, savedH, savedTx, savedTy;

const EXPAND_SVG = `<polyline points="1,4.5 1,1 4.5,1"/>
  <polyline points="8.5,1 12,1 12,4.5"/>
  <polyline points="12,8.5 12,12 8.5,12"/>
  <polyline points="4.5,12 1,12 1,8.5"/>`;

const COMPRESS_SVG = `<polyline points="4.5,1 4.5,4.5 1,4.5"/>
  <polyline points="8.5,4.5 12,4.5 12,1"/>
  <polyline points="12,8.5 8.5,8.5 8.5,12"/>
  <polyline points="1,8.5 4.5,8.5 4.5,12"/>`;

btnMax.addEventListener('mousedown', e => e.stopPropagation());
btnMax.addEventListener('click', () => {
  if (!isMaximized) {
    savedW = winW; savedH = winH; savedTx = tx; savedTy = ty;
    winW = window.innerWidth  - 48;
    winH = window.innerHeight - 48;
    tx = 0; ty = 0;
    win.style.transform   = 'translate(0px, 0px)';
    win.style.borderRadius = '8px';
    applySize();
    maxIcon.innerHTML = COMPRESS_SVG;
    btnMax.title = 'Restore';
    isMaximized = true;
  } else {
    winW = savedW; winH = savedH; tx = savedTx; ty = savedTy;
    win.style.transform   = `translate(${tx}px, ${ty}px)`;
    win.style.borderRadius = '';
    applySize();
    maxIcon.innerHTML = EXPAND_SVG;
    btnMax.title = 'Maximize';
    isMaximized = false;
  }
});

// ─── Build sidebar tree ───────────────────────────────────────
const folderState = {};

function buildTree(items, prefix = '') {
  const frag = document.createDocumentFragment();
  for (const item of items) {
    if (item.folder) {
      const wrap = document.createElement('div');
      const hdr  = document.createElement('div');
      hdr.className = 'folder-header';
      hdr.innerHTML = `
        <div class="chevron" id="ch-${CSS.escape(item.name)}">
          <svg viewBox="0 0 8 8"><polyline points="2,1 6,4 2,7"/></svg>
        </div>
        <span class="row-icon">📁</span>
        <span class="row-name">${item.name}</span>`;

      const kids = document.createElement('div');
      kids.className = 'folder-children';
      kids.appendChild(buildTree(item.children, prefix + item.name + '/'));
      hdr.addEventListener('click', () => {
        folderState[item.name] = !folderState[item.name];
        const ch = document.getElementById('ch-' + CSS.escape(item.name));
        ch.classList.toggle('open', folderState[item.name]);
        kids.style.maxHeight = folderState[item.name]
          ? (kids.scrollHeight + 400) + 'px' : '0';
      });
      wrap.appendChild(hdr);
      wrap.appendChild(kids);
      frag.appendChild(wrap);
    } else {
      const path = prefix + item.name;
      const row  = document.createElement('div');
      row.className = 'row';
      row.dataset.path = path;
      row.innerHTML = `<span class="row-icon">📄</span>
                       <span class="row-name">${item.name}</span>`;
      row.addEventListener('click', () => openFile(path, item.name));
      frag.appendChild(row);
    }
  }
  return frag;
}

// ─── Open file ────────────────────────────────────────────────
async function openFile(path, name) {
  document.querySelectorAll('.row').forEach(r => {
    r.classList.toggle('active', r.dataset.path === path);
  });

  const topbar = document.getElementById('js-topbar');
  topbar.style.display = 'flex';
  document.getElementById('js-fname').textContent = name.replace(/\.txt$/, '');
  document.getElementById('js-meta').textContent  = '';
  document.getElementById('js-title').textContent = name;

  const content = document.getElementById('js-content');
  content.innerHTML = '<div class="loading-msg">Loading…</div>';

  try {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(encodedPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const scroll = document.createElement('div');
    scroll.className = 'viewer-scroll';
    const pre = document.createElement('pre');
    pre.className = 'story-text';
    pre.textContent = text;
    scroll.appendChild(pre);
    content.innerHTML = '';
    content.appendChild(scroll);

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    document.getElementById('js-meta').textContent =
      `${words.toLocaleString()} words · ${lines} lines`;
    document.getElementById('js-status-left').textContent = name;

  } catch {
    content.innerHTML = `<div class="error-msg">Could not load "${path}".\n\nServe this folder over HTTP to load files:\n\n    python3 -m http.server 8080\n\nThen open  http://localhost:8080</div>`;
  }
}

// ─── Init tree ────────────────────────────────────────────────
document.getElementById('js-tree').appendChild(buildTree(TREE, 'stories/'));
