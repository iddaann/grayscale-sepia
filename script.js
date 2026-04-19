  let currentMode = 'sepia';
  let currentView = 'single';
  let originalImageData = null;
  let loadedImage = null;
  let imgW = 0, imgH = 0;

  const sepiaMatrix = [
    0.393, 0.769, 0.189,
    0.349, 0.686, 0.168,
    0.272, 0.534, 0.131
  ];

  const grayscaleMatrix = [
    0.2126, 0.7152, 0.0722,
    0.2126, 0.7152, 0.0722,
    0.2126, 0.7152, 0.0722
  ];

  function det3(m) {
    return (
      m[0]*(m[4]*m[8]-m[5]*m[7]) -
      m[1]*(m[3]*m[8]-m[5]*m[6]) +
      m[2]*(m[3]*m[7]-m[4]*m[6])
    );
  }

  function updateMatrixDisplay(mode, intensity) {
    const base = mode === 'sepia' ? sepiaMatrix : grayscaleMatrix;
    const t = intensity / 100;
    const ident = [1,0,0, 0,1,0, 0,0,1];
    const m = base.map((v, i) => v*t + ident[i]*(1-t));
    const d = det3(m);

    const fmt = v => v.toFixed(3).padStart(6);
    document.getElementById('matrix-display').innerHTML =
      `[ ${fmt(m[0])}  ${fmt(m[1])}  ${fmt(m[2])} ]<br>` +
      `[ ${fmt(m[3])}  ${fmt(m[4])}  ${fmt(m[5])} ]<br>` +
      `[ ${fmt(m[6])}  ${fmt(m[7])}  ${fmt(m[8])} ]`;

    document.getElementById('det-value').textContent = d.toFixed(6);
    document.getElementById('stat-det').textContent = d.toFixed(4);

    const barPct = Math.min(Math.abs(d) * 200, 100);
    document.getElementById('det-bar').style.width = barPct + '%';
    return m;
  }

  function applyFilterToCanvas(targetCanvas, imageData, mode, intensity, brightness, contrast, vignetteAmt) {
    const t = intensity / 100;
    const brt = brightness / 100;
    const crt = contrast / 100;
    const base = mode === 'sepia' ? sepiaMatrix : grayscaleMatrix;
    const ident = [1,0,0, 0,1,0, 0,0,1];
    const m = base.map((v, i) => v*t + ident[i]*(1-t));

    targetCanvas.width = imgW;
    targetCanvas.height = imgH;
    const ctx2 = targetCanvas.getContext('2d');
    const newData = ctx2.createImageData(imgW, imgH);
    const src = imageData.data;
    const dst = newData.data;
    const cx = imgW / 2;
    const cy = imgH / 2;
    const maxDist = Math.sqrt(cx*cx + cy*cy);
    const vScale = vignetteAmt / 100;

    for (let i = 0; i < src.length; i += 4) {
      let r = src[i]/255, g = src[i+1]/255, b = src[i+2]/255;

      // Contrast
      r = (r - 0.5) * crt + 0.5;
      g = (g - 0.5) * crt + 0.5;
      b = (b - 0.5) * crt + 0.5;

      // Matrix transform
      const nr = m[0]*r + m[1]*g + m[2]*b;
      const ng = m[3]*r + m[4]*g + m[5]*b;
      const nb = m[6]*r + m[7]*g + m[8]*b;

      // Brightness
      let fr = Math.max(0, Math.min(1, nr * brt));
      let fg = Math.max(0, Math.min(1, ng * brt));
      let fb = Math.max(0, Math.min(1, nb * brt));

      // Vignette
      if (vScale > 0) {
        const px = (i/4) % imgW;
        const py = Math.floor((i/4) / imgW);
        const dist = Math.sqrt((px-cx)**2 + (py-cy)**2) / maxDist;
        const v = 1 - vScale * dist * dist * 1.4;
        fr *= v; fg *= v; fb *= v;
      }

      dst[i]   = Math.round(Math.max(0, Math.min(255, fr * 255)));
      dst[i+1] = Math.round(Math.max(0, Math.min(255, fg * 255)));
      dst[i+2] = Math.round(Math.max(0, Math.min(255, fb * 255)));
      dst[i+3] = src[i+3];
    }
    ctx2.putImageData(newData, 0, 0);
  }

  function updateFilter() {
    if (!originalImageData) return;
    const intensity = parseInt(document.getElementById('intensity').value);
    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);
    const vignette = parseInt(document.getElementById('vignette').value);

    document.getElementById('intensity-val').textContent = intensity + '%';
    document.getElementById('brightness-val').textContent = brightness + '%';
    document.getElementById('contrast-val').textContent = contrast + '%';
    document.getElementById('vignette-val').textContent = vignette + '%';

    updateMatrixDisplay(currentMode, intensity);

    if (currentView === 'single') {
      const cv = document.getElementById('preview-canvas');
      applyFilterToCanvas(cv, originalImageData, currentMode, intensity, brightness, contrast, vignette);
    } else {
      const fc = document.getElementById('filtered-canvas');
      applyFilterToCanvas(fc, originalImageData, currentMode, intensity, brightness, contrast, vignette);
      const oc = document.getElementById('orig-canvas');
      oc.width = imgW;
      oc.height = imgH;
      oc.getContext('2d').putImageData(originalImageData, 0, 0);
    }
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.getElementById('mode-badge').textContent = mode === 'sepia' ? 'Sepia' : 'Grayscale';
    document.getElementById('stat-mode').textContent = mode === 'sepia' ? 'Sepia' : 'Grayscale';
    document.getElementById('compare-label-text').textContent = mode === 'sepia' ? 'Sepia' : 'Grayscale';
    updateFilter();
  }

  function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    const cv = document.getElementById('preview-canvas');
    const cw = document.getElementById('compare-wrap');

    if (view === 'single') {
      cv.style.display = 'block';
      cw.style.display = 'none';
    } else {
      cv.style.display = 'none';
      cw.style.display = 'grid';
    }

    if (originalImageData) updateFilter();
  }

  function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('loading-state').style.display = 'flex';

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        imgW = img.width;
        imgH = img.height;

        const hc = document.getElementById('original-canvas-hidden');
        hc.width = imgW;
        hc.height = imgH;
        hc.getContext('2d').drawImage(img, 0, 0);
        originalImageData = hc.getContext('2d').getImageData(0, 0, imgW, imgH);

        document.getElementById('stat-size').textContent = `${imgW} × ${imgH}`;
        document.getElementById('stat-mode').textContent = currentMode === 'sepia' ? 'Sepia' : 'Grayscale';

        document.getElementById('loading-state').style.display = 'none';
        if (currentView === 'single') document.getElementById('preview-canvas').style.display = 'block';

        document.getElementById('stats-bar').style.display = 'flex';
        document.getElementById('download-btn').style.display = 'inline-flex';

        updateFilter();
        showToast('Foto berhasil dimuat!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadImage() {
    if (!originalImageData) { showToast('Unggah foto terlebih dahulu.'); return; }
    const src = currentView === 'single'
      ? document.getElementById('preview-canvas')
      : document.getElementById('filtered-canvas');
    const link = document.createElement('a');
    link.download = `filterlens-${currentMode}.png`;
    link.href = src.toDataURL('image/png');
    link.click();
    showToast('Foto diunduh sebagai PNG!');
  }

  function resetAll() {
    document.getElementById('intensity').value = 100;
    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('vignette').value = 0;
    document.getElementById('intensity-val').textContent = '100%';
    document.getElementById('brightness-val').textContent = '100%';
    document.getElementById('contrast-val').textContent = '100%';
    document.getElementById('vignette-val').textContent = '0%';
    setMode('sepia');
    if (originalImageData) updateFilter();
    showToast('Pengaturan direset.');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }

  // File input
  document.getElementById('file-input').addEventListener('change', e => {
    loadImage(e.target.files[0]);
  });

  // Drag & drop
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    loadImage(e.dataTransfer.files[0]);
  });

  // Paste from clipboard
  document.addEventListener('paste', e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        loadImage(item.getAsFile());
        break;
      }
    }
  });

  // Init matrix display
  updateMatrixDisplay('sepia', 100);