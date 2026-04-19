/* ============================================================
   FiltraLens — Photo Filter Studio
   app.js
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
const state = {
  image:         null,   // original ImageData
  imageW:        0,
  imageH:        0,
  currentFilter: 'original',
  blend:         100,
  vignette:      0,
  grain:         false,
  exportFormat:  'jpeg',
  exportQuality: 90,
  comparing:     false,
  sliders: {
    brightness: 0,
    contrast:   0,
    saturation: 0,
    warmth:     0,
    fade:       0,
  }
};

// ── Filter Definitions ────────────────────────────────────────
const FILTERS = [
  {
    id: 'original', name: 'Original',
    apply: (r, g, b) => [r, g, b]
  },
  {
    id: 'grayscale', name: 'Grayscale',
    apply: (r, g, b) => {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      return [v, v, v];
    }
  },
  {
    id: 'sepia', name: 'Sepia',
    apply: (r, g, b) => [
      Math.min(255, r * 0.393 + g * 0.769 + b * 0.189),
      Math.min(255, r * 0.349 + g * 0.686 + b * 0.168),
      Math.min(255, r * 0.272 + g * 0.534 + b * 0.131),
    ]
  },
  {
    id: 'warm', name: 'Warm',
    apply: (r, g, b) => [
      Math.min(255, r + 30),
      Math.min(255, g + 10),
      Math.max(0,   b - 20),
    ]
  },
  {
    id: 'cool', name: 'Cool',
    apply: (r, g, b) => [
      Math.max(0,   r - 20),
      Math.min(255, g + 10),
      Math.min(255, b + 35),
    ]
  },
  {
    id: 'vintage', name: 'Vintage',
    apply: (r, g, b) => {
      const s = 0.299 * r + 0.587 * g + 0.114 * b;
      return [
        Math.min(255, s * 0.78 + 60),
        Math.min(255, s * 0.66 + 40),
        Math.min(255, s * 0.45 + 25),
      ];
    }
  },
  {
    id: 'noir', name: 'Noir',
    apply: (r, g, b) => {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      const c = Math.min(255, Math.max(0, (v - 128) * 1.6 + 128));
      return [c, c, c];
    }
  },
  {
    id: 'chrome', name: 'Chrome',
    apply: (r, g, b) => {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      const c = Math.min(255, Math.max(0, (v - 128) * 1.3 + 128));
      return [
        Math.min(255, c * 0.95 + r * 0.05),
        Math.min(255, c * 0.95 + g * 0.05),
        Math.min(255, c * 0.95 + b * 0.08),
      ];
    }
  },
  {
    id: 'fade', name: 'Fade',
    apply: (r, g, b) => [
      Math.min(255, r * 0.85 + 30),
      Math.min(255, g * 0.85 + 28),
      Math.min(255, b * 0.85 + 32),
    ]
  },
  {
    id: 'sunset', name: 'Sunset',
    apply: (r, g, b) => [
      Math.min(255, r * 1.1 + 25),
      Math.min(255, g * 0.85 + 5),
      Math.max(0,   b * 0.7),
    ]
  },
  {
    id: 'forest', name: 'Forest',
    apply: (r, g, b) => [
      Math.max(0,   r * 0.8),
      Math.min(255, g * 1.15 + 10),
      Math.max(0,   b * 0.75),
    ]
  },
  {
    id: 'invert', name: 'Invert',
    apply: (r, g, b) => [255 - r, 255 - g, 255 - b]
  },
];

// ── Slider Config ─────────────────────────────────────────────
const SLIDER_CONFIG = [
  { key: 'brightness', label: 'Kecerahan', min: -100, max: 100, def: 0 },
  { key: 'contrast',   label: 'Kontras',   min: -100, max: 100, def: 0 },
  { key: 'saturation', label: 'Saturasi',  min: -100, max: 100, def: 0 },
  { key: 'warmth',     label: 'Kehangatan',min: -50,  max: 50,  def: 0 },
  { key: 'fade',       label: 'Pudar',     min: 0,    max: 100, def: 0 },
];

// ── DOM refs ──────────────────────────────────────────────────
const fileInput     = document.getElementById('fileInput');
const dropZone      = document.getElementById('dropZone');
const uploadSection = document.getElementById('uploadSection');
const studio        = document.getElementById('studio');
const preview       = document.getElementById('preview');
const ctx           = preview.getContext('2d');
const filterGrid    = document.getElementById('filterGrid');
const sliderList    = document.getElementById('sliderList');
const blendInput    = document.getElementById('blendIntensity');
const blendVal      = document.getElementById('blendVal');
const vigInput      = document.getElementById('vignetteAmount');
const vigVal        = document.getElementById('vignetteVal');
const grainToggle   = document.getElementById('grainToggle');
const btnDownload   = document.getElementById('btnDownload');
const btnCopy       = document.getElementById('btnCopyClipboard');
const btnCompare    = document.getElementById('btnCompare');
const btnReset      = document.getElementById('btnReset');
const btnNewPhoto   = document.getElementById('btnNewPhoto');
const btnResetSld   = document.getElementById('btnResetSliders');
const activeLabel   = document.getElementById('activeFilterLabel');
const currentFilter = document.getElementById('currentFilter');
const imgInfo       = document.getElementById('imgInfo');
const qualityRange  = document.getElementById('qualityRange');
const qualityVal    = document.getElementById('qualityVal');
const formatTabs    = document.getElementById('formatTabs');
const toastEl       = document.getElementById('toast');

// ── Init UI ───────────────────────────────────────────────────
function buildFilterGrid() {
  filterGrid.innerHTML = '';
  FILTERS.forEach(f => {
    const card = document.createElement('div');
    card.className = 'filter-card' + (f.id === 'original' ? ' active' : '');
    card.dataset.id = f.id;

    const thumb = document.createElement('canvas');
    thumb.className = 'filter-thumb';
    thumb.width  = 80;
    thumb.height = 80;

    const lbl = document.createElement('span');
    lbl.className = 'filter-name';
    lbl.textContent = f.name;

    card.appendChild(thumb);
    card.appendChild(lbl);
    filterGrid.appendChild(card);

    card.addEventListener('click', () => selectFilter(f.id));
  });
}

function buildSliders() {
  sliderList.innerHTML = '';
  SLIDER_CONFIG.forEach(cfg => {
    const item = document.createElement('div');
    item.className = 'slider-item';
    item.innerHTML = `
      <label class="slider-label">${cfg.label}</label>
      <div class="slider-row">
        <input type="range" class="range-input" id="sl_${cfg.key}"
          min="${cfg.min}" max="${cfg.max}" value="${cfg.def}" step="1"/>
        <span class="slider-val" id="slv_${cfg.key}">${cfg.def}</span>
      </div>`;
    sliderList.appendChild(item);

    const inp = item.querySelector('input');
    const val = item.querySelector('span');
    inp.addEventListener('input', () => {
      state.sliders[cfg.key] = Number(inp.value);
      val.textContent = inp.value;
      renderPreview();
    });
  });
}

buildFilterGrid();
buildSliders();

// ── File Input ────────────────────────────────────────────────
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
  else toast('⚠ File tidak didukung', true);
});

function loadFile(file) {
  if (file.size > 20 * 1024 * 1024) { toast('⚠ File terlalu besar (maks 20MB)', true); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1800, maxH = 1800;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      preview.width  = w;
      preview.height = h;
      state.imageW = w; state.imageH = h;

      ctx.drawImage(img, 0, 0, w, h);
      state.image = ctx.getImageData(0, 0, w, h);

      imgInfo.textContent = `${img.naturalWidth} × ${img.naturalHeight}px · ${(file.size / 1024).toFixed(0)} KB`;
      updateThumbs();
      renderPreview();
      showStudio();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function showStudio() {
  uploadSection.style.display = 'none';
  studio.style.display = 'grid';
}

// ── Thumbnail Update ─────────────────────────────────────────
function updateThumbs() {
  if (!state.image) return;
  const src = state.image.data;

  FILTERS.forEach(f => {
    const card = filterGrid.querySelector(`[data-id="${f.id}"]`);
    if (!card) return;
    const thumb = card.querySelector('canvas');
    const tw = thumb.width, th = thumb.height;
    const tc = thumb.getContext('2d');

    // Downscale original image
    const tmp = document.createElement('canvas');
    tmp.width = tw; tmp.height = th;
    const tc2 = tmp.getContext('2d');
    const tmpFull = document.createElement('canvas');
    tmpFull.width = state.imageW; tmpFull.height = state.imageH;
    tmpFull.getContext('2d').putImageData(state.image, 0, 0);
    tc2.drawImage(tmpFull, 0, 0, tw, th);
    const id = tc2.getImageData(0, 0, tw, th);
    const d = id.data;

    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b] = f.apply(d[i], d[i+1], d[i+2]);
      d[i] = r; d[i+1] = g; d[i+2] = b;
    }
    tc.putImageData(id, 0, 0);
  });
}

// ── Select Filter ─────────────────────────────────────────────
function selectFilter(id) {
  state.currentFilter = id;
  filterGrid.querySelectorAll('.filter-card').forEach(c => {
    c.classList.toggle('active', c.dataset.id === id);
  });
  const name = FILTERS.find(f => f.id === id)?.name || id;
  activeLabel.textContent = name;
  currentFilter.textContent = name;
  renderPreview();
}

// ── Core Render ───────────────────────────────────────────────
function renderPreview() {
  if (!state.image) return;

  const w = state.imageW, h = state.imageH;
  const src = state.image.data;
  const out  = ctx.createImageData(w, h);
  const dst  = out.data;
  const filterFn = FILTERS.find(f => f.id === state.currentFilter)?.apply || ((r,g,b) => [r,g,b]);

  const br = state.sliders.brightness / 100 * 80;
  const co = 1 + state.sliders.contrast / 100;
  const sa = 1 + state.sliders.saturation / 100;
  const wa = state.sliders.warmth;
  const fd = state.sliders.fade / 100 * 60;
  const blend = state.blend / 100;

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i], g = src[i+1], b = src[i+2];
    const a = src[i+3];

    // --- Filter ---
    let [fr, fg, fb] = filterFn(r, g, b);

    // --- Blend with original ---
    if (blend < 1) {
      fr = r + (fr - r) * blend;
      fg = g + (fg - g) * blend;
      fb = b + (fb - b) * blend;
    }

    // --- Fine-tune ---
    // Brightness
    fr += br; fg += br; fb += br;

    // Contrast
    fr = (fr - 128) * co + 128;
    fg = (fg - 128) * co + 128;
    fb = (fb - 128) * co + 128;

    // Saturation
    const lum = 0.299 * fr + 0.587 * fg + 0.114 * fb;
    fr = lum + (fr - lum) * sa;
    fg = lum + (fg - lum) * sa;
    fb = lum + (fb - lum) * sa;

    // Warmth
    fr += wa; fb -= wa * 0.7;

    // Fade
    fr = fr * (1 - fd/255) + 128 * (fd/255);
    fg = fg * (1 - fd/255) + 128 * (fd/255);
    fb = fb * (1 - fd/255) + 128 * (fd/255);

    dst[i]   = clamp(fr);
    dst[i+1] = clamp(fg);
    dst[i+2] = clamp(fb);
    dst[i+3] = a;
  }

  ctx.putImageData(out, 0, 0);

  // --- Vignette ---
  if (state.vignette > 0) applyVignette(ctx, w, h, state.vignette / 100);

  // --- Grain ---
  if (state.grain) applyGrain(ctx, w, h);
}

function clamp(v) { return Math.min(255, Math.max(0, Math.round(v))); }

function applyVignette(c, w, h, strength) {
  const cx = w / 2, cy = h / 2;
  const grd = c.createRadialGradient(cx, cy, Math.min(cx, cy) * 0.4, cx, cy, Math.max(cx, cy) * 1.1);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, `rgba(0,0,0,${strength * 0.85})`);
  c.fillStyle = grd;
  c.fillRect(0, 0, w, h);
}

function applyGrain(c, w, h) {
  const id = c.createImageData(w, h);
  const d = id.data;
  const amt = 28;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() * 2 - 1) * amt;
    d[i] = clamp(n); d[i+1] = clamp(n); d[i+2] = clamp(n); d[i+3] = 60;
  }
  c.putImageData(id, 0, 0);
}

// ── Controls Wiring ───────────────────────────────────────────
blendInput.addEventListener('input', () => {
  state.blend = Number(blendInput.value);
  blendVal.textContent = state.blend + '%';
  renderPreview();
});

vigInput.addEventListener('input', () => {
  state.vignette = Number(vigInput.value);
  vigVal.textContent = state.vignette + '%';
  renderPreview();
});

grainToggle.addEventListener('change', () => {
  state.grain = grainToggle.checked;
  renderPreview();
});

qualityRange.addEventListener('input', () => {
  state.exportQuality = Number(qualityRange.value);
  qualityVal.textContent = state.exportQuality + '%';
});

formatTabs.querySelectorAll('.fmt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    formatTabs.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.exportFormat = btn.dataset.fmt;
  });
});

// ── Reset ─────────────────────────────────────────────────────
btnResetSld.addEventListener('click', () => {
  SLIDER_CONFIG.forEach(cfg => {
    state.sliders[cfg.key] = cfg.def;
    const inp = document.getElementById(`sl_${cfg.key}`);
    const val = document.getElementById(`slv_${cfg.key}`);
    if (inp) { inp.value = cfg.def; val.textContent = cfg.def; }
  });
  renderPreview();
  toast('Sliders direset');
});

btnReset.addEventListener('click', () => {
  selectFilter('original');
  SLIDER_CONFIG.forEach(cfg => {
    state.sliders[cfg.key] = cfg.def;
    const inp = document.getElementById(`sl_${cfg.key}`);
    const val = document.getElementById(`slv_${cfg.key}`);
    if (inp) { inp.value = cfg.def; val.textContent = cfg.def; }
  });
  blendInput.value = 100; blendVal.textContent = '100%'; state.blend = 100;
  vigInput.value = 0; vigVal.textContent = '0%'; state.vignette = 0;
  grainToggle.checked = false; state.grain = false;
  renderPreview();
  toast('Semua direset ke awal');
});

btnNewPhoto.addEventListener('click', () => {
  uploadSection.style.display = '';
  studio.style.display = 'none';
  fileInput.value = '';
  state.image = null;
});

// ── Compare Slider ────────────────────────────────────────────
const compareSlider  = document.getElementById('compareSlider');
const originalLayer  = document.getElementById('originalLayer');
const divider        = document.getElementById('divider');
let   compareDrag    = false;
let   comparePos     = 50; // percent

btnCompare.addEventListener('click', () => {
  state.comparing = !state.comparing;
  btnCompare.classList.toggle('active', state.comparing);
  if (state.comparing) {
    // Show original behind
    originalLayer.width  = state.imageW;
    originalLayer.height = state.imageH;
    originalLayer.getContext('2d').putImageData(state.image, 0, 0);
    originalLayer.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;clip-path:inset(0 ${100-comparePos}% 0 0)`;
    divider.style.left = comparePos + '%';
    compareSlider.style.display = 'flex';
  } else {
    compareSlider.style.display = 'none';
  }
});

divider.addEventListener('mousedown', () => compareDrag = true);
document.addEventListener('mouseup', () => compareDrag = false);
document.addEventListener('mousemove', e => {
  if (!compareDrag || !state.comparing) return;
  const rect = preview.getBoundingClientRect();
  comparePos = Math.max(5, Math.min(95, (e.clientX - rect.left) / rect.width * 100));
  divider.style.left = comparePos + '%';
  originalLayer.style.clipPath = `inset(0 ${100-comparePos}% 0 0)`;
});
divider.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = preview.getBoundingClientRect();
  comparePos = Math.max(5, Math.min(95, (e.touches[0].clientX - rect.left) / rect.width * 100));
  divider.style.left = comparePos + '%';
  originalLayer.style.clipPath = `inset(0 ${100-comparePos}% 0 0)`;
}, { passive: false });

// ── Download ──────────────────────────────────────────────────
btnDownload.addEventListener('click', () => {
  if (!state.image) { toast('⚠ Belum ada foto'); return; }
  const fmt  = state.exportFormat;
  const mime = fmt === 'png' ? 'image/png' : fmt === 'webp' ? 'image/webp' : 'image/jpeg';
  const q    = state.exportQuality / 100;
  const url  = preview.toDataURL(mime, q);
  const a    = document.createElement('a');
  a.href     = url;
  const fname = FILTERS.find(f => f.id === state.currentFilter)?.name || 'filter';
  a.download = `filtralens_${fname.toLowerCase()}_${Date.now()}.${fmt}`;
  a.click();
  toast(`✓ Foto diunduh sebagai .${fmt.toUpperCase()}`);
});

// ── Copy to Clipboard ─────────────────────────────────────────
btnCopy.addEventListener('click', async () => {
  if (!state.image) { toast('⚠ Belum ada foto'); return; }
  try {
    const blob = await new Promise(res => preview.toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('✓ Tersalin ke clipboard!');
  } catch {
    toast('⚠ Browser tidak mendukung clipboard', true);
  }
});

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function toast(msg, err = false) {
  toastEl.textContent = msg;
  toastEl.style.background = err ? '#C4483E' : '#1A1410';
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ── Keyboard shortcut ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!state.image) return;
  if (e.key === 'd' || e.key === 'D') btnDownload.click();
  if (e.key === 'r' || e.key === 'R') btnReset.click();
  if (e.key === 'c' || e.key === 'C') btnCompare.click();
});
