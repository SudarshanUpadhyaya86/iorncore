/* ================================================
   IRONCORE FITNESS — script.js
   Pure JS, no frameworks
   ================================================ */

'use strict';

// ── Utility ──────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Nav: scroll + hamburger ───────────────────────
(function initNav() {
  const nav  = $('.nav');
  const burger = $('.hamburger');
  const links  = $('.nav-links');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
    });
    $$('a', links).forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        burger.classList.remove('open');
      })
    );
  }
})();

// ── Scroll reveal ─────────────────────────────────
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = +e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── Counter animation ─────────────────────────────
(function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseInt(el.dataset.count);
      const suf = el.dataset.suffix || '';
      let cur   = 0;
      const step = Math.max(1, Math.ceil(end / 60));
      const timer = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = cur.toLocaleString() + suf;
        if (cur >= end) clearInterval(timer);
      }, 22);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

// ── Toast notification ────────────────────────────
function showToast(msg, type = 'success') {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icon = type === 'success' ? '✓' : '✕';
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icon}</span> ${msg}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Auth Page (login.html) ────────────────────────
(function initAuth() {
  const tabs    = $$('.auth-tab');
  const forms   = $$('.auth-form');
  if (!tabs.length) return;

  // Tab switch
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const target = $('#' + tab.dataset.form);
      if (target) target.classList.add('active');
    });
  });

  // Password toggle
  $$('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.textContent = isText ? '👁' : '🙈';
    });
  });

  // Login form
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#loginEmail').value.trim();
      const pass  = $('#loginPass').value;
      if (!email || !pass) { showToast('Please fill in all fields.', 'error'); return; }
      if (!email.includes('@')) { showToast('Enter a valid email.', 'error'); return; }
      if (pass.length < 4)  { showToast('Password too short.', 'error'); return; }

      // Save dummy user
      const user = {
        name:   'Alex Johnson',
        email,
        plan:   'Pro Plan',
        status: 'Active',
        since:  'April 2026',
        weight: '78 kg',
        goal:   'Build Muscle',
      };
      localStorage.setItem('icUser', JSON.stringify(user));
      showToast('Welcome back, Alex! 🔥', 'success');
      const btn = loginForm.querySelector('.auth-submit');
      btn.textContent = 'Redirecting…';
      btn.disabled = true;
      setTimeout(() => window.location.href = 'dashboard.html', 1400);
    });
  }

  // Signup form
  const signupForm = $('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const name  = $('#signupName').value.trim();
      const email = $('#signupEmail').value.trim();
      const pass  = $('#signupPass').value;
      if (!name || !email || !pass) { showToast('Please fill in all fields.', 'error'); return; }
      if (!email.includes('@')) { showToast('Enter a valid email.', 'error'); return; }
      if (pass.length < 6) { showToast('Password must be 6+ characters.', 'error'); return; }

      const user = {
        name,
        email,
        plan:   'Basic Plan',
        status: 'Active',
        since:  'April 2026',
        weight: '—',
        goal:   'Get Fit',
      };
      localStorage.setItem('icUser', JSON.stringify(user));
      showToast(`Account created! Welcome, ${name.split(' ')[0]}! 💪`, 'success');
      const btn = signupForm.querySelector('.auth-submit');
      btn.textContent = 'Creating account…';
      btn.disabled = true;
      setTimeout(() => window.location.href = 'dashboard.html', 1400);
    });
  }
})();

// ── Plan selection (plans.html) ───────────────────
(function initPlans() {
  const cards = $$('.plan-card[data-plan]');
  if (!cards.length) return;

  // Pre-select from localStorage
  const user = JSON.parse(localStorage.getItem('icUser') || '{}');
  const saved = user.plan;

  cards.forEach(card => {
    const planName = card.dataset.plan;
    const btn = card.querySelector('.plan-btn');

    if (saved && saved === planName) {
      card.classList.add('selected');
      if (btn) btn.textContent = '✓ Current Plan';
    }

    card.addEventListener('click', () => {
      cards.forEach(c => {
        c.classList.remove('selected');
        const b = c.querySelector('.plan-btn');
        if (b && b.textContent.includes('Current')) b.textContent = 'Select Plan';
      });
      card.classList.add('selected');
      if (btn) btn.textContent = '✓ Current Plan';

      if (user) {
        user.plan = planName;
        localStorage.setItem('icUser', JSON.stringify(user));
      }
      showToast(`${planName} selected! 🏋️`, 'success');
    });
  });
})();

// ── Dashboard (dashboard.html) ────────────────────
(function initDashboard() {
  if (!$('#dashPage')) return;

  const raw  = localStorage.getItem('icUser');
  if (!raw) { window.location.href = 'login.html'; return; }
  const user = JSON.parse(raw);

  // Populate
  const set = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  const firstName = (user.name || 'Athlete').split(' ')[0];

  set('#dashName',   user.name   || '—');
  set('#dashFirst',  firstName);
  set('#dashEmail',  user.email  || '—');
  set('#dashPlan',   user.plan   || '—');
  set('#dashStatus', user.status || '—');
  set('#dashSince',  user.since  || '—');
  set('#dashPlanBadge', user.plan || '—');

  // Plan badge colour
  const badge = $('#dashPlanBadge');
  if (badge && user.plan && user.plan.includes('Pro')) {
    badge.style.background = 'var(--grad-fire)';
    badge.style.color = '#fff';
    badge.style.border = 'none';
  }

  // Animate progress bars
  setTimeout(() => {
    $$('.progress-fill').forEach(bar => {
      bar.style.width = bar.dataset.width || '0%';
    });
  }, 400);

  // Upgrade btn
  const upgradeBtn = $('#upgradeBtn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      window.location.href = 'plans.html';
    });
  }

  // Logout
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showToast('Logged out. See you soon! 👋', 'success');
      setTimeout(() => {
        localStorage.removeItem('icUser');
        window.location.href = 'index.html';
      }, 1200);
    });
  }
})();

// ── FAQ accordion ─────────────────────────────────
(function initFAQ() {
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

// ── Smooth anchor scroll ──────────────────────────
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Button ripple effect ──────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const r = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `
    position:absolute;border-radius:50%;pointer-events:none;
    width:${size}px;height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
    background:rgba(255,255,255,.25);
    transform:scale(0);animation:ripple .6s linear;
  `;
  // add ripple keyframe once
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0}}';
    document.head.appendChild(s);
  }
  btn.style.position = btn.style.position || 'relative';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
});
