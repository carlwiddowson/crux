// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';
import { Wallet, dropsToXrp } from 'xrpl';
import Chart from 'chart.js/auto';
import xrplClientManager from '../helpers/xrpl-client.js';
import getWalletDetails from '../helpers/get-wallet-details.js';

// Set page title
setPageTitle('Dashboard');

async function initDashboard() {
  const dashboardInfo = document.querySelector('#dashboard-info');
  if (!dashboardInfo) {
    console.error('Dashboard container not found');
    return;
  }

  const chartCanvas = document.getElementById('xrp-donut-chart');
  if (!chartCanvas) {
    console.error('Chart canvas not found');
    return;
  }

  const client = await xrplClientManager.getClient();
  const pageKey = 'dashboard';

  try {
    // Fetch wallet balance
    const { account_data } = await getWalletDetails({ client });
    const balance = parseFloat(dropsToXrp(account_data.Balance));

    // Fetch total sent XRP from transaction history
    const wallet = Wallet.fromSeed(process.env.SEED);
    const { result } = await client.request({
      command: 'account_tx',
      account: wallet.address,
      limit: 100, // Adjust limit as needed
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

    // Calculate remaining balance (for visualization purposes)
    const remainingBalance = balance - totalSent;

    // Render donut chart
    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut', // 'doughnut' for donut chart
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
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw.toFixed(2)} XRP`,
            },
          },
        },
      },
    });

    console.log(`Dashboard initialized with balance: ${balance} XRP, total sent: ${totalSent} XRP`);

  } catch (error) {
    console.error('Error initializing dashboard chart:', error);
    chartCanvas.parentElement.innerHTML += '<p>Error loading chart data</p>';
  }

  // Verify card layout
  const cards = dashboardInfo.querySelectorAll('.card');
  if (cards.length === 0) {
    console.warn('No cards found in dashboard');
  } else {
    console.log(`Dashboard cards loaded: ${cards.length}`);
  }
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}