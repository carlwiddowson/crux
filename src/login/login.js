// src/login/login.js
import { loadPage, setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';

console.log('[login.js] Script loaded');

function initializeLogin() {
  console.log('[login.js] Initializing login');
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    console.error('[login.js] Login form not found');
    return;
  }
  console.log('[login.js] Login form found:', loginForm);

  setPageTitle('Login');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[login.js] Form submitted (main)');
    await handleLogin(e);
  });
}

// Run immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeLogin();
} else {
  document.addEventListener('DOMContentLoaded', initializeLogin);
}

async function handleLogin(e) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    console.log('[login.js] Missing email or password');
    alert('Please enter both email and password.');
    return;
  }
  console.log('[login.js] Submitting:', { email, password });

  try {
    const response = await fetch('https://crux-omega.vercel.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    console.log('[login.js] Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('[login.js] Fetch error data:', errorData);
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    console.log('[login.js] Login successful:', data.message);

    window.history.pushState({}, '', '/dashboard');
    console.log('[login.js] Redirecting to dashboard');
    loadPage('dashboard');
  } catch (error) {
    console.error('[login.js] Login error:', error.message);
    alert('Login failed: ' + error.message);
  }
}