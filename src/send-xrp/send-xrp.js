// src/send-xrp/send-xrp.js
import { Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import getWalletDetails from '../helpers/get-wallet-details.js';
import submitTransaction from '../helpers/submit-transaction.js';

setPageTitle('Send XRP');

async function initSendXrp() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'send-xrp';

  const destinationAddress = document.querySelector('#destination_address');
  const amount = document.querySelector('#amount');
  const destinationTag = document.querySelector('#destination_tag');
  const submitTxBtn = document.querySelector('#submit_tx_button');
  const availableBalanceElement = document.querySelector('#available_balance');

  console.log('Destination address:', destinationAddress); // Debug
  console.log('Amount:', amount); // Debug
  console.log('Submit button:', submitTxBtn); // Debug

  if (!destinationAddress || !amount || !submitTxBtn || !availableBalanceElement) {
    console.error('Required DOM elements not found');
    return;
  }

  submitTxBtn.disabled = true;
  let isValidDestinationAddress = false;
  const allInputs = [destinationAddress, amount];

  try {
    const wallet = Wallet.fromSeed(process.env.SEED);
    await client.request({ command: 'subscribe', accounts: [wallet.address] });

    const updateBalance = async () => {
      const { accountReserves, account_data } = await getWalletDetails({ client });
      availableBalanceElement.textContent = `Available Balance: ${dropsToXrp(account_data.Balance) - accountReserves} XRP`;
    };
    await updateBalance();

    xrplClientManager.addListener('transaction', (response) => {
      if (response.validated && response.transaction.TransactionType === 'Payment') {
        updateBalance();
      }
    }, pageKey);

    const validateAddress = () => {
      destinationAddress.value = destinationAddress.value.trim();
      if (isValidClassicAddress(destinationAddress.value)) {
        destinationAddress.classList.remove('invalid');
        isValidDestinationAddress = true;
      } else {
        isValidDestinationAddress = false;
        destinationAddress.classList.add('invalid');
      }
    };

    destinationAddress.addEventListener('input', validateAddress);

    amount.addEventListener('keydown', (event) => {
      const codes = [8, 190]; // Backspace, period
      const regex = /^[0-9\b.]+$/;
      if (!(regex.test(event.key) || codes.includes(event.keyCode))) {
        event.preventDefault();
      }
    });

    function updateButtonState() {
      const values = allInputs.map(v => v.value.trim());
      submitTxBtn.disabled = !isValidDestinationAddress || values.includes('');
      console.log('Button state:', { values, isValidDestinationAddress, disabled: submitTxBtn.disabled });
    }

    allInputs.forEach(input => {
      input.addEventListener('input', updateButtonState);
      input.addEventListener('change', updateButtonState);
    });

    updateButtonState();

    submitTxBtn.addEventListener('click', async () => {
      try {
        submitTxBtn.disabled = true;
        submitTxBtn.textContent = 'Submitting...';

        const txJson = {
          TransactionType: 'Payment',
          Amount: xrpToDrops(amount.value),
          Destination: destinationAddress.value,
        };

        if (destinationTag?.value !== '') {
          txJson.DestinationTag = destinationTag.value;
        }

        const { result } = await submitTransaction({ client, tx: txJson });
        const txResult = result?.meta?.TransactionResult || result?.engine_result || '';

        if (txResult === 'tesSUCCESS') {
          alert('Transaction submitted successfully!');
        } else {
          throw new Error(txResult);
        }
      } catch (error) {
        alert('Error submitting transaction. Please try again.');
        console.error(error);
      } finally {
        submitTxBtn.disabled = false;
        submitTxBtn.textContent = 'Submit Transaction';
        updateButtonState();
      }
    });

  } catch (error) {
    console.error('Send XRP Error:', error);
    availableBalanceElement.textContent = 'Error loading balance';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSendXrp);
} else {
  initSendXrp();
}