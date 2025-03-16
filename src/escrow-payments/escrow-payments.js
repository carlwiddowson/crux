import { Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import submitTransaction from '../helpers/submit-transaction.js';

setPageTitle('Escrow Payments');

async function initEscrowPayments() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'escrow-payments';

  const destinationAddress = document.querySelector('#destination_address');
  const amount = document.querySelector('#amount');
  const note = document.querySelector('#note');
  const submitEscrowBtn = document.querySelector('#submit_escrow_button');
  const tableBody = document.querySelector('#escrow_table_body');

  console.log('Form elements:', { destinationAddress, amount, note, submitEscrowBtn });
  console.log('Table body:', tableBody);

  if (!destinationAddress || !amount || !note || !submitEscrowBtn || !tableBody) {
    console.error('Required DOM elements not found');
    return;
  }

  let isValidDestinationAddress = false;
  const allInputs = [destinationAddress, amount];
  const wallet = Wallet.fromSeed(process.env.SEED);

  function validateAddress() {
    destinationAddress.value = destinationAddress.value.trim();
    if (isValidClassicAddress(destinationAddress.value)) {
      destinationAddress.classList.remove('invalid');
      isValidDestinationAddress = true;
    } else {
      isValidDestinationAddress = false;
      destinationAddress.classList.add('invalid');
    }
  }

  function updateButtonState() {
    const values = allInputs.map(v => v.value.trim());
    submitEscrowBtn.disabled = !isValidDestinationAddress || values.includes('');
  }

  destinationAddress.addEventListener('input', () => {
    validateAddress();
    updateButtonState();
  });

  amount.addEventListener('keydown', (event) => {
    const codes = [8, 190]; // Backspace, period
    const regex = /^[0-9\b.]+$/;
    if (!(regex.test(event.key) || codes.includes(event.keyCode))) {
      event.preventDefault();
    }
  });

  allInputs.forEach(input => {
    input.addEventListener('input', updateButtonState);
    input.addEventListener('change', updateButtonState);
  });

  updateButtonState();

  async function fetchEscrows() {
    try {
      // Fetch active escrows from the ledger
      const { result } = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'escrow',
      });

      const ledgerEscrows = result.account_objects.map(obj => ({
        destination: obj.Destination,
        amount: dropsToXrp(obj.Amount),
        sequence: obj.Sequence,
        status: 'In Escrow',
        created: obj.PreviousTxnLgrSeq ? `Ledger ${obj.PreviousTxnLgrSeq}` : new Date().toISOString(),
        hash: obj.PreviousTxnID || 'N/A',
        finishAfter: obj.FinishAfter,
        note: 'No note', // Note is not stored on ledger; default to 'No note'
      }));

      // Fetch transaction history to identify released escrows
      const { result: txResult } = await client.request({
        command: 'account_tx',
        account: wallet.address,
        limit: 100, // Adjust limit as needed
      });

      const releasedEscrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowFinish')
        .map(tx => {
          const escrowCreateTx = txResult.transactions.find(t => t.tx_json.Sequence === tx.tx_json.OfferSequence);
          return {
            destination: escrowCreateTx?.tx_json.Destination || 'Unknown',
            amount: escrowCreateTx ? dropsToXrp(escrowCreateTx.tx_json.Amount) : 'Unknown',
            sequence: tx.tx_json.OfferSequence,
            status: 'Released',
            created: escrowCreateTx?.date ? rippleTimeToISOTime(escrowCreateTx.date) : 'Unknown',
            hash: tx.hash,
            releaseDate: tx.date ? rippleTimeToISOTime(tx.date) : new Date().toISOString(),
            note: 'No note', // Note not available from ledger
          };
        });

      // Combine active and released escrows
      const allEscrows = [...ledgerEscrows, ...releasedEscrows]
        .sort((a, b) => new Date(b.created) - new Date(a.created)); // Sort by creation date

      console.log('All escrows from ledger:', allEscrows);
      return allEscrows;
    } catch (error) {
      console.error('Error fetching escrows from ledger:', error);
      return [];
    }
  }

  async function createEscrow() {
    try {
      submitEscrowBtn.disabled = true;
      submitEscrowBtn.textContent = 'Creating...';

      const finishAfter = Math.floor(Date.now() / 1000) + 60; // 1 minute for testing
      const txJson = {
        TransactionType: 'EscrowCreate',
        Account: wallet.address,
        Amount: xrpToDrops(amount.value),
        Destination: destinationAddress.value,
        FinishAfter: finishAfter,
      };

      const { result } = await submitTransaction({ client, tx: txJson });
      const txResult = result?.meta?.TransactionResult || result?.engine_result || '';

      console.log('EscrowCreate result:', result);

      if (txResult === 'tesSUCCESS') {
        alert('Escrow created successfully!');
        destinationAddress.value = '';
        amount.value = '';
        note.value = '';
        renderTable(); // Refresh table after creation
      } else {
        throw new Error(txResult);
      }
    } catch (error) {
      alert('Error creating escrow. Please try again.');
      console.error('Escrow Creation Error:', error);
    } finally {
      submitEscrowBtn.disabled = false;
      submitEscrowBtn.textContent = 'Create Escrow';
      updateButtonState();
    }
  }

  async function releaseEscrow(sequence, hash) {
    try {
      const btn = document.querySelector(`.release-btn[data-sequence="${sequence}"]`);
      btn.disabled = true;
      btn.textContent = 'Releasing...';

      // Verify escrow exists and is releasable
      const { result: ledgerResult } = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'escrow',
      });

      const ledgerEscrow = ledgerResult.account_objects.find(obj => obj.Sequence === sequence);
      if (!ledgerEscrow) throw new Error('Escrow not found or already released');

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < ledgerEscrow.FinishAfter) {
        throw new Error(`Cannot release yet. Wait until ${new Date(ledgerEscrow.FinishAfter * 1000).toLocaleString()}`);
      }

      const txJson = {
        TransactionType: 'EscrowFinish',
        Account: wallet.address,
        Owner: wallet.address,
        OfferSequence: sequence,
      };

      const { result } = await submitTransaction({ client, tx: txJson });
      const txResult = result?.meta?.TransactionResult || result?.engine_result || '';

      console.log('Release result:', result);

      if (txResult === 'tesSUCCESS') {
        alert('Escrow released successfully!');
        renderTable();
      } else {
        throw new Error(`Release failed: ${txResult}`);
      }
    } catch (error) {
      alert(`Error releasing escrow: ${error.message}`);
      console.error('Escrow Release Error:', error);
      const btn = document.querySelector(`.release-btn[data-sequence="${sequence}"]`);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Release';
      }
    }
  }

  function updateButtonStates(escrows) {
    escrows.forEach((escrow) => {
      const btn = document.querySelector(`.release-btn[data-sequence="${escrow.sequence}"]`);
      if (!btn || escrow.status === 'Released') return;

      const currentTime = Math.floor(Date.now() / 1000);
      const finishAfter = escrow.finishAfter;

      if (finishAfter && currentTime < finishAfter) {
        btn.disabled = true;
        btn.textContent = 'Processing';
        const remainingTime = (finishAfter - currentTime) * 1000;
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'Release';
        }, remainingTime);
      } else {
        btn.disabled = false;
        btn.textContent = 'Release';
      }
    });
  }

  async function renderTable() {
    const escrows = await fetchEscrows();
    tableBody.innerHTML = '';
    escrows.forEach((escrow) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escrow.destination}</td>
        <td>${escrow.amount}</td>
        <td>${escrow.note}</td>
        <td><span class="status ${escrow.status.toLowerCase().replace(' ', '-')}">${escrow.status}</span></td>
        <td>${new Date(escrow.created).toLocaleString()}</td>
        <td>${escrow.releaseDate ? new Date(escrow.releaseDate).toLocaleString() : '-'}</td>
        <td>
          <button class="release-btn" data-sequence="${escrow.sequence}" data-hash="${escrow.hash}" ${escrow.status === 'Released' ? 'disabled' : ''}>
            ${escrow.status === 'Released' ? 'Released' : 'Processing'}
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.release-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sequence = parseInt(btn.dataset.sequence);
        const hash = btn.dataset.hash;
        releaseEscrow(sequence, hash);
      });
    });

    updateButtonStates(escrows);
  }

  submitEscrowBtn.addEventListener('click', createEscrow);

  renderTable();
  setInterval(() => renderTable(), 30000); // Refresh every 30 seconds
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEscrowPayments);
} else {
  initEscrowPayments();
}