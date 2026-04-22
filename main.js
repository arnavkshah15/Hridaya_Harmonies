/* ════════════════════════════════════════════════
   HRIDAYA HARMONIES — MAIN JAVASCRIPT
   ════════════════════════════════════════════════ */

'use strict';

/* ── NAVBAR SCROLL BEHAVIOR ─────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── HERO BACKGROUND KEN BURNS ─────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  const img = new Image();
  img.src = 'hero_bg.png';
  img.onload = () => heroBg.classList.add('loaded');
}

/* ── STAT COUNTER ANIMATION ─────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1600;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counters = document.querySelectorAll('.stat-number[data-target]');
if (counters.length) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));
}

/* ── SCROLL REVEAL ───────────────────────────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .process-step, .testimonial-card, .portfolio-item, .reel-card, .youtube-card, .sidebar-card, .service-detail'
);
if (revealEls.length) {
  revealEls.forEach(el => el.classList.add('fade-in-up'));
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay
        entry.target.style.transitionDelay = `${(i % 6) * 0.1}s`;
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));
}

/* ── CUSTOM VIDEO PLAYER ─────────────────────────── */
function initVideoPlayer(videoEl, playBtn, overlay, controls, progressWrap, progressBar, timeEl, muteBtn, fullscreenBtn, playPauseBtn) {
  if (!videoEl) return;

  // Play/Pause toggle
  function togglePlay() {
    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  }

  if (overlay)  overlay.addEventListener('click', togglePlay);
  if (playBtn)  playBtn.addEventListener('click', togglePlay);
  if (playPauseBtn) playPauseBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

  videoEl.addEventListener('play', () => {
    if (overlay)  overlay.classList.add('hidden');
    if (playPauseBtn) {
      playPauseBtn.querySelector('.icon-play')?.classList.add('hidden');
      playPauseBtn.querySelector('.icon-pause')?.classList.remove('hidden');
    }
  });
  videoEl.addEventListener('pause', () => {
    if (overlay) overlay.classList.remove('hidden');
    if (playPauseBtn) {
      playPauseBtn.querySelector('.icon-play')?.classList.remove('hidden');
      playPauseBtn.querySelector('.icon-pause')?.classList.add('hidden');
    }
  });
  videoEl.addEventListener('ended', () => {
    if (overlay) overlay.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '0%';
  });

  // Progress
  videoEl.addEventListener('timeupdate', () => {
    if (!videoEl.duration) return;
    const pct = (videoEl.currentTime / videoEl.duration) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
    if (timeEl) timeEl.textContent = `${fmt(videoEl.currentTime)} / ${fmt(videoEl.duration)}`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(pct));
  });

  if (progressWrap) {
    progressWrap.addEventListener('click', (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      videoEl.currentTime = pct * videoEl.duration;
    });
  }

  // Mute
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => { e.stopPropagation(); videoEl.muted = !videoEl.muted; });
    videoEl.addEventListener('volumechange', () => {
      const volPath = muteBtn.querySelector('.icon-vol');
      if (volPath) volPath.style.opacity = videoEl.muted ? '0.2' : '1';
    });
  }

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = videoEl.closest('.video-wrapper') || videoEl.parentElement;
      if (!document.fullscreenElement) {
        wrap.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// Featured player on home page
initVideoPlayer(
  document.getElementById('featuredVideoPlayer'),
  document.getElementById('featuredPlayBtn'),
  document.getElementById('featuredVideoOverlay'),
  document.getElementById('featuredControls'),
  document.getElementById('vcProgressWrap'),
  document.getElementById('vcProgressBar'),
  document.getElementById('vcTime'),
  document.getElementById('vcMute'),
  document.getElementById('vcFullscreen'),
  document.getElementById('vcPlayPause')
);

/* ── REEL SWITCHER ───────────────────────────────── */
const reelCards = document.querySelectorAll('.reel-card');
const mainVideoEl = document.getElementById('featuredVideoPlayer');
const mainOverlay = document.getElementById('featuredVideoOverlay');
const mainTitle  = document.querySelector('.video-info h3');
const mainTag    = document.querySelector('.video-info .video-tag');
const mainDesc   = document.querySelector('.video-info p');

reelCards.forEach(card => {
  card.addEventListener('click', () => {
    if (!mainVideoEl) return;
    reelCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const src  = card.getAttribute('data-src');
    const title= card.getAttribute('data-title');
    const tag  = card.getAttribute('data-tag');
    const desc = card.getAttribute('data-desc');
    mainVideoEl.pause();
    mainVideoEl.src = src;
    mainVideoEl.load();
    if (mainTitle) mainTitle.textContent = title;
    if (mainTag)   mainTag.textContent = tag;
    if (mainDesc)  mainDesc.textContent = desc;
    if (mainOverlay) mainOverlay.classList.remove('hidden');
  });
});



/* ── FOOTER YEAR ─────────────────────────────────── */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ── PORTFOLIO TABS FILTER ───────────────────────── */
const tabBtns = document.querySelectorAll('.portfolio-tab');
const portfolioItems = document.querySelectorAll('.portfolio-item');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    portfolioItems.forEach(item => {
      const cat = item.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        item.removeAttribute('data-hide');
        item.style.display = '';
      } else {
        item.setAttribute('data-hide', 'true');
        item.style.display = 'none';
      }
    });
  });
});

