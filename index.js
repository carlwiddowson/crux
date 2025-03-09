import xrplClientManager from './src/helpers/xrpl-client.js';

async function loadComponent(containerId, componentUrl) {
  try {
    const response = await fetch(componentUrl);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading component ${componentUrl}:`, error);
  }
}

export function setPageTitle(title) {
  document.title = `CruX - ${title}`;
  const titleElement = document.getElementById('page-title');
  if (titleElement) titleElement.textContent = title;
}

async function loadPage(pageName) {
  const contentContainer = document.getElementById('page-content');

  // Cleanup listeners for the previous page
  const previousPage = window.currentPage || 'none';
  xrplClientManager.cleanupListeners(previousPage);

  try {
    const htmlResponse = await fetch(`/src/${pageName}/${pageName}.html`);
    const html = await htmlResponse.text();
    contentContainer.innerHTML = html;

    const existingScript = document.getElementById('page-script');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'page-script';
    script.src = `/src/${pageName}/${pageName}.js?t=${Date.now()}`; // Cache-bust to reload fresh
    script.onload = () => console.log(`${pageName}.js loaded`);
    script.onerror = () => console.log(`No JS file found for ${pageName}`);
    document.body.appendChild(script);

    window.currentPage = pageName; // Track current page for cleanup
  } catch (error) {
    console.error(`Error loading page ${pageName}:`, error);
    contentContainer.innerHTML = '<h2>404 - Page Not Found</h2>';
  }
}

function getPageFromPath() {
  const path = window.location.pathname.slice(1);
  return path || 'dashboard';
}

function handleNavigation(event) {
  event.preventDefault();
  const href = event.target.getAttribute('href');
  if (href) {
    const pageName = href === '/' ? 'dashboard' : href.slice(1);
    window.history.pushState({}, '', href);
    loadPage(pageName);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await xrplClientManager.getClient(); // Initialize client on app start
  const initialPage = getPageFromPath();
  loadPage(initialPage);

  setTimeout(() => {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => link.addEventListener('click', handleNavigation));
  }, 100);
});

window.addEventListener('popstate', () => {
  const page = getPageFromPath();
  loadPage(page);
});

// Cleanup on full page unload (e.g., refresh or close)
window.addEventListener('beforeunload', () => {
  xrplClientManager.disconnect();
});