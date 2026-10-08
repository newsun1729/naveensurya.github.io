(() => {
  'use strict';

  const doc = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const header = document.querySelector('.site-header');
  const toTop = document.getElementById('back-to-top');
  const year = document.getElementById('year');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.project-card[data-category]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link, .mobile-nav-link'));

  // Persist visitor preference. Guard storage for restrictive browsing contexts.
  let preferredTheme = null;
  try { preferredTheme = localStorage.getItem('nv-theme'); } catch (_) { /* private mode */ }
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const setTheme = (theme) => {
    doc.dataset.theme = theme;
    toggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14121d' : '#fbfbff');
  };
  setTheme(preferredTheme === 'light' || preferredTheme === 'dark' ? preferredTheme : (systemDark ? 'dark' : 'light'));
  toggle?.addEventListener('click', () => {
    const next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('nv-theme', next); } catch (_) { /* private mode */ }
  });
  if (year) year.textContent = String(new Date().getFullYear());

  // Filter with native [hidden] so the content remains accessible and indexable.
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const active = button.dataset.filter;
    filterButtons.forEach(b => {
      const selected = b === button;
      b.classList.toggle('is-selected', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => {
      card.hidden = active !== 'all' && card.dataset.category !== active;
    });
  }));

  const updateScrollUI = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
    toTop?.classList.toggle('is-visible', window.scrollY > 520);
  };
  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, {passive: true});

  // Highlight active section in both desktop and mobile navigation.
  if ('IntersectionObserver' in window) {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + visible.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-15% 0px -65% 0px', threshold: [0, .15, .4]});
    sections.forEach(section => observer.observe(section));
  }
})();
