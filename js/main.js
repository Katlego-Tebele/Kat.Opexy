/**
 * Epoxy Flooring — Main JavaScript
 * Handles: welcome screen, navbar, hamburger menu,
 *          scroll animations, gallery lightbox, smooth scroll
 */

'use strict';

/* ============================================================
   1. WELCOME / LOADING SCREEN
   ============================================================ */
(function initWelcomeScreen() {
  const screen = document.getElementById('welcome-screen');
  if (!screen) return;

  // Total welcome duration: ~1.4s (animations finish ~1.25s, then fade out)
  const DISPLAY_DURATION = 1400;

  function dismiss() {
    screen.classList.add('hidden');
    document.body.style.overflow = '';

    // Remove from DOM after fade-out transition (0.6s)
    screen.addEventListener('transitionend', () => {
      screen.remove();
    }, { once: true });
  }

  // Prevent scroll while welcome screen is visible
  document.body.style.overflow = 'hidden';

  // Dismiss after duration
  setTimeout(dismiss, DISPLAY_DURATION);

  // Also dismiss immediately if user taps/clicks the screen
  screen.addEventListener('click', dismiss, { once: true });
  screen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') dismiss();
  });
})();


/* ============================================================
   2. NAVBAR — SCROLL STATE & ACTIVE LINK
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let ticking = false;

  function updateNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Set active nav link based on scroll position
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let current = '';
    const scrollMid = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      if (section.offsetTop <= scrollMid) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ============================================================
   3. HAMBURGER / MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';

    // Hide after transition
    setTimeout(() => {
      if (!isOpen) mobileMenu.style.display = '';
    }, 400);
  }

  function toggleMenu() {
    if (isOpen) closeMenu();
    else openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close when a mobile nav link is clicked
  mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on backdrop click (outside the nav panel)
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close menu when viewport goes above tablet breakpoint
  const mql = window.matchMedia('(min-width: 1025px)');
  mql.addEventListener('change', (e) => {
    if (e.matches && isOpen) closeMenu();
  });
})();


/* ============================================================
   4. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
   ============================================================ */
(function initScrollAnimations() {
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach((el) => {
      el.classList.add('visible');
    });
    return;
  }

  const THRESHOLD = 0.15;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: THRESHOLD, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach((el) => {
    observer.observe(el);
  });
})();


/* ============================================================
   5. GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxCap  = document.getElementById('lightbox-caption');
  const closeBtn     = document.getElementById('lightbox-close');
  const prevBtn      = document.getElementById('lightbox-prev');
  const nextBtn      = document.getElementById('lightbox-next');
  const galleryBtns  = document.querySelectorAll('.gallery-btn');

  if (!lightbox || !lightboxImg) return;

  // Build data array from gallery buttons
  const images = Array.from(galleryBtns).map((btn) => {
    const img = btn.querySelector('.gallery-img');
    const cap = btn.querySelector('.gallery-caption');
    return {
      src: img ? img.src : '',
      alt: img ? img.alt : '',
      caption: cap ? cap.textContent.trim() : '',
    };
  });

  let currentIndex = 0;
  let previouslyFocused = null;

  function showImage(index) {
    // Wrap around
    currentIndex = ((index % images.length) + images.length) % images.length;
    const item = images[currentIndex];

    lightboxImg.src   = item.src;
    lightboxImg.alt   = item.alt;
    lightboxCap.textContent = item.caption;

    // Update prev/next button labels
    prevBtn.setAttribute('aria-label', `Previous image (${((currentIndex - 1 + images.length) % images.length) + 1} of ${images.length})`);
    nextBtn.setAttribute('aria-label', `Next image (${(currentIndex + 1) % images.length + 1} of ${images.length})`);
  }

  function openLightbox(index) {
    previouslyFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (previouslyFocused) previouslyFocused.focus();
  }

  function prev() { showImage(currentIndex - 1); }
  function next() { showImage(currentIndex + 1); }

  // Open on gallery button click
  galleryBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => openLightbox(idx));
  });

  // Controls
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Click backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    switch (e.key) {
      case 'Escape':    closeLightbox(); break;
      case 'ArrowLeft': prev(); break;
      case 'ArrowRight': next(); break;
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  }, { passive: true });

  // Trap focus inside lightbox when open
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();


/* ============================================================
   6. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
(function initSmoothScroll() {
  // Offset for fixed navbar height
  const NAVBAR_HEIGHT = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#!') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });

      // Update URL without triggering scroll
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });
})();


/* ============================================================
   7. NAVBAR ACTIVE LINK HIGHLIGHT (CSS helper)
   ============================================================ */
(function injectActiveNavStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active {
      color: #ffffff !important;
      background: rgba(255,255,255,0.12) !important;
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   8. LOGO FALLBACK — ensure text logo shows if image missing
   ============================================================ */
(function initLogoFallbacks() {
  const logoImages = document.querySelectorAll(
    '.nav-logo-img, .welcome-logo-img, .footer-logo-img'
  );

  logoImages.forEach((img) => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      // Show sibling fallback element if present
      const fallback = this.parentElement.querySelector(
        '.nav-logo-fallback, .welcome-logo-fallback, .footer-logo-fallback'
      );
      if (fallback) fallback.style.display = 'flex';
    });
  });
})();


/* ============================================================
   9. PARALLAX EFFECT — subtle hero image movement on scroll
   ============================================================ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.scrollY;
    const limit    = window.innerHeight;

    if (scrolled <= limit) {
      heroImg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   10. GALLERY IMAGE PLACEHOLDER — show styled fallback
       if a gallery image fails to load
   ============================================================ */
(function initImageFallbacks() {
  const galleryImages = document.querySelectorAll('.gallery-img, .about-photo, .showcase-strip-img img');

  galleryImages.forEach((img) => {
    img.addEventListener('error', function () {
      // Apply a gradient placeholder
      const parent = this.parentElement;
      if (!parent) return;

      this.style.opacity = '0';

      parent.style.background = `
        linear-gradient(
          135deg,
          #1e4488 0%,
          #267ae8 40%,
          #3b97f3 70%,
          #93d0fc 100%
        )
      `;

      // Show a subtle "placeholder" label
      if (!parent.querySelector('.img-placeholder-label')) {
        const label = document.createElement('span');
        label.className = 'img-placeholder-label';
        label.setAttribute('aria-hidden', 'true');
        label.style.cssText = `
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: Inter, sans-serif;
        `;
        label.textContent = 'Photo Coming Soon';
        parent.style.position = 'relative';
        parent.appendChild(label);
      }
    });
  });
})();


/* ============================================================
   11. HERO BACKGROUND FALLBACK — if hero.jpg not found
   ============================================================ */
(function initHeroBgFallback() {
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;

  heroImg.addEventListener('error', function () {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      heroBg.style.background = `
        linear-gradient(
          135deg,
          #081629 0%,
          #0f2244 35%,
          #1e4488 65%,
          #267ae8 100%
        )
      `;
    }
    this.style.display = 'none';
  });
})();
