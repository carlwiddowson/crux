// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';
import Chart from 'chart.js/auto';

setPageTitle('Dashboard');

async function initDashboard() {
  console.log('[dashboard.js] Initializing dashboard');
  const dashboardInfo = document.getElementById('dashboard-info');
  if (!dashboardInfo) {
    console.error('[dashboard.js] Dashboard info container not found');
    return;
  }

  try {
    const response = await fetch('https://crux-omega.vercel.app/api/dashboard', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });
    console.log('[dashboard.js] Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401 || response.status === 403) {
        window.history.pushState({}, '', '/login');
        loadPage('login');
        throw new Error('Session expired or invalid token. Redirecting to login.');
      }
      throw new Error(errorData.error || 'Failed to fetch dashboard data');
    }

    const { user, message, wallet, delivery_status } = await response.json();
    console.log('[dashboard.js] Dashboard data fetched:', { user, message, wallet, delivery_status });

    const welcomeMessage = document.createElement('h2');
    welcomeMessage.textContent = `${message} ${user.first_name} ${user.last_name} (${user.email})`;
    dashboardInfo.appendChild(welcomeMessage);

    const balanceData = {
      labels: ['Wallet', 'In Escrow', 'Released'],
      datasets: [{
        label: 'Balance (XRP)',
        data: [wallet.balance, wallet.escrow_locked, wallet.escrow_released],
        backgroundColor: ['#007bff', '#e67e22', '#27ae60'],
      }]
    };

    const deliveryStatusData = {
      labels: ['Pending', 'In-transit', 'Delivered', 'Cancelled'],
      datasets: [{
        label: 'Delivery Status',
        data: [
          delivery_status['Pending'],
          delivery_status['In-transit'],
          delivery_status['Delivered'],
          delivery_status['Cancelled'],
        ],
        backgroundColor: ['#e67e22', '#3498db', '#27ae60', '#ff0000'],
      }]
    };

    const balanceChart = new Chart(document.getElementById('balanceChart'), {
      type: 'pie',
      data: balanceData,
      options: { 
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw.toFixed(2)} XRP`,
            },
          },
        },
      }
    });
    console.log('[dashboard.js] Balance chart initialized');

    const deliveryStatusChart = new Chart(document.getElementById('deliveryStatusChart'), {
      type: 'bar',
      data: deliveryStatusData,
      options: { 
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Deliveries' },
          },
          x: {
            title: { display: true, text: 'Status' },
          },
        },
      }
    });
    console.log('[dashboard.js] Delivery status chart initialized');

  } catch (error) {
    console.error('[dashboard.js] Error:', error.message);
    dashboardInfo.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);