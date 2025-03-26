// src/buyer-purchases/buyer-purchases.js
import { Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops, rippleTimeToISOTime } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import submitTransaction from '../helpers/submit-transaction.js';
import * as FiveBellsCondition from 'five-bells-condition';
import { randomBytes } from 'crypto-browserify';

// Store fulfillment keys in memory for the session
const escrowFulfillments = [];

setPageTitle('Buyer Purchases');

// SVG encoded as a data URL (minified and URL-encoded)
const copyIconSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1490" height="1478" viewBox="0 0 1490 1478" fill="none"><path d="M1305.66 0H560.665C511.773 0 464.884 19.4257 430.315 54.0043C395.747 88.5836 376.328 135.488 376.328 184.387V363.989H184.812C136.006 363.864 89.1405 383.103 54.5021 417.488C19.8558 451.88 0.257349 498.604 0 547.426V1293.61C0.132477 1342.47 19.591 1389.3 54.129 1423.85C88.6736 1458.4 135.485 1477.87 184.34 1478H929.335C978.227 1478 1025.12 1458.57 1059.68 1424C1094.25 1389.42 1113.67 1342.51 1113.67 1293.61V1114.01H1305.19C1353.99 1114.14 1400.86 1094.9 1435.5 1060.51C1470.14 1026.12 1489.74 979.396 1490 930.574V184.389C1489.87 135.529 1470.41 88.7033 1435.87 54.1459C1401.33 19.5985 1354.51 0.125721 1305.66 0ZM966.199 1293.13C966.199 1302.91 962.319 1312.29 955.406 1319.21C948.486 1326.13 939.111 1330.01 929.332 1330.01H184.337C174.596 1329.89 165.292 1325.96 158.403 1319.07C151.514 1312.18 147.594 1302.88 147.469 1293.13V547.425C147.469 537.642 151.35 528.264 158.27 521.351C165.182 514.437 174.557 510.547 184.336 510.547H929.331C939.15 510.414 948.603 514.265 955.547 521.203C962.491 528.148 966.332 537.604 966.2 547.427V1293.61L966.199 1293.13ZM1342.53 930.576C1342.53 940.359 1338.65 949.737 1331.73 956.65C1324.81 963.565 1315.44 967.455 1305.66 967.455H1114.14V547.426C1114.14 498.519 1094.73 451.623 1060.16 417.043C1025.59 382.464 978.7 363.039 929.815 363.039H523.802V184.389C523.802 174.614 527.683 165.229 534.596 158.315C541.516 151.401 550.89 147.519 560.67 147.519H1305.66C1315.41 147.643 1324.71 151.564 1331.6 158.455C1338.49 165.346 1342.41 174.654 1342.53 184.39L1342.53 930.576Z" fill="#100DBE"/></svg>')}`;

