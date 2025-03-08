// src/send-xrp/send-xrp.js
import { Client, Wallet, dropsToXrp, isValidClassicAddress, xrpToDrops } from 'xrpl';
import { setPageTitle } from '/index.js';
import getWalletDetails from '../helpers/get-wallet-details.js';
import submitTransaction from '../helpers/submit-transaction.js';

// Set the page title
setPageTitle('Send XRP');

async function initSendXrp() {
  const client = new Client(process.env.CLIENT);

  // Get DOM elements
  const destinationAddress = document.querySelector('#destination_address');
  const amount = document.querySelector('#amount');
  const destinationTag = document.querySelector('#destination_tag');
  const submitTxBtn = document.querySelector('#submit_tx_button');
  const availableBalanceElement = document.querySelector('#available_balance');

  if (!destinationAddress || !amount || !submitTxBtn || !availableBalanceElement) {
    console.error('Required DOM elements not found');
    return;
  }

  // Disable submit button by default
  submitTxBtn.disabled = true;
  let isValidDestinationAddress = false;
  const allInputs = document.querySelectorAll('#destination_address, #amount');

  try {
    await client.connect();
    const wallet = Wallet.fromSeed(process.env.SEED);

    // Subscribe to account transaction stream
    await client.request({
      command: 'subscribe',
      accounts: [wallet.address],
    });

    // Fetch and display initial available balance
    const updateBalance = async () => {
      const { accountReserves, account_data } = await getWalletDetails({ client });
      availableBalanceElement.textContent = `Available Balance: ${dropsToXrp(account_data.Balance) - accountReserves} XRP`;
    };
    await updateBalance();

    // Update balance on successful transaction
    client.on('transaction', (response) => {
      if (response.validated && response.transaction.TransactionType === 'Payment') {
        updateBalance();
      }
    });

    // Validate destination address
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

    // Event listeners
    destinationAddress.addEventListener('input', validateAddress);

    amount.addEventListener('keydown', (event) => {
      const codes = [8, 190]; // Backspace, period
      const regex = /^[0-9\b.]+$/;
      if (!(regex.test(event.key) || codes.includes(event.keyCode))) {
        event.preventDefault();
      }
    });

    allInputs.forEach(input => {
      input.addEventListener('input', () => {
        const values = Array.from(allInputs).map(v => v.value);
        submitTxBtn.disabled = !isValidDestinationAddress || values.includes('');
      });
    });

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
      }
    });

  } catch (error) {
    console.error('Send XRP Error:', error);
    await client.disconnect();
  }
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSendXrp);
} else {
  initSendXrp();
}