// src/transaction-history/transaction-history.js
import { Client, Wallet, convertHexToString, dropsToXrp } from 'xrpl';
import { setPageTitle } from '/index.js';

// Set the page title
setPageTitle('Transaction History');

// Declare variables
let marker = null;

function getTokenName(currencyCode) {
  if (!currencyCode) return "";
  if (currencyCode.length === 3 && currencyCode.trim().toLowerCase() !== 'xrp') {
    return currencyCode.trim();
  }
  if (currencyCode.match(/^[a-fA-F0-9]{40}$/)) {
    const text_code = convertHexToString(currencyCode).replaceAll('\u0000', '');
    if (text_code.match(/[a-zA-Z0-9]{3,}/) && text_code.trim().toLowerCase() !== 'xrp') {
      return text_code;
    }
    return currencyCode;
  }
  return "";
}

function renderAmount(delivered) {
  if (delivered === 'unavailable') {
    return 'unavailable';
  } else if (typeof delivered === 'string') {
    return `${dropsToXrp(delivered)} XRP`;
  } else if (typeof delivered === 'object') {
    return `${delivered.value} ${getTokenName(delivered.currency)}.${delivered.issuer}`;
  } else {
    return "-";
  }
}

async function fetchTxHistory(txHistoryElement, loadMore) {
  try {
    loadMore.textContent = 'Loading...';
    loadMore.disabled = true;

    const wallet = Wallet.fromSeed(process.env.SEED);
    const client = new Client(process.env.CLIENT);

    await client.connect();

    const payload = {
      command: 'account_tx',
      account: wallet.address,
      limit: 10,
    };

    if (marker) {
      payload.marker = marker;
    }

    const { result } = await client.request(payload);
    const { transactions, marker: nextMarker } = result;

    const values = transactions.map((transaction) => {
      const { hash, meta, tx_json } = transaction;
      return {
        Account: tx_json.Account,
        Destination: tx_json.Destination,
        Fee: tx_json.Fee,
        Hash: hash,
        TransactionType: tx_json.TransactionType,
        result: meta?.TransactionResult,
        delivered: meta?.delivered_amount,
      };
    });

    loadMore.style.display = nextMarker ? 'block' : 'none';

    if (values.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="7">No transactions found</td>`;
      txHistoryElement.appendChild(row);
    } else {
      values.forEach((value) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          ${value.Account ? `<td>${value.Account}</td>` : '<td>-</td>'}
          ${value.Destination ? `<td>${value.Destination}</td>` : '<td>-</td>'}
          ${value.Fee ? `<td>${dropsToXrp(value.Fee)}</td>` : '<td>-</td>'}
          <td>${renderAmount(value.delivered)}</td>
          ${value.TransactionType ? `<td>${value.TransactionType}</td>` : '<td>-</td>'}
          ${value.result ? `<td>${value.result}</td>` : '<td>-</td>'}
          ${value.Hash ? `<td><a href="https://${process.env.EXPLORER_NETWORK}.xrpl.org/transactions/${value.Hash}" target="_blank">View</a></td>` : '<td>-</td>'}
        `;
        txHistoryElement.appendChild(row);
      });
    }

    await client.disconnect();
    loadMore.textContent = 'Load More';
    loadMore.disabled = false;

    return nextMarker ?? null;
  } catch (error) {
    console.error('Transaction History Error:', error);
    loadMore.textContent = 'Load More';
    loadMore.disabled = false;
    return null;
  }
}

function initTransactionHistory() {
  const txHistoryElement = document.querySelector('#tx_history_data');
  const loadMore = document.querySelector('#load_more_button');

  if (!txHistoryElement || !loadMore) {
    console.error('Required DOM elements not found');
    return;
  }

  // Add table header
  const header = document.createElement('tr');
  header.innerHTML = `
    <th>Account</th>
    <th>Destination</th>
    <th>Fee (XRP)</th>
    <th>Amount Delivered</th>
    <th>Transaction Type</th>
    <th>Result</th>
    <th>Link</th>
  `;
  txHistoryElement.appendChild(header);

  // Render transaction history
  async function renderTxHistory() {
    marker = await fetchTxHistory(txHistoryElement, loadMore);
    loadMore.addEventListener('click', async () => {
      const nextMarker = await fetchTxHistory(txHistoryElement, loadMore);
      marker = nextMarker;
    });
  }

  renderTxHistory();
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransactionHistory);
} else {
  initTransactionHistory();
}