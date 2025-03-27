// index.js
import xrplClientManager from './src/helpers/xrpl-client.js';

async function loadComponent(containerId, componentUrl) {
  try {
    console.log(`[loadComponent] Fetching component from: ${componentUrl}`);
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch component: ${response.status} ${response.statusText}`);
    }
    const html = await response.text();
    console.log(`[loadComponent] Component HTML fetched: ${html.slice(0, 100)}...`);
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID ${containerId} not found`);
    }
    container.innerHTML = html;
  } catch (error) {
    console.error(`[loadComponent] Error loading component ${componentUrl}:`, error);
  }
}

function setPageTitle(title) {
  console.log(`[setPageTitle] Setting page title: ${title}`);
  document.title = `CruX - ${title}`;
  const titleElement = document.getElementById('page-title');
  if (titleElement) {
    titleElement.textContent = title;
  } else {
    console.error('[setPageTitle] Page title element not found');
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (sidebar && mainContent) {
    if (show) {
      sidebar.style.display = 'block';
      mainContent.classList.add('with-sidebar');
    } else {
      sidebar.style.display = 'none';
      mainContent.classList.remove('with-sidebar');
    }
  }
}

async function loadPage(pageName) {
  console.log(`[loadPage] Loading page: ${pageName}`);
  const contentContainer = document.getElementById('page-content');
  if (!contentContainer) {
    console.error('[loadPage] Content container not found');
    return;
  }

  // Cleanup listeners for the previous page
  const previousPage = window.currentPage || 'none';
  xrplClientManager.cleanupListeners(previousPage);

  try {
    const htmlUrl = `/${pageName}.html`; // Adjusted to root path
    console.log(`[loadPage] Fetching HTML from: ${htmlUrl}`);
    const htmlResponse = await fetch(htmlUrl);
    if (!htmlResponse.ok) {
      throw new Error(`[loadPage] Failed to fetch ${pageName}.html: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }
    const html = await htmlResponse.text();
    console.log(`[loadPage] HTML fetched successfully: ${html.slice(0, 100)}...`);
    contentContainer.innerHTML = html;

    const existingScript = document.getElementById('page-script');
    if (existingScript) {
      console.log('[loadPage] Removing existing script');
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'page-script';
    const scriptUrl = `/src/${pageName}/${pageName}.js?t=${Date.now()}`; // Keep JS path for now
    console.log(`[loadPage] Loading script from: ${scriptUrl}`);
    script.src = scriptUrl;
    script.onload = () => console.log(`[loadPage] ${pageName}.js loaded`);
    script.onerror = () => console.log(`[loadPage] No JS file found for ${pageName}`);
    document.body.appendChild(script);

    toggleSidebar(pageName !== 'login' && pageName !== 'register');
    updateMenu();
    setPageTitle(pageName.charAt(0).toUpperCase() + pageName.slice(1));

    window.currentPage = pageName;
  } catch (error) {
    console.error(`[loadPage] Error loading page ${pageName}:`, error);
    contentContainer.innerHTML = '<h2>404 - Page Not Found</h2>';
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('authToken');
}

function logout() {
  localStorage.removeItem('authToken');
  window.history.pushState({}, '', '/login');
  updateMenu();
  loadPage('login');
}

function getPageFromPath() {
  let path = window.location.pathname.slice(1).replace(/\/$/, '');
  console.log('[getPageFromPath] Raw path:', path);

  const protectedRoutes = [
    'dashboard', 'wallet', 'send-xrp', 'escrow-payments',
    'buyer-purchases', 'seller-escrows', 'transaction-history',
    'map', 'delivery-status'
  ];

  if (!isLoggedIn() && protectedRoutes.includes(path)) {
    console.log('[getPageFromPath] User not logged in, redirecting to login');
    window.history.pushState({}, '', '/login');
    return 'login';
  }

  if (path === '' || path === 'login') {
    return 'login';
  } else if (path === 'register') {
    return 'register';
  } else if (protectedRoutes.includes(path)) {
    return path;
  }

  console.log('[getPageFromPath] Defaulting to login');
  return 'login';
}

function updateMenu() {
  const topNav = document.querySelector('.top-nav');
  const sidebarMenu = document.getElementById('sidebar-menu');

  if (!topNav || !sidebarMenu) {
    console.error('[updateMenu] Menu elements not found');
    return;
  }

  const topNavMenu = document.getElementById('top-nav-menu');
  const loggedOutMenu = `
    <li><a href="/login">Login</a></li>
    <li><a href="/register">Register</a></li>
  `;

  const loggedInMenu = `
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/wallet">Wallet</a></li>
    <li><a href="/send-xrp">Send XRP</a></li>
    <li><a href="/escrow-payments">Escrow Payments</a></li>
    <li><a href="/buyer-purchases">Buyer Purchases</a></li>
    <li><a href="/seller-escrows">Seller Escrows</a></li>
    <li><a href="/transaction-history">Transaction History</a></li>
    <li><a href="/map">Map</a></li>
    <li><a href="/delivery-status">Delivery Status</a></li>
    <li><a href="#" id="logout-link">Logout</a></li>
  `;

  if (isLoggedIn()) {
    console.log('[updateMenu] User logged in, hiding top-nav');
    topNav.classList.add('hidden');
    sidebarMenu.innerHTML = loggedInMenu;
  } else {
    console.log('[updateMenu] User logged out, showing top-nav');
    topNav.classList.remove('hidden');
    topNavMenu.innerHTML = loggedOutMenu;
    sidebarMenu.innerHTML = '';
  }

  const navLinks = document.querySelectorAll('nav a');
  console.log('[updateMenu] Nav links found:', navLinks.length);
  navLinks.forEach(link => link.addEventListener('click', handleNavigation));

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[updateMenu] Logout clicked');
      logout();
    });
  }
}

function handleNavigation(event) {
  event.preventDefault();
  const href = event.target.getAttribute('href');
  console.log('[handleNavigation] Navigating to:', href);
  if (href) {
    const pageName = href === '/' || href === '/login' ? 'login' :
                    href === '/register' ? 'register' :
                    href === '/dashboard' ? 'dashboard' :
                    href === '/wallet' ? 'wallet' :
                    href === '/send-xrp' ? 'send-xrp' :
                    href === '/escrow-payments' ? 'escrow-payments' :
                    href === '/buyer-purchases' ? 'buyer-purchases' :
                    href === '/seller-escrows' ? 'seller-escrows' :
                    href === '/transaction-history' ? 'transaction-history' :
                    href === '/map' ? 'map' :
                    href === '/delivery-status' ? 'delivery-status' :
                    href.replace('/', '');
    window.history.pushState({}, '', href);
    loadPage(pageName);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[index.js] DOMContentLoaded event fired');
  const initialPage = getPageFromPath();
  loadPage(initialPage);

  setTimeout(() => {
    updateMenu();
  }, 100);
});

window.addEventListener('popstate', () => {
  console.log('[index.js] Popstate event fired');
  const page = getPageFromPath();
  loadPage(page);
});

window.addEventListener('beforeunload', () => {
  xrplClientManager.disconnect();
});

export { 
  loadComponent, 
  setPageTitle, 
  toggleSidebar, 
  loadPage, 
  isLoggedIn, 
  logout, 
  getPageFromPath, 
  updateMenu, 
  handleNavigation 
};