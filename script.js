'use strict';

// ── Utility ──────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Nav ──────────────────────────────────────────
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

// ── Toast ────────────────────────────────────────
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

// ── AUTH SYSTEM (FIXED) ──────────────────────────
(function initAuth() {
  const tabs = $$('.auth-tab');
  const forms = $$('.auth-form');
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

  // Login
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();

      const email = $('#loginEmail').value.trim();
      const pass  = $('#loginPass').value;

      let users = JSON.parse(localStorage.getItem("users")) || [];

      const foundUser = users.find(
        u => u.email === email && u.password === pass
      );

      if (!foundUser) {
        showToast('Invalid email or password.', 'error');
        return;
      }

      const user = {
        name: foundUser.name,
        email: foundUser.email,
        plan: foundUser.plan || 'Basic Plan',
        status: 'Active',
        since: 'April 2026',
        weight: '78 kg',
        goal: 'Build Muscle'
      };

      localStorage.setItem('icUser', JSON.stringify(user));

      showToast(`Welcome back, ${user.name.split(" ")[0]}! 🔥`, 'success');

      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
  }

  // Signup
  const signupForm = $('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();

      const name  = $('#signupName').value.trim();
      const email = $('#signupEmail').value.trim();
      const pass  = $('#signupPass').value;

      if (!name || !email || !pass) {
        showToast('Please fill all fields.', 'error');
        return;
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];

      // prevent duplicate
      if (users.find(u => u.email === email)) {
        showToast('User already exists.', 'error');
        return;
      }

      users.push({
        name,
        email,
        password: pass,
        plan: 'Basic Plan'
      });

      localStorage.setItem("users", JSON.stringify(users));

      const user = {
        name,
        email,
        plan: 'Basic Plan',
        status: 'Active',
        since: 'April 2026',
        weight: '—',
        goal: 'Get Fit'
      };

      localStorage.setItem('icUser', JSON.stringify(user));

      showToast(`Welcome, ${name.split(" ")[0]}! 💪`, 'success');

      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    });
  }
})();

// ── PLAN SELECTION ───────────────────────────────
(function initPlans() {
  const cards = $$('.plan-card[data-plan]');
  if (!cards.length) return;

  const user = JSON.parse(localStorage.getItem('icUser') || '{}');

  cards.forEach(card => {
    const planName = card.dataset.plan;
    const btn = card.querySelector('.plan-btn');

    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      if (user) {
        user.plan = planName;
        localStorage.setItem('icUser', JSON.stringify(user));
      }

      showToast(`${planName} selected! 🏋️`);
    });
  });
})();

// ── DASHBOARD ────────────────────────────────────
(function initDashboard() {
  if (!$('#dashPage')) return;

  const user = JSON.parse(localStorage.getItem('icUser'));

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const set = (id, val) => {
    const el = $(id);
    if (el) el.textContent = val;
  };

  const first = user.name.split(" ")[0];

  set('#dashName', user.name);
  set('#dashFirst', first);
  set('#dashEmail', user.email);
  set('#dashPlan', user.plan);
  set('#dashStatus', user.status);
  set('#dashSince', user.since);
  set('#dashPlanBadge', user.plan);

  // Logout
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('icUser');
      window.location.href = 'index.html';
    });
  }
})();
