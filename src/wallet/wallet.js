import { dropsToXrp, rippleTimeToISOTime } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import getWalletDetails from '../helpers/get-wallet-details.js';

setPageTitle('Wallet');

async function initWallet() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'wallet'; // Unique key for this page’s listeners

  const walletElement = document.querySelector('#wallet');
  const walletLoadingDiv = document.querySelector('#loading_wallet_details');
  const ledgerLoadingDiv = document.querySelector('#loading_ledger_details');

  if (!walletElement || !walletLoadingDiv || !ledgerLoadingDiv) {
    console.error('Required DOM elements not found');
    return;
  }

  try {
    await client.request({ command: 'subscribe', streams: ['ledger'] });

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

    xrplClientManager.addListener('ledgerClosed', (ledger) => {
      ledgerLoadingDiv.style.display = 'none';
      document.querySelector('#ledger_index').textContent = `Ledger Index: ${ledger.ledger_index}`;
      document.querySelector('#ledger_hash').textContent = `Ledger Hash: ${ledger.ledger_hash}`;
      document.querySelector('#close_time').textContent = `Close Time: ${rippleTimeToISOTime(ledger.ledger_time)}`;
    }, pageKey);

  } catch (error) {
    console.error('Wallet JS Error:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWallet);
} else {
  initWallet();
}