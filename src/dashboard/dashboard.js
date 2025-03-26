// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import Chart from 'chart.js/auto'; // Import Chart.js

setPageTitle('Dashboard');

async function initDashboard() {
  console.log('[dashboard.js] Initializing dashboard');
  const client = await xrplClientManager.getClient();
  const pageKey = 'dashboard';

  const dashboardInfo = document.getElementById('dashboard-info');
  if (!dashboardInfo) {
    console.error('[dashboard.js] Dashboard info container not found');
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('[dashboard.js] No auth token found');
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch('http://localhost:5001/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('[dashboard.js] Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        window.history.pushState({}, '', '/login');
        loadPage('login');
        throw new Error('Session expired or invalid token. Redirecting to login.');
      }
      throw new Error(errorData.error || 'Failed to fetch dashboard data');
    }

    const { user, message } = await response.json();
    console.log('[dashboard.js] Dashboard data fetched:', { user, message });

    // Display welcome message
    const welcomeMessage = document.createElement('h2');
    welcomeMessage.textContent = `${message} ${user.first_name} ${user.last_name} (${user.email})`;
    dashboardInfo.appendChild(welcomeMessage);

    // Placeholder chart data (replace with real data later)
    const balanceData = {
      labels: ['XRP', 'Reserve'],
      datasets: [{
        label: 'Balance',
        data: [1000, 20], // Example data
        backgroundColor: ['#007bff', '#ccc'],
      }]
    };

    const deliveryStatusData = {
      labels: ['Pending', 'In-transit', 'Delivered'],
      datasets: [{
        label: 'Delivery Status',
        data: [5, 3, 10], // Example data
        backgroundColor: ['#e67e22', '#3498db', '#27ae60'],
      }]
    };

    // Initialize charts
    const balanceChart = new Chart(document.getElementById('balanceChart'), {
      type: 'pie',
      data: balanceData,
      options: { responsive: true }
    });
    console.log('[dashboard.js] Balance chart initialized');

    const deliveryStatusChart = new Chart(document.getElementById('deliveryStatusChart'), {
      type: 'bar',
      data: deliveryStatusData,
      options: { responsive: true }
    });
    console.log('[dashboard.js] Delivery status chart initialized');

  } catch (error) {
    console.error('[dashboard.js] Error:', error.message);
    dashboardInfo.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}