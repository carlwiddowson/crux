import { Wallet, dropsToXrp, rippleTimeToISOTime } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import submitTransaction from '../helpers/submit-transaction.js';

// Convert ledger index to approximate timestamp
async function ledgerIndexToDate(client, ledgerIndex) {
  try {
    const { result } = await client.request({
      command: 'ledger',
      ledger_index: ledgerIndex,
      transactions: false,
      expand: false,
    });
    const closeTime = result?.ledger?.close_time;
    if (closeTime) {
      const unixTimestamp = closeTime + 946684800;
      return new Date(unixTimestamp * 1000).toLocaleString();
    }
    return new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching ledger timestamp:', error);
    return new Date().toLocaleString();
  }
}

setPageTitle('Seller Escrows');

async function initSellerEscrows() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'seller-escrows';

  const tableBody = document.querySelector('#seller_escrows_table_body');
  const messageContainer = document.querySelector('#message_container');

  if (!tableBody || !messageContainer) {
    console.error('Required DOM elements not found');
    return;
  }

  const wallet = Wallet.fromSeed(process.env.SEED_2);
  console.log('Seller wallet address:', wallet.address);

  async function fetchSellerEscrows() {
    try {
      console.log('Fetching seller escrows for address:', wallet.address);
      const { result: txResult } = await client.request({
        command: 'account_tx',
        account: wallet.address,
        limit: 100,
        ledger_index_min: -1,
        ledger_index_max: -1,
        forward: false,
      });
      console.log('Raw account_tx response:', txResult);

      const escrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowCreate' && tx.tx_json.Destination === wallet.address)
        .map(async tx => {
          const sequence = Number.isInteger(tx.tx_json.Sequence) ? tx.tx_json.Sequence : null;
          if (sequence === null) {
            console.warn('Invalid sequence for transaction:', tx);
            return null;
          }
          const dateCreated = tx.date ? rippleTimeToISOTime(tx.date) : await ledgerIndexToDate(client, tx.ledger_index);
          return {
            fromAddress: tx.tx_json.Account,
            amount: dropsToXrp(tx.tx_json.Amount),
            status: 'created',
            sequence: sequence,
            condition: tx.tx_json.Condition || 'None',
            hash: tx.hash || 'N/A',
            dateCreated: dateCreated,
            ledgerIndex: tx.ledger_index || 'Unknown',
          };
        });

      const activeEscrowsPromises = await Promise.all(escrows);
      const activeEscrows = activeEscrowsPromises
        .filter(escrow => escrow !== null)
        .filter(escrow => {
          const isFinishedOrCancelled = txResult.transactions.some(finishTx => 
            (finishTx.tx_json.TransactionType === 'EscrowFinish' || finishTx.tx_json.TransactionType === 'EscrowCancel') &&
            finishTx.tx_json.OfferSequence === escrow.sequence
          );
          console.log('Checking escrow:', escrow.sequence, 'Finished/Cancelled:', isFinishedOrCancelled);
          return !isFinishedOrCancelled;
        });

      const closedEscrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowFinish' && tx.tx_json.Destination === wallet.address)
        .map(tx => {
          const sequence = tx.tx_json.OfferSequence;
          const createTx = txResult.transactions.find(t => t.tx_json.TransactionType === 'EscrowCreate' && t.tx_json.Sequence === sequence);
          console.log('Mapping closed escrow:', { sequence, createTx });
          return {
            fromAddress: createTx?.tx_json.Account || tx.tx_json.Account,
            amount: dropsToXrp(tx.meta.delivered_amount || createTx?.tx_json.Amount || '0'),
            status: 'closed out',
            condition: createTx?.tx_json.Condition || 'None',
            hash: createTx?.hash || tx.hash || 'N/A',
            dateCreated: tx.date ? rippleTimeToISOTime(tx.date) : 'Unknown',
            ledgerIndex: tx.ledger_index || 'Unknown',
          };
        });

      const cancelledEscrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowCancel' && tx.tx_json.Destination === wallet.address)
        .map(tx => {
          const sequence = tx.tx_json.OfferSequence;
          const createTx = txResult.transactions.find(t => t.tx_json.TransactionType === 'EscrowCreate' && t.tx_json.Sequence === sequence);
          console.log('Mapping cancelled escrow:', { sequence, createTx });
          return {
            fromAddress: createTx?.tx_json.Account || 'Unknown',
            amount: createTx ? dropsToXrp(createTx.tx_json.Amount) : 'Unknown',
            status: 'cancelled',
            condition: createTx?.tx_json.Condition || 'None',
            hash: createTx?.hash || tx.hash || 'N/A',
            dateCreated: tx.date ? rippleTimeToISOTime(tx.date) : 'Unknown',
            ledgerIndex: tx.ledger_index || 'Unknown',
          };
        });

      const allEscrows = [...activeEscrows, ...closedEscrows, ...cancelledEscrows]
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      console.log('Seller Escrows:', allEscrows);
      return allEscrows;
    } catch (error) {
      console.error('Error fetching seller escrows:', error);
      return [];
    }
  }

  async function fulfillEscrow(sequence, fulfillment, submitBtn) {
    try {
      if (!submitBtn) {
        console.error(`Submit button not provided for sequence: ${sequence}`);
        throw new Error('Button not provided');
      }
      console.log('Fulfilling escrow with sequence:', sequence, 'Preimage:', fulfillment);

      const parsedSequence = parseInt(sequence);
      if (isNaN(parsedSequence)) {
        console.error('Invalid sequence value:', sequence);
        throw new Error('OfferSequence must be a valid number. Please ensure the escrow sequence is properly set.');
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const escrows = await fetchSellerEscrows();
      const escrow = escrows.find(e => e.sequence === parsedSequence);
      if (!escrow) {
        throw new Error(`No escrow found with sequence: ${parsedSequence}`);
      }
      console.log('Escrow data for fulfillment:', escrow);
      const condition = escrow.condition;
      const ownerAddress = escrow.fromAddress;

      const txJson = {
        TransactionType: 'EscrowFinish',
        Account: wallet.address,
        Owner: ownerAddress,
        OfferSequence: parsedSequence,
        Condition: condition,
        Fulfillment: fulfillment,
      };

      console.log('Submitting transaction with Owner:', ownerAddress, 'txJson:', txJson);
      const response = await submitTransaction({ client, tx: txJson });
      if (response === null) {
        throw new Error('Transaction submission failed. Check network or client connection.');
      }

      const txResult = response?.result?.engine_result || response?.engine_result || '';
      console.log('EscrowFinish result:', response);

      if (txResult === 'tesSUCCESS') {
        messageContainer.textContent = 'Escrow fulfilled successfully! Funds released.';
        messageContainer.classList.add('success-message');
        setTimeout(() => {
          messageContainer.textContent = '';
          messageContainer.classList.remove('success-message');
        }, 5000);
        renderTable();
      } else {
        throw new Error(txResult || 'Unknown transaction failure');
      }
    } catch (error) {
      alert(`Error fulfilling escrow: ${error.message}`);
      console.error('Escrow Fulfillment Error:', error);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      } else {
        console.warn(`Could not re-enable button for sequence: ${sequence}`);
      }
    }
  }

  async function cancelEscrow(sequence, cancelBtn) {
    try {
      if (!cancelBtn) {
        console.error(`Cancel button not provided for sequence: ${sequence}`);
        throw new Error('Button not provided');
      }
      console.warn('Cancellation attempted by seller, but only the owner (buyer) can cancel this escrow.');
      messageContainer.textContent = 'Cancellation is not permitted for the seller. Contact the buyer to cancel.';
      messageContainer.classList.add('error-message');
      setTimeout(() => {
        messageContainer.textContent = '';
        messageContainer.classList.remove('error-message');
      }, 5000);
      cancelBtn.disabled = false;
      cancelBtn.textContent = 'Cancel';
      return; // Exit early to prevent transaction attempt
      // The following code is commented out as it’s not applicable for the seller
      /*
      const parsedSequence = parseInt(sequence);
      if (isNaN(parsedSequence)) {
        console.error('Invalid sequence value:', sequence);
        throw new Error('OfferSequence must be a valid number. Please ensure the escrow sequence is properly set.');
      }

      cancelBtn.disabled = true;
      cancelBtn.textContent = 'Cancelling...';

      const txJson = {
        TransactionType: 'EscrowCancel',
        Account: wallet.address,
        Owner: (await fetchSellerEscrows()).find(e => e.sequence === parsedSequence)?.fromAddress || wallet.address,
        OfferSequence: parsedSequence,
      };

      console.log('Submitting cancel transaction:', txJson);
      const response = await submitTransaction({ client, tx: txJson });
      if (response === null) {
        throw new Error('Transaction submission failed. Check network or client connection.');
      }

      const txResult = response?.result?.engine_result || response?.engine_result || '';
      console.log('EscrowCancel result:', response);

      if (txResult === 'tesSUCCESS') {
        messageContainer.textContent = 'Escrow cancelled successfully!';
        messageContainer.classList.add('success-message');
        setTimeout(() => {
          messageContainer.textContent = '';
          messageContainer.classList.remove('success-message');
        }, 5000);
        renderTable();
      } else {
        throw new Error(txResult || 'Unknown transaction failure');
      }
      */
    } catch (error) {
      alert(`Error cancelling escrow: ${error.message}`);
      console.error('Escrow Cancel Error:', error);
      if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancel';
      } else {
        console.warn(`Could not re-enable cancel button for sequence: ${sequence}`);
      }
    }
  }

  async function renderTable() {
    const escrows = await fetchSellerEscrows();
    tableBody.innerHTML = '';
    if (escrows.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8">No escrows found</td></tr>';
      console.log('No escrows found after fetch');
      return;
    }
    escrows.forEach(escrow => {
      const row = document.createElement('tr');
      const isInactive = escrow.status === 'closed out' || escrow.status === 'cancelled';
      const sequenceAttr = Number.isInteger(escrow.sequence) ? escrow.sequence : '';
      const displayStatus = escrow.status === 'closed out' ? 'Completed' : escrow.status === 'cancelled' ? 'Cancelled' : escrow.status;
      const disabledAttr = isInactive ? 'disabled' : '';
      console.log('Rendering escrow:', { status: escrow.status, isInactive, disabledAttr });
      row.innerHTML = `
        <td>${escrow.fromAddress}</td>
        <td>${escrow.amount}</td>
        <td>${escrow.ledgerIndex}</td>
        <td>${escrow.dateCreated}</td>
        <td><span class="status ${escrow.status.toLowerCase().replace(' ', '-')}">${displayStatus}</span></td>
        <td><input type="text" class="fulfillment-input" placeholder="Enter preimage" ${disabledAttr}></td>
        <td>
          <button class="submit-btn" data-sequence="${sequenceAttr}" ${disabledAttr}>Submit</button>
          <button class="cancel-btn" data-sequence="${sequenceAttr}" ${disabledAttr}>Cancel</button>
        </td>
        <td><a href="https://${process.env.EXPLORER_NETWORK}.xrpl.org/transactions/${escrow.hash}" target="_blank" class="view-link">View on Ledger</a></td>
      `;
      tableBody.appendChild(row);

      if (!isInactive) {
        const submitBtn = row.querySelector('.submit-btn');
        const cancelBtn = row.querySelector('.cancel-btn');
        const fulfillmentInput = row.querySelector('.fulfillment-input');

        submitBtn.addEventListener('click', () => {
          const fulfillment = fulfillmentInput.value.trim();
          if (fulfillment) {
            fulfillEscrow(submitBtn.dataset.sequence, fulfillment, submitBtn);
          } else {
            alert('Please enter the preimage provided by the buyer.');
          }
        });

        cancelBtn.addEventListener('click', () => {
          cancelEscrow(cancelBtn.dataset.sequence, cancelBtn);
        });
      }
    });
  }

  renderTable();
  setInterval(() => renderTable(), 30000); // Refresh every 30s
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSellerEscrows);
} else {
  initSellerEscrows();
}