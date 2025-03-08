// index.js
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
    
    try {
      const htmlResponse = await fetch(`/src/${pageName}/${pageName}.html`);
      const html = await htmlResponse.text();
      contentContainer.innerHTML = html;
  
      const existingScript = document.getElementById('page-script');
      if (existingScript) existingScript.remove();
  
      const script = document.createElement('script');
      script.type = 'module';
      script.id = 'page-script';
      script.src = `/src/${pageName}/${pageName}.js`;
      script.onload = () => console.log(`${pageName}.js loaded`);
      script.onerror = () => console.log(`No JS file found for ${pageName}`);
      document.body.appendChild(script);
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
      contentContainer.innerHTML = '<h2>404 - Page Not Found</h2>';
    }
  }
  
  function getPageFromPath() {
    const path = window.location.pathname.slice(1); // Remove leading "/"
    return path || 'dashboard'; // Default to 'dashboard' if path is empty (i.e., "/")
  }
  
  function handleNavigation(event) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    if (href) {
      const pageName = href === '/' ? 'dashboard' : href.slice(1); // Map "/" to "dashboard"
      window.history.pushState({}, '', href); // Update URL without reloading
      loadPage(pageName);
    }
  }
  
  // Load components and initial page
  document.addEventListener('DOMContentLoaded', () => {
    // loadComponent('header-container', '/src/components/header.html');
    // loadComponent('footer-container', '/src/components/footer.html');
  
    // Load initial page based on URL
    const initialPage = getPageFromPath();
    loadPage(initialPage);
  
    // Add click handlers to nav links after header loads
    setTimeout(() => {
      const navLinks = document.querySelectorAll('nav a');
      navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    }, 100); // Delay to ensure header is loaded
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const page = getPageFromPath();
    loadPage(page);
  });