// src/escrow-payments/escrow-payments.js
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

  // Load escrow payments from localStorage
  let escrowPayments = JSON.parse(localStorage.getItem('escrowPayments')) || [];

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
        releaseDate: null,
        finishAfter: obj.FinishAfter,
      }));

      console.log('Ledger escrows:', ledgerEscrows); // Debug ledger data

      // Merge with local escrowPayments for notes, status, and release date
      const mergedEscrows = ledgerEscrows.map(ledgerEscrow => {
        const localEscrow = escrowPayments.find(e => e.sequence === ledgerEscrow.sequence);
        return {
          ...ledgerEscrow,
          note: localEscrow?.note || 'No note',
          status: localEscrow?.status || 'In Escrow',
          created: localEscrow?.created || ledgerEscrow.created,
          releaseDate: localEscrow?.releaseDate || null,
        };
      });

      // Include all local escrows, even if not in ledger (e.g., released or newly created but not yet in ledger)
      const allLocalEscrows = [...escrowPayments]; // Start with all local escrows
      mergedEscrows.forEach(ledgerEscrow => {
        const index = allLocalEscrows.findIndex(e => e.sequence === ledgerEscrow.sequence);
        if (index === -1) {
          allLocalEscrows.push(ledgerEscrow);
        } else {
          allLocalEscrows[index] = { ...allLocalEscrows[index], ...ledgerEscrow }; // Update with ledger data
        }
      });

      console.log('Merged escrows:', allLocalEscrows); // Debug merged data

      // Sort by creation date (newest first)
      allLocalEscrows.sort((a, b) => new Date(b.created) - new Date(a.created));

      return allLocalEscrows;
    } catch (error) {
      console.error('Error fetching escrows:', error);
      return escrowPayments;
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
        const escrow = {
          destination: destinationAddress.value,
          amount: amount.value,
          note: note.value || 'No note',
          status: 'In Escrow',
          created: new Date().toISOString(),
          sequence: result.Sequence,
          hash: result.hash || result.tx_json.hash,
          releaseDate: null,
        };
        escrowPayments.push(escrow); // Ensure escrow is added before saving
        localStorage.setItem('escrowPayments', JSON.stringify(escrowPayments));
        console.log('Added escrow to localStorage:', escrow); // Debug added escrow
        renderTable();
        alert('Escrow created successfully!');
        destinationAddress.value = '';
        amount.value = '';
        note.value = '';
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
      const escrow = escrowPayments.find(e => e.sequence === sequence);
      if (!escrow) {
        console.error('Escrow not found in local storage. Checking all escrows:', escrowPayments);
        throw new Error('Escrow not found in local storage');
      }

      // Fetch the escrow object from the ledger to verify its state
      const { result: ledgerResult } = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'escrow',
      });

      const ledgerEscrow = ledgerResult.account_objects.find(obj => obj.Sequence === sequence);
      if (!ledgerEscrow) throw new Error('Escrow not found in ledger (already released or canceled?)');

      const currentTime = Math.floor(Date.now() / 1000);
      const finishAfter = ledgerEscrow.FinishAfter;
      console.log('Release check:', { currentTime, finishAfter, timeUntilRelease: finishAfter - currentTime });

      if (currentTime < finishAfter) {
        throw new Error(`Cannot release escrow yet. Wait ${finishAfter - currentTime} more seconds (FinishAfter: ${new Date(finishAfter * 1000).toLocaleString()}).`);
      }

      const txJson = {
        TransactionType: 'EscrowFinish',
        Account: wallet.address,
        Owner: wallet.address,
        OfferSequence: sequence,
      };

      // Verify wallet balance and sequence
      const { account_data } = await client.request({ command: 'account_info', account: wallet.address });
      console.log('Wallet info:', { balance: dropsToXrp(account_data.Balance), sequence: account_data.Sequence });

      const { result } = await submitTransaction({ client, tx: txJson });
      const txResult = result?.meta?.TransactionResult || result?.engine_result || '';

      console.log('Release result:', result);

      if (txResult === 'tesSUCCESS') {
        escrow.status = 'Released';
        escrow.releaseDate = new Date().toISOString();
        localStorage.setItem('escrowPayments', JSON.stringify(escrowPayments));
        renderTable();
        alert('Escrow released successfully!');
      } else {
        throw new Error(`Release failed: ${txResult}`);
      }
    } catch (error) {
      alert(`Error releasing escrow: ${error.message}`);
      console.error('Escrow Release Error:', error.message, error);
      // Re-enable the button if the release fails
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
      const finishAfter = escrow.finishAfter || (escrowPayments.find(e => e.sequence === escrow.sequence)?.finishAfter);

      if (currentTime < finishAfter) {
        btn.disabled = true;
        btn.textContent = 'Processing';

        // Calculate remaining time and set a timeout to update the button
        const remainingTime = (finishAfter - currentTime) * 1000; // Convert to milliseconds
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'Release';
          console.log(`Button for sequence ${escrow.sequence} re-enabled after ${remainingTime / 1000} seconds`);
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
      console.log('Rendering escrow:', escrow); // Debug each rendered escrow
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
        btn.disabled = true;
        btn.textContent = 'Releasing...';
        releaseEscrow(sequence, hash);
      });
    });

    // Update button states after rendering
    updateButtonStates(escrows);
  }

  submitEscrowBtn.addEventListener('click', createEscrow);

  // Initial render and periodic refresh
  renderTable();
  setInterval(() => {
    renderTable();
  }, 30000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEscrowPayments);
} else {
  initEscrowPayments();
}