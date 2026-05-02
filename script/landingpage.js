    // ══ INTRO CURTAIN ══════════════════════════════════════
    window.addEventListener('load', () => {
      // Tunggu sebentar lalu buka curtain
      setTimeout(() => {
        document.body.classList.add('curtain-open');

        // Setelah curtain hilang, trigger navbar + hero animations
        setTimeout(() => {
          document.getElementById('pageCurtain').style.display = 'none';
          document.getElementById('curtainLogo').style.display = 'none';
          triggerInitialAnims();
        }, 950);
      }, 900);
    });

    // Trigger animasi navbar + hero setelah curtain selesai
    function triggerInitialAnims() {
      const initial = document.querySelectorAll('header [data-anim], .hero [data-anim]');
      initial.forEach(el => {
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('anim-in'), delay);
      });
    }

    // ══ NAVBAR SHRINK ══════════════════════════════════════
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ══ SCROLL ANIMATIONS ══════════════════════════════════
    // Only observe elements NOT in header or hero (those fire on load)
    const scrollAnimEls = document.querySelectorAll(
      'section:not(.hero) [data-anim], footer[data-anim]'
    );

    const animObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.delay || 0);
          setTimeout(() => el.classList.add('anim-in'), delay);
          animObs.unobserve(el); // fire once only
        }
      });
    }, { threshold: 0.12 });

    scrollAnimEls.forEach(el => animObs.observe(el));

    // ══ BEFORE / AFTER SLIDER ══════════════════════════════
    const baWrapper  = document.getElementById('baWrapper');
    const baFiltered = document.getElementById('baFiltered');
    const baDivider  = document.getElementById('baDivider');
    const baLabelL   = document.getElementById('baLabelL');
    const baTabs     = document.getElementById('baTabs');

    let dragging = false;
    let pos = 50;

    function setPos(x) {
      const rect = baWrapper.getBoundingClientRect();
      pos = Math.max(3, Math.min(97, (x - rect.left) / rect.width * 100));
      baFiltered.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      baDivider.style.left      = pos + '%';
    }

    baWrapper.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
    document.addEventListener('mouseup',   ()  => { dragging = false; });
    document.addEventListener('mousemove', e  => { if (dragging) setPos(e.clientX); });

    baWrapper.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('touchend',   ()  => { dragging = false; });
    baWrapper.addEventListener('touchmove',  e  => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

    baTabs.querySelectorAll('.ba-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        baTabs.querySelectorAll('.ba-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        baFiltered.className = 'ba-filtered ' + tab.dataset.filter;
        baLabelL.textContent = tab.textContent;
        pos = 50;
        baFiltered.style.clipPath = `inset(0 50% 0 0)`;
        baDivider.style.left = '50%';
      });
    });

    (function() {
      const track    = document.getElementById('carouselTrack');
      const wrap     = document.getElementById('carouselWrap');
      const btnPrev  = document.getElementById('carouselPrev');
      const btnNext  = document.getElementById('carouselNext');
      const dotsWrap = document.getElementById('carouselDots');
      const progress = document.getElementById('carouselProgress');
 
      if (!track) return;
 
      const items     = track.querySelectorAll('.showcase-item');
      const ITEM_W    = 240 + 20; // card width + gap
      const VISIBLE   = Math.floor(window.innerWidth / ITEM_W) || 3;
      const MAX_IDX   = Math.max(0, items.length - VISIBLE);
      let   current   = 0;
      let   autoTimer = null;
 
      // Build dots
      const DOTS = Math.ceil(items.length / VISIBLE);
      for (let i = 0; i < DOTS; i++) {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i * VISIBLE));
        dotsWrap.appendChild(d);
      }
 
      function updateDots() {
        const idx = Math.round(current / VISIBLE);
        dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === idx);
        });
      }
 
      function updateProgress() {
        const pct = MAX_IDX === 0 ? 100 : (current / MAX_IDX) * 100;
        progress.style.width = pct + '%';
      }
 
      function goTo(idx) {
        current = Math.max(0, Math.min(idx, MAX_IDX));
        track.style.transform = `translateX(-${current * ITEM_W}px)`;
        btnPrev.disabled = current === 0;
        btnNext.disabled = current >= MAX_IDX;
        updateDots();
        updateProgress();
      }
 
      btnPrev.addEventListener('click', () => { goTo(current - VISIBLE); resetAuto(); });
      btnNext.addEventListener('click', () => { goTo(current + VISIBLE); resetAuto(); });
 
      // Auto-play every 3s
      function startAuto() {
        autoTimer = setInterval(() => {
          goTo(current >= MAX_IDX ? 0 : current + 1);
        }, 3000);
      }
      function resetAuto() {
        clearInterval(autoTimer);
        startAuto();
      }
      startAuto();
 
      // Drag / swipe
      let dragStart = null;
      let trackStart = 0;
      wrap.addEventListener('mousedown', e => { dragStart = e.clientX; trackStart = current; });
      document.addEventListener('mouseup', e => {
        if (dragStart === null) return;
        const diff = dragStart - e.clientX;
        if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
        dragStart = null;
        resetAuto();
      });
      wrap.addEventListener('touchstart', e => { dragStart = e.touches[0].clientX; }, { passive: true });
      wrap.addEventListener('touchend', e => {
        if (dragStart === null) return;
        const diff = dragStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
        dragStart = null;
        resetAuto();
      });
 
      // Pause on hover
      wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
      wrap.addEventListener('mouseleave', () => startAuto());
 
      goTo(0); // init
    })();