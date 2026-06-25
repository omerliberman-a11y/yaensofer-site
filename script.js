/* =================================================================
   Dr. Yaen Sofer — interactions
   Vanilla JS, no dependencies. Progressive enhancement only.
   ================================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Current year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header shadow ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');

  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const show = (el) => el.classList.add('is-visible');
  const showAll = () => revealEls.forEach(show);

  // Reveal instantly when animation is unwanted or unobservable:
  // reduced motion, no IntersectionObserver, or the page opened in a background
  // tab (where IO won't fire — we want content ready the moment it's viewed).
  if (reduceMotion || !('IntersectionObserver' in window) || document.hidden) {
    showAll();
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = Math.min(i * 60, 240); // small stagger for sibling groups
            setTimeout(() => show(entry.target), delay);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));

    // Failsafe: content must never stay permanently hidden if IO misbehaves.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) showAll(); }, { once: true });
    window.setTimeout(showAll, 5000);
  }

  /* ---------- Card spotlight follows cursor ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Contact form (no backend) ---------- */
  // Opens the visitor's mail client with a prefilled message addressed to the real inbox.
  // To deliver server-side instead (no mail client needed), swap this for a Formspree/Web3Forms endpoint.
  const CONTACT_EMAIL = 'contact@yaensofer.com';

  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');

  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const topic = (data.get('topic') || '').toString().trim();

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message) {
        note.textContent = 'נא למלא שם, דוא״ל תקין ותיאור קצר.';
        note.classList.add('is-error');
        return;
      }

      note.classList.remove('is-error');
      note.textContent = 'תודה! נפתח חלון דוא״ל לשליחת הפנייה…';

      const subject = encodeURIComponent(`פנייה מהאתר — ${topic || 'כללי'} — ${name}`);
      const body = encodeURIComponent(
        `שם: ${name}\nדוא״ל: ${email}\nנושא: ${topic}\n\n${message}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      form.reset();
    });
  }
})();
