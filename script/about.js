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

    // ══ NAVBAR SHRINK ══════════════════════════════════════
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
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