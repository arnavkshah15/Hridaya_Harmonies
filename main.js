/* ════════════════════════════════════════════════
   HRIDAYA HARMONIES — MAIN JAVASCRIPT
   ════════════════════════════════════════════════ */

'use strict';

/* ── PRETTY URLS & FILE SYSTEM COMPATIBILITY ────── */
// If deployed (http/https), dynamically strip 'index.html' from URLs and links
// so the address bar and status bars look clean (pretty URLs).
// If opened locally (file://), keep exact index.html links so navigation works.
if (window.location.protocol !== 'file:') {
  // Clean address bar if page was loaded with index.html in the URL
  if (window.location.pathname.endsWith('index.html')) {
    const cleanPath = window.location.pathname.replace(/index\.html$/, '');
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }

  // Rewrite page link hrefs to pretty URLs on load
  const cleanLinks = () => {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('index.html')) {
        let cleanHref = href.replace(/index\.html$/, '');
        if (cleanHref === '') cleanHref = './';
        link.setAttribute('href', cleanHref);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanLinks);
  } else {
    cleanLinks();
  }
}

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
  '.service-card, .process-step, .testimonial-card, .portfolio-item, .reel-card, .youtube-card, .sidebar-card, .service-detail, .sample-card, .occasion-nav-card'
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



/* ── ORDER FORM LOGIC ────────────────────────────── */
const orderForm = document.getElementById('orderForm');
const formAlert = document.getElementById('formAlert');
const submitBtn = document.getElementById('submitBtn');

if (orderForm) {
  // Prefill service type from ?service= query param (occasion pages & CTAs)
  try {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const serviceSelect = document.getElementById('serviceType');
    if (serviceParam && serviceSelect) {
      const option = Array.from(serviceSelect.options).find(o => o.value === serviceParam);
      if (option) {
        serviceSelect.value = serviceParam;
      }
    }
  } catch (_) { /* ignore */ }

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

    // ── Build WhatsApp greeting link and attach to email ─────────────────
    const customerName  = (orderForm.querySelector('#fullName')?.value || '').trim();
    const customerPhone = (orderForm.querySelector('#phone')?.value   || '').trim();
    if (customerPhone) {
      let cleanPhone = customerPhone.replace(/[^\d]/g, '');
      if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      const firstName  = customerName.split(' ')[0] || 'there';
      const greeting   = encodeURIComponent(
        `Hi ${firstName}! 🎵 We have received your order at Hridaya Harmonies. ` +
        `Is there anything you would want us to know before we start preparing your order?\n\n` +
        `Also, please note that payment is required before we begin work. ` +
        `Kindly confirm if you would like to proceed with the payment. 🙏`
      );
      const waLink = `https://wa.me/${cleanPhone}?text=${greeting}`;
      // This appears as a clickable link in the Web3Forms email you receive
      formData.append('whatsapp_greeting_link', waLink);
    }
    // ─────────────────────────────────────────────────────────────────────

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

/* ── QUICK CONNECT FORM LOGIC ────────────────────── */
const quickConnectForm = document.getElementById('quickConnectForm');
const qcAlert = document.getElementById('qcAlert');
const qcSubmitBtn = document.getElementById('qcSubmitBtn');

if (quickConnectForm) {
  quickConnectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateQCForm()) return;

    qcSubmitBtn.classList.add('loading');
    hideQCAlert();

    const formData = new FormData(quickConnectForm);

    const customerName  = (quickConnectForm.querySelector('#qcName')?.value || '').trim();
    const customerPhone = (quickConnectForm.querySelector('#qcPhone')?.value || '').trim();
    
    if (customerPhone) {
      let cleanPhone = customerPhone.replace(/[^\d]/g, '');
      if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      const firstName  = customerName.split(' ')[0] || 'there';
      const greeting   = encodeURIComponent(
        `Hi ${firstName}! 🎵 Thank you for reaching out via our Hridaya Harmonies Quick Connect. ` +
        `How can we help you with your custom song requirements today? 🙏`
      );
      const waLink = `https://wa.me/${cleanPhone}?text=${greeting}`;
      
      // WhatsApp clickable link for the lead email
      formData.append('whatsapp_greeting_link', waLink);
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        showQCAlert('success', '✓ Request sent! We will connect with you on WhatsApp shortly.');
        quickConnectForm.reset();
      } else {
        showQCAlert('error', '✗ Something went wrong. Please try again.');
      }
    } catch {
      showQCAlert('error', '✗ Network error. Please check your connection.');
    } finally {
      qcSubmitBtn.classList.remove('loading');
    }
  });
}

function validateQCForm() {
  const requiredFields = quickConnectForm.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = 'rgba(255,80,80,0.6)';
      if (valid) field.focus();
      valid = false;
    }
  });
  if (!valid) showQCAlert('error', '✗ Please fill in all required fields.');
  return valid;
}

function showQCAlert(type, msg) {
  if (!qcAlert) return;
  qcAlert.className = `form-alert ${type} show`;
  qcAlert.querySelector('span').textContent = msg;
}
function hideQCAlert() {
  if (!qcAlert) return;
  qcAlert.className = 'form-alert';
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
