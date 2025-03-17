import { setPageTitle } from '/index.js';
import { Wallet, dropsToXrp } from 'xrpl';
import Chart from 'chart.js/auto';
import xrplClientManager from '../helpers/xrpl-client.js';
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
  const wallet = Wallet.fromSeed(process.env.SEED);
  console.log('Wallet address:', wallet.address);

  try {
    // Fetch the current balance using account_info
    const accountInfoResponse = await client.request({
      command: 'account_info',
      account: wallet.address,
      ledger_index: 'validated',
    });
    const currentBalance = parseFloat(dropsToXrp(accountInfoResponse.result.account_data.Balance));
    if (isNaN(currentBalance)) throw new Error('Invalid balance from account_info');
    console.log('Current balance from account_info:', currentBalance);

    // Fetch transaction history to analyze escrow activity
    const txResponse = await client.request({
      command: 'account_tx',
      account: wallet.address,
      limit: 100,
      ledger_index_min: -1,
      ledger_index_max: -1,
      forward: false,
    });
    const transactions = txResponse.result.transactions || [];

    let escrowCreatedAmount = 0; // XRP locked in active escrows
    let escrowClosedOutAmount = 0; // XRP from fulfilled escrows
    let escrowCancelledAmount = 0; // XRP from cancelled escrows

    // First pass: Identify all EscrowCreate transactions
    const escrowCreates = [];
    transactions.forEach((tx) => {
      if (tx.tx_json.TransactionType === 'EscrowCreate' && tx.tx_json.Account === wallet.address) {
        const amount = tx.tx_json.Amount;
        const sequence = tx.tx_json.Sequence;
        if (typeof amount === 'string' && typeof sequence === 'number') {
          escrowCreates.push({
            sequence: sequence,
            amount: parseFloat(dropsToXrp(amount)),
          });
        } else {
          console.warn('Invalid EscrowCreate data:', tx);
        }
      }
    });
    console.log('EscrowCreate transactions:', escrowCreates);

    // Second pass: Analyze EscrowFinish and EscrowCancel to determine status
    transactions.forEach((tx) => {
      const txType = tx.tx_json.TransactionType;
      if (txType === 'EscrowFinish' && tx.tx_json.Account === wallet.address) {
        const offerSequence = tx.tx_json.OfferSequence;
        const delivered = tx.meta?.delivered_amount;
        const escrow = escrowCreates.find(e => e.sequence === offerSequence);
        if (escrow && typeof delivered === 'string') {
          escrowClosedOutAmount += parseFloat(dropsToXrp(delivered));
          escrow.sequence = null; // Mark as processed
        } else {
          console.warn('Invalid EscrowFinish data or no matching escrow:', { offerSequence, delivered, tx });
        }
      } else if (txType === 'EscrowCancel' && tx.tx_json.Account === wallet.address) {
        const offerSequence = tx.tx_json.OfferSequence;
        const escrow = escrowCreates.find(e => e.sequence === offerSequence);
        if (escrow) {
          escrowCancelledAmount += escrow.amount;
          escrow.sequence = null; // Mark as processed
        } else {
          console.warn('Invalid EscrowCancel data or no matching escrow:', { offerSequence, tx });
        }
      }
    });

    // Sum remaining EscrowCreate amounts that haven't been fulfilled or cancelled
    escrowCreates.forEach((escrow) => {
      if (escrow.sequence !== null) { // Still active
        escrowCreatedAmount += escrow.amount;
      }
    });

    console.log('Escrow Created (active):', escrowCreatedAmount);
    console.log('Escrow Closed Out:', escrowClosedOutAmount);
    console.log('Escrow Cancelled:', escrowCancelledAmount);

    // Validate data before creating chart
    const chartData = [currentBalance, escrowCreatedAmount, escrowClosedOutAmount, escrowCancelledAmount];
    if (chartData.some(isNaN)) {
      throw new Error('Invalid chart data detected');
    }

    // XRP Overview Chart
    const xrpCtx = xrpChartCanvas.getContext('2d');
    new Chart(xrpCtx, {
      type: 'doughnut',
      data: {
        labels: ['Current Balance', 'Escrow Created', 'Escrow Closed Out', 'Escrow Cancelled'],
        datasets: [{
          data: chartData,
          backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'],
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

    console.log(`Dashboard initialized with balance: ${currentBalance} XRP, escrow created: ${escrowCreatedAmount} XRP, escrow closed out: ${escrowClosedOutAmount} XRP, escrow cancelled: ${escrowCancelledAmount} XRP`);
    console.log('Delivery status counts:', statusCounts);

  } catch (error) {
    console.error('Error initializing dashboard charts:', error);
    if (error.message.includes('account_info') || error.message.includes('account_tx')) {
      console.error('API request failed, check network or account validity:', error);
    } else if (error.message.includes('Invalid chart data')) {
      console.error('Chart data validation failed, using default values:', error);
      // Fallback with default values
      const xrpCtx = xrpChartCanvas.getContext('2d');
      new Chart(xrpCtx, {
        type: 'doughnut',
        data: {
          labels: ['Current Balance', 'Escrow Created', 'Escrow Closed Out', 'Escrow Cancelled'],
          datasets: [{
            data: [0, 0, 0, 0], // Default values
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (context) => `${context.label}: 0.00 XRP` } },
          },
        },
      });
    }
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