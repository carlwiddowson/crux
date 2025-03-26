// src/login/login.js
import { loadPage, setPageTitle } from '/index.js';

console.log('[login.js] Script loaded');
setPageTitle('Login');

const loginFormImmediate = document.getElementById('login-form');
console.log('[login.js] Immediate check - Login form:', loginFormImmediate || 'Not found yet');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[login.js] DOMContentLoaded fired');
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    console.error('[login.js] Login form not found');
    return;
  }
  console.log('[login.js] Login form found:', loginForm);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[login.js] Form submitted (main)');
    await handleLogin(e);
  });
});

// Fallback if DOM already loaded
if (document.readyState !== 'loading') {
  console.log('[login.js] DOM already loaded, running setup');
  const loginFormFallback = document.getElementById('login-form');
  if (loginFormFallback) {
    console.log('[login.js] Fallback - Login form found:', loginFormFallback);
    loginFormFallback.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[login.js] Form submitted (fallback)');
      await handleLogin(e);
    });
  } else {
    console.error('[login.js] Fallback - Login form not found');
  }
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
    const response = await fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('[login.js] Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('[login.js] Fetch error data:', errorData);
      throw new Error(errorData.error || 'Login failed');
    }

    const { token } = await response.json();
    localStorage.setItem('authToken', token);
    console.log('[login.js] Login successful, token stored:', token);

    window.history.pushState({}, '', '/dashboard');
    console.log('[login.js] Redirecting to dashboard');
    loadPage('dashboard');
  } catch (error) {
    console.error('[login.js] Login error:', error.message);
    alert('Login failed: ' + error.message);
  }
}