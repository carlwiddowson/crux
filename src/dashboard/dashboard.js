// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';

// Set page title
setPageTitle('Dashboard');

// function initDashboard() {
//   const dashboardInfo = document.querySelector('#dashboard-info');
//   if (dashboardInfo) {
//     dashboardInfo.innerHTML = '<p>Welcome to your XRP Dashboard!</p>';
//   }
//   console.log('Dashboard JS loaded');
// }

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}