/* ── VIDEO LIGHTBOX ──────────────────────────────── */
const lightbox = document.getElementById('lightbox');
const lightboxVideo = document.getElementById('lightboxVideo');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc  = document.getElementById('lightboxDesc');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('[data-lightbox-src]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    if (!lightbox || !lightboxVideo) return;
    lightboxVideo.src = trigger.getAttribute('data-lightbox-src');
    if (lightboxTitle) lightboxTitle.textContent = trigger.getAttribute('data-lightbox-title') || '';
    if (lightboxDesc)  lightboxDesc.textContent  = trigger.getAttribute('data-lightbox-desc')  || '';
    lightbox.classList.add('open');
    lightboxVideo.play().catch(() => {});
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  if (!lightbox || !lightboxVideo) return;
  lightbox.classList.remove('open');
  lightboxVideo.pause();
  lightboxVideo.src = '';
  document.body.style.overflow = '';
}
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

/* ── ORDER FORM LOGIC ────────────────────────────── */
const orderForm = document.getElementById('orderForm');
const formAlert = document.getElementById('formAlert');
const submitBtn = document.getElementById('submitBtn');

if (orderForm) {
  // Char counter
  const msgField = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  if (msgField && charCount) {
    msgField.addEventListener('input', () => {
      charCount.textContent = `${msgField.value.length}/1000 characters`;
    });
  }

  // File input display
  const fileInput = document.getElementById('fileInput');
  const fileList  = document.getElementById('fileList');
  if (fileInput && fileList) {
    fileInput.addEventListener('change', () => {
      fileList.textContent = Array.from(fileInput.files).map(f => f.name).join(', ') || '';
    });
  }

  // Form submit — uses Web3Forms (free, no backend needed)
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    submitBtn.classList.add('loading');
    hideAlert();

    const formData = new FormData(orderForm);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        showAlert('success', '✓ Your order has been received! We\'ll be in touch within 24 hours.');
        orderForm.reset();
        if (charCount) charCount.textContent = '0/1000 characters';
        if (fileList)  fileList.textContent = '';
      } else {
        showAlert('error', '✗ Something went wrong. Please try again or contact us directly.');
      }
    } catch {
      showAlert('error', '✗ Network error. Please check your connection and try again.');
    } finally {
      submitBtn.classList.remove('loading');
    }
  });
}

function validateForm() {
  const requiredFields = orderForm.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = 'rgba(255,80,80,0.6)';
      if (valid) field.focus();
      valid = false;
    }
  });
  if (!valid) showAlert('error', '✗ Please fill in all required fields.');
  return valid;
}

function showAlert(type, msg) {
  if (!formAlert) return;
  formAlert.className = `form-alert ${type} show`;
  formAlert.querySelector('span').textContent = msg;
}
function hideAlert() {
  if (!formAlert) return;
  formAlert.className = 'form-alert';
}

/* ── LAZY YOUTUBE EMBEDS ─────────────────────────── */
document.querySelectorAll('.yt-thumb-placeholder').forEach(placeholder => {
  placeholder.addEventListener('click', () => {
    const wrap  = placeholder.closest('.yt-thumb');
    const src   = placeholder.getAttribute('data-src');
    if (!wrap || !src) return;
    const iframe = document.createElement('iframe');
    const separator = src.includes('?') ? '&' : '?';
    iframe.src = src + separator + 'autoplay=1&rel=0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    wrap.appendChild(iframe);
    placeholder.remove();
  }, { once: true });
});
