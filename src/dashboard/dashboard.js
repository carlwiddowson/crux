// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';
import { Wallet, dropsToXrp } from 'xrpl';
import Chart from 'chart.js/auto';
import xrplClientManager from '../helpers/xrpl-client.js';
import getWalletDetails from '../helpers/get-wallet-details.js';
import { deliveries } from '../helpers/data.js'; // Import deliveries

setPageTitle('Dashboard');

async function initDashboard() {
  const dashboardInfo = document.querySelector('#dashboard-info');
  if (!dashboardInfo) {
    console.error('Dashboard container not found');
    return;
  }

  const xrpChartCanvas = document.getElementById('xrp-donut-chart');
  const deliveryChartCanvas = document.getElementById('delivery-bar-chart');
  if (!xrpChartCanvas || !deliveryChartCanvas) {
    console.error('Chart canvases not found');
    return;
  }

  const client = await xrplClientManager.getClient();
  const pageKey = 'dashboard';

  try {
    // XRP Overview Chart (unchanged)
    const { account_data } = await getWalletDetails({ client });
    const balance = parseFloat(dropsToXrp(account_data.Balance));
    const wallet = Wallet.fromSeed(process.env.SEED);
    const { result } = await client.request({
      command: 'account_tx',
      account: wallet.address,
      limit: 100,
    });

    let totalSent = 0;
    result.transactions.forEach((tx) => {
      if (tx.tx_json.TransactionType === 'Payment' && tx.tx_json.Account === wallet.address) {
        const delivered = tx.meta?.delivered_amount;
        if (typeof delivered === 'string') {
          totalSent += parseFloat(dropsToXrp(delivered));
        }
      }
    });

    const remainingBalance = balance - totalSent;
    const xrpCtx = xrpChartCanvas.getContext('2d');
    new Chart(xrpCtx, {
      type: 'doughnut',
      data: {
        labels: ['Remaining Balance', 'Total Sent'],
        datasets: [{
          data: [remainingBalance, totalSent],
          backgroundColor: ['#36A2EB', '#FF6384'],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw.toFixed(2)} XRP` } },
        },
      },
    });

    // Delivery Status Chart
    const statusCounts = {
      'In-transit': 0,
      'Cancelled': 0,
      'Pending': 0,
      'Delivered': 0,
    };

    deliveries.forEach(delivery => {
      statusCounts[delivery.status] = (statusCounts[delivery.status] || 0) + 1;
    });

    const deliveryCtx = deliveryChartCanvas.getContext('2d');
    new Chart(deliveryCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: 'Number of Deliveries',
          data: Object.values(statusCounts),
          backgroundColor: [
            'blue',   // In-transit
            'red',    // Cancelled
            'orange', // Pending
            'green',  // Delivered
          ],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Count' },
          },
          x: {
            title: { display: true, text: 'Status' },
          },
        },
        plugins: {
          legend: { display: false }, // Hide legend since colors are intuitive
          tooltip: { callbacks: { label: (context) => `${context.label}: ${context.raw} deliveries` } },
        },
      },
    });

    console.log(`Dashboard initialized with balance: ${balance} XRP, total sent: ${totalSent} XRP`);
    console.log('Delivery status counts:', statusCounts);

  } catch (error) {
    console.error('Error initializing dashboard charts:', error);
    xrpChartCanvas.parentElement.innerHTML += '<p>Error loading XRP chart data</p>';
    deliveryChartCanvas.parentElement.innerHTML += '<p>Error loading delivery chart data</p>';
  }

  // Verify card layout
  const cards = dashboardInfo.querySelectorAll('.card');
  if (cards.length === 0) {
    console.warn('No cards found in dashboard');
  } else {
    console.log(`Dashboard cards loaded: ${cards.length}`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}