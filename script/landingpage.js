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