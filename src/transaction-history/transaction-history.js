// src/transaction-history/transaction-history.js
import { Wallet, convertHexToString, dropsToXrp } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';

setPageTitle('Transaction History');

let marker = null;

async function fetchTxHistory(txHistoryElement, loadMore) {
  const client = await xrplClientManager.getClient();

  try {
    loadMore.textContent = 'Loading...';
    loadMore.disabled = true;

    const wallet = Wallet.fromSeed(process.env.SEED);

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

    loadMore.style.display = nextMarker ? 'inline-block' : 'none';

    if (values.length === 0 && !marker) { // Only show "No transactions" on initial load
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="7" class="no-data">No transactions found</td>`;
      txHistoryElement.appendChild(row);
    } else {
      values.forEach((value) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${value.Account || '-'}</td>
          <td>${value.Destination || '-'}</td>
          <td>${value.Fee ? dropsToXrp(value.Fee) : '-'}</td>
          <td>${renderAmount(value.delivered)}</td>
          <td>${value.TransactionType || '-'}</td>
          <td>${value.result || '-'}</td>
          <td><a href="https://${process.env.EXPLORER_NETWORK}.xrpl.org/transactions/${value.Hash}" target="_blank" class="view-link">View</a></td>
        `;
        txHistoryElement.appendChild(row);
      });
    }

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

function initTransactionHistory() {
  const txHistoryElement = document.getElementById('tx_history_data');
  const loadMore = document.getElementById('load_more_button');

  console.log('Tx history element:', txHistoryElement); // Debug
  console.log('Load more button:', loadMore); // Debug

  if (!txHistoryElement || !loadMore) {
    console.error('Required DOM elements not found');
    return;
  }

  // Add table header
  const header = document.createElement('thead');
  header.innerHTML = `
    <tr>
      <th>Account</th>
      <th>Destination</th>
      <th>Fee (XRP)</th>
      <th>Amount Delivered</th>
      <th>Transaction Type</th>
      <th>Result</th>
      <th>Link</th>
    </tr>
  `;
  txHistoryElement.appendChild(header);

  // Create tbody for dynamic content
  const tbody = document.createElement('tbody');
  txHistoryElement.appendChild(tbody);

  async function renderTxHistory() {
    marker = await fetchTxHistory(tbody, loadMore);
    loadMore.removeEventListener('click', loadMoreHandler); // Prevent duplicates
    loadMore.addEventListener('click', loadMoreHandler);
  }

  async function loadMoreHandler() {
    const nextMarker = await fetchTxHistory(tbody, loadMore);
    marker = nextMarker;
  }

  renderTxHistory();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransactionHistory);
} else {
  initTransactionHistory();
}