async function initBuyerPurchases() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'buyer-purchases';

  const sellerAddress = document.querySelector('#seller_address');
  const amount = document.querySelector('#amount');
  const submitPurchaseBtn = document.querySelector('#submit_purchase_button');
  const tableBody = document.querySelector('#purchases_table_body');
  const walletBalanceDisplay = document.querySelector('#wallet_balance');
  const processingModal = document.querySelector('#processing-modal');

  if (!sellerAddress || !amount || !submitPurchaseBtn || !tableBody || !walletBalanceDisplay || !processingModal) {
    console.error('Required DOM elements not found');
    return;
  }

  let isValidSellerAddress = false;
  const allInputs = [sellerAddress, amount];
  const wallet = Wallet.fromSeed(process.env.SEED);
  console.log('Buyer wallet address:', wallet.address);

  async function updateWalletBalance() {
    try {
      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated',
      });
      const balance = parseInt(accountInfo.result.account_data.Balance) / 1000000;
      walletBalanceDisplay.textContent = `Wallet Balance: ${balance.toFixed(2)} XRP`;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      walletBalanceDisplay.textContent = 'Wallet Balance: Error';
    }
  }

  function validateAddress() {
    sellerAddress.value = sellerAddress.value.trim();
    isValidSellerAddress = isValidClassicAddress(sellerAddress.value);
    sellerAddress.classList.toggle('invalid', !isValidSellerAddress);
  }

  function updateButtonState() {
    const values = allInputs.map(v => v.value.trim());
    submitPurchaseBtn.disabled = !isValidSellerAddress || values.includes('');
  }

  sellerAddress.addEventListener('input', () => {
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

  // Convert ledger index to approximate timestamp
  async function ledgerIndexToDate(ledgerIndex) {
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

  async function fetchPurchases() {
    try {
      const { result: objectsResult } = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'escrow',
      });

      const activeEscrowsPromises = objectsResult.account_objects.map(async obj => {
        const fulfillmentEntry = escrowFulfillments.find(f => f.sequence === obj.Sequence || f.hash === obj.PreviousTxnID);
        console.log('Active Escrow Sequence/Hash:', { sequence: obj.Sequence, hash: obj.PreviousTxnID, fulfillmentEntry });
        const dateCreated = obj.PreviousTxnLgrSeq ? await ledgerIndexToDate(obj.PreviousTxnLgrSeq) : new Date().toLocaleString();
        return {
          toAddress: obj.Destination,
          amount: dropsToXrp(obj.Amount),
          fee: '0.000012',
          condition: obj.Condition || 'None',
          fulfillment: fulfillmentEntry ? fulfillmentEntry.fulfillment : 'Pending',
          dateCreated: dateCreated,
          ledgerIndex: obj.PreviousTxnLgrSeq || 'Unknown',
          status: 'created',
          sequence: obj.Sequence,
          hash: obj.PreviousTxnID || 'N/A',
        };
      });

      const activeEscrows = await Promise.all(activeEscrowsPromises);

      const { result: txResult } = await client.request({
        command: 'account_tx',
        account: wallet.address,
        limit: 100,
      });

      const closedEscrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowFinish' && tx.tx_json.Account === wallet.address)
        .map(tx => {
          const escrowCreateTx = txResult.transactions.find(t => t.tx_json.Sequence === tx.tx_json.OfferSequence);
          return {
            toAddress: escrowCreateTx?.tx_json.Destination || 'Unknown',
            amount: escrowCreateTx ? dropsToXrp(escrowCreateTx.tx_json.Amount) : 'Unknown',
            fee: escrowCreateTx?.tx_json.Fee ? dropsToXrp(escrowCreateTx.tx_json.Fee) : '0.000012',
            condition: escrowCreateTx?.tx_json.Condition || 'None',
            fulfillment: 'Provided',
            dateCreated: escrowCreateTx?.date ? rippleTimeToISOTime(escrowCreateTx.date) : 'Unknown',
            ledgerIndex: escrowCreateTx?.ledger_index || 'Unknown',
            status: 'closed out',
            hash: escrowCreateTx?.hash || 'N/A',
          };
        });

      const cancelledEscrows = txResult.transactions
        .filter(tx => tx.tx_json.TransactionType === 'EscrowCancel' && tx.tx_json.Account === wallet.address)
        .map(tx => {
          const escrowCreateTx = txResult.transactions.find(t => t.tx_json.Sequence === tx.tx_json.OfferSequence);
          return {
            toAddress: escrowCreateTx?.tx_json.Destination || 'Unknown',
            amount: escrowCreateTx ? dropsToXrp(escrowCreateTx.tx_json.Amount) : 'Unknown',
            fee: escrowCreateTx?.tx_json.Fee ? dropsToXrp(escrowCreateTx.tx_json.Fee) : '0.000012',
            condition: escrowCreateTx?.tx_json.Condition || 'None',
            fulfillment: 'Cancelled',
            dateCreated: escrowCreateTx?.date ? rippleTimeToISOTime(escrowCreateTx.date) : 'Unknown',
            ledgerIndex: escrowCreateTx?.ledger_index || 'Unknown',
            status: 'cancelled',
            hash: escrowCreateTx?.hash || 'N/A',
          };
        });

      const allEscrows = [...activeEscrows, ...closedEscrows, ...cancelledEscrows]
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      console.log('All Escrows:', allEscrows);
      return allEscrows;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  }

  async function createPurchase() {
    try {
      submitPurchaseBtn.disabled = true;
      submitPurchaseBtn.textContent = 'Creating...';

      // Show processing modal
      processingModal.classList.add('active');

      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.address,
        ledger_index: 'validated',
      });
      const accountData = accountInfo.result.account_data;
      const balance = parseInt(accountData.Balance) / 1000000;
      const serverInfo = await client.request({ command: 'server_info' });
      const reserveBase = parseInt(serverInfo.result.info.validated_ledger.reserve_base_xrp);
      const reserveInc = parseInt(serverInfo.result.info.validated_ledger.reserve_inc_xrp);
      const objects = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'escrow',
        ledger_index: 'validated',
      });
      const escrowCount = objects.result.account_objects.length;
      const totalReserve = reserveBase + (escrowCount + 1) * reserveInc;
      const requiredBalance = totalReserve + parseFloat(amount.value) + 0.000012;

      console.log('Account balance check:', { balance, totalReserve, requiredBalance });

      if (balance < requiredBalance) {
        throw new Error(
          `Insufficient XRP balance. Required: ${requiredBalance.toFixed(2)} XRP (Reserve: ${totalReserve} XRP, Escrow: ${amount.value} XRP). Available: ${balance.toFixed(2)} XRP.`
        );
      }

      const preimage = randomBytes(32);
      const fulfillment = new FiveBellsCondition.PreimageSha256();
      fulfillment.setPreimage(preimage);

      const condition = fulfillment.getConditionBinary().toString('hex').toUpperCase();
      const fulfillmentHex = fulfillment.serializeBinary().toString('hex').toUpperCase();

      console.log('Generated preimage and condition:', { condition, fulfillment: fulfillmentHex });

      const txJson = {
        TransactionType: 'EscrowCreate',
        Account: wallet.address,
        Amount: xrpToDrops(amount.value),
        Destination: sellerAddress.value,
        Condition: condition,
        CancelAfter: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      };

      console.log('Submitting transaction:', txJson);
      const response = await submitTransaction({ client, tx: txJson });
      console.log('Raw transaction response:', response);

      if (response === null) {
        throw new Error('Transaction submission failed.');
      }

      const txResult = response?.result?.engine_result || response?.engine_result || '';
      console.log('EscrowCreate result:', { txResult, response });

      if (txResult === 'tesSUCCESS') {
        const sequence = response?.result?.Sequence || response?.result?.tx_json?.Sequence || response?.Sequence || response?.tx_json?.Sequence;
        const hash = response?.result?.hash || response?.result?.tx_json?.hash || response?.hash || response?.tx_json?.hash;
        console.log('Extracted sequence and hash:', { sequence, hash });
        if (!sequence || !hash) {
          console.error('Missing Sequence or Hash in transaction response:', response);
          throw new Error('Sequence or Hash not returned from transaction');
        }
        const newEscrow = {
          toAddress: sellerAddress.value,
          amount: dropsToXrp(amount.value),
          fee: '0.000012',
          condition: condition,
          fulfillment: fulfillmentHex,
          dateCreated: new Date().toLocaleString(),
          ledgerIndex: 'Pending',
          status: 'created',
          sequence: sequence,
          hash: hash,
        };
        escrowFulfillments.push({ sequence, fulfillment: fulfillmentHex, hash });
        console.log('Added to escrowFulfillments:', { sequence, fulfillment: fulfillmentHex, hash });
        tableBody.innerHTML = '';
        renderTable([...await fetchPurchases(), newEscrow]);
        sellerAddress.value = '';
        amount.value = '';

        // Wait for the final refresh with the key
        await new Promise(resolve => setTimeout(resolve, 10000));
        renderTable();
        updateWalletBalance();

        // Hide modal after the table refreshes with the key
        processingModal.classList.remove('active');
      } else {
        const errorMsg = txResult ? `Transaction failed with result: ${txResult}` : 'Unknown transaction failure';
        throw new Error(`${errorMsg}. Response: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        amount: amount.value,
        destination: sellerAddress.value,
      };
      alert(`Error creating escrow: ${error.message}`);
      console.error('Purchase Creation Error:', errorDetails);
    } finally {
      submitPurchaseBtn.disabled = false;
      submitPurchaseBtn.textContent = 'Create Purchase';
      updateButtonState();
      updateWalletBalance();
      // Modal stays until success or manual removal in error case
    }
  }

  async function renderTable(purchases) {
    if (!purchases) {
      purchases = await fetchPurchases();
    }
    tableBody.innerHTML = '';
    purchases.forEach(purchase => {
      const row = document.createElement('tr');
      const dateStr = purchase.dateCreated.startsWith('Ledger')
        ? purchase.dateCreated
        : new Date(purchase.dateCreated).toLocaleString() === 'Invalid Date'
        ? 'Unknown'
        : new Date(purchase.dateCreated).toLocaleString();
      const isValidKey = purchase.fulfillment && !['Pending', 'Provided', 'Cancelled'].includes(purchase.fulfillment) && /^[0-9A-F]+$/i.test(purchase.fulfillment);
      const copyButton = isValidKey ? `<button class="copy-btn" data-fulfillment="${purchase.fulfillment}" title="Copy to clipboard"><img src="${copyIconSvg}" alt="Copy" width="16" height="16" style="vertical-align: middle;"></button>` : '';
      row.innerHTML = `
        <td>${purchase.toAddress}</td>
        <td>${purchase.amount}</td>
        <td>${purchase.fee}</td>
        <td>${purchase.condition}</td>
        <td>${purchase.fulfillment} ${copyButton}</td>
        <td>${purchase.ledgerIndex}</td>
        <td>${dateStr}</td>
        <td><span class="status ${purchase.status.toLowerCase().replace(' ', '-')}">${purchase.status}</span></td>
        <td><a href="https://${process.env.EXPLORER_NETWORK}.xrpl.org/transactions/${purchase.hash}" target="_blank" class="view-link">View on Ledger</a></td>
      `;
      tableBody.appendChild(row);

      if (isValidKey) {
        const copyBtn = row.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
          const fulfillment = copyBtn.dataset.fulfillment;
          navigator.clipboard.writeText(fulfillment).then(() => {
            console.log('Fulfillment key copied to clipboard:', fulfillment);
            copyBtn.innerHTML = `<img src="${copyIconSvg}" alt="Copied" width="16" height="16" style="vertical-align: middle;"> Copied!`;
            setTimeout(() => {
              copyBtn.innerHTML = `<img src="${copyIconSvg}" alt="Copy" width="16" height="16" style="vertical-align: middle;">`;
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy fulfillment key:', err);
          });
        });
      }
    });
  }

  submitPurchaseBtn.addEventListener('click', createPurchase);
  renderTable();
  updateWalletBalance();
  setInterval(() => {
    renderTable();
    updateWalletBalance();
  }, 30000); // Refresh every 30s
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBuyerPurchases);
} else {
  initBuyerPurchases();
}