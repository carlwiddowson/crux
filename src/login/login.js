// src/login/login.js (updated)
import { loadPage, setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';

console.log('[login.js] Script loaded - DEBUG 1');

async function fetchFirstUserEmail() {
  try {
    console.log('[login.js] Fetching first user email - DEBUG 2');
    const response = await fetch('https://crux-omega.vercel.app/api/first-user', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('[login.js] Fetch first user response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('[login.js] Fetch first user error data:', errorData);
      throw new Error(errorData.error || 'Failed to fetch first user');
    }

    const data = await response.json();
    console.log('[login.js] First user email fetched:', data.email);

    // Ensure the DOM element exists before updating
    const emailElement = document.getElementById('first-user-email');
    if (emailElement) {
      emailElement.textContent = data.email;
      console.log('[login.js] First user email updated in DOM - DEBUG 3');
    } else {
      console.error('[login.js] First user email element not found - DEBUG 4');
    }
  } catch (error) {
    console.error('[login.js] Error fetching first user email:', error.message);
    const emailElement = document.getElementById('first-user-email');
    if (emailElement) {
      emailElement.textContent = 'Error: ' + error.message;
    } else {
      console.error('[login.js] First user email element not found on error - DEBUG 5');
    }
  }
}

function initializeLogin() {
  console.log('[login.js] Initializing login - DEBUG 6');
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    console.error('[login.js] Login form not found - DEBUG 7');
    return;
  }
  console.log('[login.js] Login form found:', loginForm);

  setPageTitle('Login');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[login.js] Form submitted (main) - DEBUG 8');
    await handleLogin(e);
  });

  // Fetch the first user's email after a delay to ensure DOM is ready
  setTimeout(() => {
    console.log('[login.js] Running fetchFirstUserEmail with delay - DEBUG 9');
    fetchFirstUserEmail();
  }, 1000);
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('[login.js] DOM already loaded, running initializeLogin - DEBUG 10');
  initializeLogin();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[login.js] DOMContentLoaded fired, running initializeLogin - DEBUG 11');
    initializeLogin();
  });
}

// Fallback: Retry after a longer delay if DOMContentLoaded doesn't fire
setTimeout(() => {
  console.log('[login.js] Running initializeLogin with longer delay - DEBUG 12');
  initializeLogin();
}, 30000);

// Fallback: Retry again after an even longer delay
setTimeout(() => {
  console.log('[login.js] Running initializeLogin with even longer delay - DEBUG 13');
  initializeLogin();
}, 60000);

async function handleLogin(e) {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    console.log('[login.js] Missing email or password - DEBUG 14');
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
    console.log('[login.js] Redirecting to dashboard - DEBUG 15');
    loadPage('dashboard');
  } catch (error) {
    console.error('[login.js] Login error:', error.message);
    alert('Login failed: ' + error.message);
  }
}