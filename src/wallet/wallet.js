// src/wallet/wallet.js
import { Client, dropsToXrp, rippleTimeToISOTime } from 'xrpl';
import { setPageTitle } from '/index.js';
import getWalletDetails from '../helpers/get-wallet-details.js';

// Set the page title
setPageTitle('Wallet');

// Initialize wallet functionality
const initWallet = async () => {
  const client = new Client(process.env.CLIENT);

  // Get DOM elements
  const walletElement = document.querySelector('#wallet');
  const walletLoadingDiv = document.querySelector('#loading_wallet_details');
  const ledgerLoadingDiv = document.querySelector('#loading_ledger_details');

  try {
    await client.connect();

    // Subscribe to ledger stream
    await client.request({
      command: 'subscribe',
      streams: ['ledger'],
    });

    // Fetch wallet details
    getWalletDetails({ client })
      .then(({ account_data, accountReserves, xAddress, address }) => {
        walletElement.querySelector('.wallet_address').textContent = `Wallet Address: ${account_data.Account}`;
        walletElement.querySelector('.wallet_balance').textContent = `Wallet Balance: ${dropsToXrp(account_data.Balance)} XRP`;
        walletElement.querySelector('.wallet_reserve').textContent = `Wallet Reserve: ${accountReserves} XRP`;
        walletElement.querySelector('.wallet_xaddress').textContent = `X-Address: ${xAddress}`;

        walletElement.querySelector('#view_more_button').addEventListener('click', () => {
          window.open(`https://${process.env.EXPLORER_NETWORK}.xrpl.org/accounts/${address}`, '_blank');
        });
      })
      .finally(() => {
        walletLoadingDiv.style.display = 'none';
      });

    // Fetch latest ledger details
    client.on('ledgerClosed', (ledger) => {
      ledgerLoadingDiv.style.display = 'none';
      const ledgerIndex = document.querySelector('#ledger_index');
      const ledgerHash = document.querySelector('#ledger_hash');
      const closeTime = document.querySelector('#close_time');
      ledgerIndex.textContent = `Ledger Index: ${ledger.ledger_index}`;
      ledgerHash.textContent = `Ledger Hash: ${ledger.ledger_hash}`;
      closeTime.textContent = `Close Time: ${rippleTimeToISOTime(ledger.ledger_time)}`;
    });

  } catch (error) {
    await client.disconnect();
    console.error('Wallet JS Error:', error);
  }
};

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWallet);
} else {
  initWallet();
}

// Note: siteHeader, addXrplLogo, and siteMenu are now handled in header.html or index.js