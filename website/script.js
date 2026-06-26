/**
 * Gellert Portfolio — Dark Minimal
 * Static page showcase with manifest-driven gallery.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initMobileMenu();
  initPagesGallery();
});

// ---- Navbar scroll effect ----
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ---- Scroll-triggered reveal ----
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-title, .about-content p, .about-highlights li, .contact-content'
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

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

// ============================================================
// Pages Gallery
// ============================================================
async function initPagesGallery() {
  const grid = document.getElementById('pagesGrid');
  const empty = document.getElementById('pagesEmpty');
  const countEl = document.getElementById('pagesCount');
  if (!grid) return;

  // Load manifest
  let pages = [];
  try {
    const res = await fetch('manifest.json');
    if (res.ok) {
      pages = await res.json();
    }
  } catch (e) {
    console.warn('Failed to load manifest.json, showing empty state');
  }

  // Update count
  if (countEl) {
    countEl.textContent = pages.length === 0
      ? ''
      : `共 ${pages.length} 个页面`;
  }

  // Show empty state
  if (pages.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  // Default sort: newest first
  let sortKey = 'date-desc';
  renderCards(pages, grid, sortKey);

  // Sort controls
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortKey = btn.dataset.sort;
      renderCards(pages, grid, sortKey);
    });
  });
}

function sortPages(pages, key) {
  const sorted = [...pages];
  switch (key) {
    case 'date-desc':
      sorted.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      break;
    case 'date-asc':
      sorted.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      break;
    case 'title':
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'zh-Hans'));
      break;
  }
  return sorted;
}

function renderCards(pages, grid, sortKey) {
  const sorted = sortPages(pages, sortKey);
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');

  grid.innerHTML = sorted.map((page, index) => {
    const fullUrl = baseUrl + page.path;
    const dateStr = formatDate(page.date);
    const hasPreview = page.preview === true;

    return `
      <article class="page-card reveal" style="transition-delay:${index * 50}ms">
        <div class="page-preview">
          ${hasPreview
            ? `<iframe src="${fullUrl}" loading="lazy" title="${escapeHtml(page.title)}"></iframe>`
            : `<div class="page-thumb-fallback">
                 <span class="page-thumb-icon">📄</span>
               </div>`
          }
        </div>
        <div class="page-body">
          <h3 class="page-title">${escapeHtml(page.title)}</h3>
          <p class="page-desc">${escapeHtml(page.description || '')}</p>
          <div class="page-footer">
            <span class="page-date">${dateStr}</span>
            <div class="page-share">
              <button class="copy-btn" data-url="${escapeHtml(fullUrl)}" title="复制链接">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <a href="${fullUrl}" target="_blank" rel="noopener" class="page-link">打开 →</a>
            </div>
          </div>
        </div>
      </article>`;
  }).join('');

  // Init copy buttons
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        btn.classList.add('copied');
        btn.title = '已复制';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.title = '复制链接';
        }, 2000);
      } catch {
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });

  // Observe new cards for reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05 });

  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // Supports YYYY-MM-DD or ISO
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
