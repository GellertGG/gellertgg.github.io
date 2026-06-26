/**
 * Gellert Portfolio — Dark Minimal
 * Vanilla JS, no frameworks.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initMobileMenu();
  initProjectCards();
});

// ---- Navbar scroll effect ----
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

// ---- Scroll-triggered reveal ----
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-title, .about-content p, .about-highlights li, .project-card, .skill-category, .contact-content'
  );

  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

// ---- Mobile menu ----
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

// ---- Project card mouse tracking ----
function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}
