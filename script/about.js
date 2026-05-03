// ══ CURTAIN ════════════════════════════════════════════
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.classList.add('curtain-open');
        setTimeout(() => {
          document.getElementById('pageCurtain').style.display = 'none';
          document.getElementById('curtainLogo').style.display = 'none';
          // Trigger navbar + hero anims
          document.querySelectorAll('header [data-anim], .about-hero [data-anim], .stat-bar[data-anim]')
            .forEach(el => {
              const d = parseInt(el.dataset.delay || 0);
              setTimeout(() => el.classList.add('anim-in'), d);
            });
        }, 950);
      }, 900);
    });

    // ══ HAMBURGER MOBILE NAV ═══════════════════════════════
    const hamburger      = document.getElementById('hamburger');
    const mobileNav      = document.getElementById('mobileNav');
    const mobileBackdrop = document.getElementById('mobileBackdrop');
    const mobileClose    = document.getElementById('mobileClose');
 
    function openMobileNav() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      mobileBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMobileNav() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      mobileBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
 
    hamburger.addEventListener('click', () => {
      mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });
    mobileClose.addEventListener('click', closeMobileNav);
    mobileBackdrop.addEventListener('click', closeMobileNav);
 
    // Tutup dengan ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMobileNav();
    });
 
    // ══ NAVBAR SHRINK ══════════════════════════════════════
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ══ SCROLL ANIMATIONS ══════════════════════════════════
    const scrollEls = document.querySelectorAll('section [data-anim], footer[data-anim]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const d = parseInt(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add('anim-in'), d);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    scrollEls.forEach(el => obs.observe(el));