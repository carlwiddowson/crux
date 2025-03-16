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

    const values = transactions.map((transaction) => {
      const { hash, meta, tx_json, date } = transaction;

      // Debug raw date and conversion
      console.log('Raw date:', date);
      const createdDateTime = date ? rippleTimeToISOTime(date) : '-';
      console.log('Converted createdDateTime:', createdDateTime);

      // Validate and format the date
      const parsedDate = createdDateTime !== '-' ? new Date(createdDateTime) : null;
      const formattedDateTime = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleString() : '-';

      // Handle escrow-related transactions
      let note = '-';
      let releaseDateTime = '-';
      let amountInEscrow = '-';

      if (tx_json.TransactionType === 'EscrowCreate') {
        // Extract note from memo if present
        const memo = tx_json.Memos?.[0]?.Memo;
        note = memo?.MemoData ? Buffer.from(memo.MemoData, 'hex').toString('utf8') : 'No note';
        amountInEscrow = dropsToXrp(tx_json.Amount) || '-';
      } else if (tx_json.TransactionType === 'EscrowFinish') {
        // Find the corresponding EscrowCreate transaction in the same result set
        const escrowCreateTx = transactions.find(t => t.tx_json.Sequence === tx_json.OfferSequence);
        if (escrowCreateTx) {
          const memo = escrowCreateTx.tx_json.Memos?.[0]?.Memo;
          note = memo?.MemoData ? Buffer.from(memo.MemoData, 'hex').toString('utf8') : 'No note';
          amountInEscrow = dropsToXrp(escrowCreateTx.tx_json.Amount) || '-';
        } else {
          note = 'No note (EscrowCreate not in current page)';
          amountInEscrow = 'Unknown';
        }
        releaseDateTime = date ? rippleTimeToISOTime(date).toLocaleString() : '-';
      }

      return {
        Account: tx_json.Account || '-',
        Destination: tx_json.Destination || '-',
        Fee: tx_json.Fee ? dropsToXrp(tx_json.Fee) : '-',
        Hash: hash,
        TransactionType: tx_json.TransactionType || '-',
        result: meta?.TransactionResult || '-',
        delivered: meta?.delivered_amount,
        note,
        createdDateTime: formattedDateTime,
        releaseDateTime,
        amountInEscrow,
      };
    });

    loadMore.style.display = nextMarker ? 'inline-block' : 'none';

    if (values.length === 0 && !marker) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="11" class="no-data">No transactions found</td>`;
      txHistoryElement.appendChild(row);
    } else {
      values.forEach((value) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${value.Account}</td>
          <td>${value.Destination}</td>
          <td>${value.Fee}</td>
          <td>${renderAmount(value.delivered)}</td>
          <td>${value.TransactionType}</td>
          <td>${value.note}</td>
          <td>${value.createdDateTime}</td>
          <td>${value.releaseDateTime}</td>
          <td>${value.amountInEscrow}</td>
          <td>${value.result}</td>
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