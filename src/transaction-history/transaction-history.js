// src/transaction-history/transaction-history.js
import { Wallet, convertHexToString, dropsToXrp, rippleTimeToISOTime } from 'xrpl';
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

    // Load escrow payments from localStorage to get notes, release dates, and escrow amounts
    const escrowPayments = JSON.parse(localStorage.getItem('escrowPayments')) || [];

    const values = transactions.map((transaction) => {
      const { hash, meta, tx_json, date } = transaction;
      
      // Debug raw date and conversion
      console.log('Raw date:', date);
      const createdDateTime = date ? rippleTimeToISOTime(date) : '-';
      console.log('Converted createdDateTime:', createdDateTime);

      // Validate and format the date
      const parsedDate = createdDateTime !== '-' ? new Date(createdDateTime) : null;
      const formattedDateTime = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString() : '-';

      // Check if this transaction is an escrow-related one
      const isEscrowCreate = tx_json.TransactionType === 'EscrowCreate';
      const isEscrowFinish = tx_json.TransactionType === 'EscrowFinish';

      let note = '-';
      let releaseDateTime = '-';
      let amountInEscrow = '-';

      if (isEscrowCreate) {
        const escrow = escrowPayments.find(e => e.sequence === tx_json.Sequence);
        note = escrow?.note || 'No note';
        amountInEscrow = escrow?.amount || dropsToXrp(tx_json.Amount) || '-'; // Use local amount or transaction amount
      } else if (isEscrowFinish) {
        const escrow = escrowPayments.find(e => e.sequence === tx_json.OfferSequence);
        note = escrow?.note || 'No note';
        releaseDateTime = escrow?.releaseDate ? new Date(escrow.releaseDate).toLocaleString() : '-';
        amountInEscrow = escrow?.amount || '-'; // Use the original amount, assuming it's released
      }

      return {
        Account: tx_json.Account,
        Destination: tx_json.Destination,
        Fee: tx_json.Fee,
        Hash: hash,
        TransactionType: tx_json.TransactionType,
        result: meta?.TransactionResult,
        delivered: meta?.delivered_amount,
        note: note,
        createdDateTime: formattedDateTime,
        releaseDateTime: releaseDateTime,
        amountInEscrow: amountInEscrow,
      };
    });

    loadMore.style.display = nextMarker ? 'inline-block' : 'none';

    if (values.length === 0 && !marker) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="11" class="no-data">No transactions found</td>`; // Updated colspan to 11
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
          <td>${value.note}</td>
          <td>${value.createdDateTime}</td>
          <td>${value.releaseDateTime}</td>
          <td>${value.amountInEscrow}</td>
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
  const txHistoryElement = document.querySelector('#tx_history_data tbody');
  const loadMore = document.querySelector('#load_more_button');

  console.log('Tx history element:', txHistoryElement);
  console.log('Load more button:', loadMore);

  if (!txHistoryElement || !loadMore) {
    console.error('Required DOM elements not found');
    return;
  }

  async function renderTxHistory() {
    marker = await fetchTxHistory(txHistoryElement, loadMore);
    loadMore.removeEventListener('click', loadMoreHandler);
    loadMore.addEventListener('click', loadMoreHandler);
  }

  async function loadMoreHandler() {
    const nextMarker = await fetchTxHistory(txHistoryElement, loadMore);
    marker = nextMarker;
  }

  renderTxHistory();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransactionHistory);
} else {
  initTransactionHistory();
}