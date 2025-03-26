// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import Chart from 'chart.js/auto'; // Import Chart.js
import { Wallet, dropsToXrp } from 'xrpl';

setPageTitle('Dashboard');

async function fetchDeliveries() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found. Please log in.');

    console.log('[dashboard.js] Fetching deliveries with token:', token);
    const response = await fetch('http://localhost:5001/api/deliveries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('[dashboard.js] Deliveries response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[dashboard.js] Deliveries response not OK:', response.statusText, errorText);
      throw new Error('Failed to fetch deliveries');
    }

    const data = await response.json();
    console.log('[dashboard.js] Deliveries fetched:', data);
    return data;
  } catch (error) {
    console.error('[dashboard.js] Error fetching deliveries:', error);
    throw error;
  }
}

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

    const wallet = Wallet.fromSeed(process.env.SEED); // Assuming SEED is your wallet seed

    // Fetch user info from backend
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

    // Fetch wallet balance and reserves
    const accountInfo = await client.request({
      command: 'account_info',
      account: wallet.address,
      ledger_index: 'validated',
    });
    const serverInfo = await client.request({ command: 'server_info' });
    const reserveBase = parseInt(serverInfo.result.info.validated_ledger.reserve_base_xrp);
    const reserveInc = parseInt(serverInfo.result.info.validated_ledger.reserve_inc_xrp);
    const objects = await client.request({
      command: 'account_objects',
      account: wallet.address,
      type: 'escrow',
      ledger_index: 'validated',
    });
    const escrowCount = objects.result.account_objects.length;
    const totalReserve = reserveBase + escrowCount * reserveInc;
    const totalBalance = dropsToXrp(accountInfo.result.account_data.Balance);
    const availableBalance = totalBalance - totalReserve;

    // Fetch active escrows
    const activeEscrows = objects.result.account_objects
      .filter(obj => obj.Account === wallet.address)
      .map(obj => ({
        amount: dropsToXrp(obj.Amount),
      }));
    const escrowLocked = activeEscrows.reduce((sum, escrow) => sum + escrow.amount, 0);

    // Fetch released escrows
    const { result: txResult } = await client.request({
      command: 'account_tx',
      account: wallet.address,
      limit: 100,
    });
    const releasedEscrows = txResult.transactions
      .filter(tx => tx.tx_json.TransactionType === 'EscrowFinish' && tx.tx_json.Account === wallet.address)
      .map(tx => {
        const escrowCreateTx = txResult.transactions.find(t => t.tx_json.Sequence === tx.tx_json.OfferSequence);
        return escrowCreateTx ? dropsToXrp(escrowCreateTx.tx_json.Amount) : 0;
      });
    const escrowReleased = releasedEscrows.reduce((sum, amount) => sum + amount, 0);

    console.log('[dashboard.js] Balance data:', { availableBalance, escrowLocked, escrowReleased });

    // Fetch delivery statuses
    const deliveries = await fetchDeliveries();
    const statusCounts = {
      'Pending': 0,
      'In-transit': 0,
      'Delivered': 0,
      'Cancelled': 0,
    };
    deliveries.forEach(delivery => {
      const status = delivery.status || 'Unknown';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });
    console.log('[dashboard.js] Delivery status counts:', statusCounts);

    // Update balance chart data
    const balanceData = {
      labels: ['Wallet', 'In Escrow', 'Released'],
      datasets: [{
        label: 'Balance (XRP)',
        data: [availableBalance, escrowLocked, escrowReleased],
        backgroundColor: ['#007bff', '#e67e22', '#27ae60'],
      }]
    };

    // Update delivery status chart data
    const deliveryStatusData = {
      labels: ['Pending', 'In-transit', 'Delivered', 'Cancelled'],
      datasets: [{
        label: 'Delivery Status',
        data: [
          statusCounts['Pending'],
          statusCounts['In-transit'],
          statusCounts['Delivered'],
          statusCounts['Cancelled'],
        ],
        backgroundColor: ['#e67e22', '#3498db', '#27ae60', '#ff0000'], // Red for Cancelled
      }]
    };

    // Initialize charts
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}