// src/wallet/wallet.js
import { Wallet, dropsToXrp, rippleTimeToISOTime } from 'xrpl';
import { setPageTitle } from '/index.js';
import xrplClientManager from '../helpers/xrpl-client.js';
import getWalletDetails from '../helpers/get-wallet-details.js';

setPageTitle('Wallet');

async function initWallet() {
  const client = await xrplClientManager.getClient();
  const pageKey = 'wallet';

  const walletElement = document.querySelector('#wallet');
  const walletLoadingDiv = document.querySelector('#loading_wallet_details');
  const ledgerLoadingDiv = document.querySelector('#loading_ledger_details');
  const viewMoreBtn = document.querySelector('#view_more_button');

  // console.log('Form elements:', { walletElement, viewMoreBtn });
  // console.log('Client connected:', await client.isConnected());

  if (!walletElement || !walletLoadingDiv || !ledgerLoadingDiv || !viewMoreBtn) {
    console.error('Required DOM elements not found');
    return;
  }

  try {
    // console.log('Using seed:', process.env.SEED);
    const wallet = Wallet.fromSeed(process.env.SEED);
    // console.log('Wallet address:', wallet.address);

    await client.request({ command: 'subscribe', streams: ['ledger'] });

    getWalletDetails({ client })
      .then(({ accountReserves, account_data, xAddress, address }) => {
        walletElement.querySelector('.wallet-address span').textContent = account_data.Account;
        walletElement.querySelector('.wallet-balance span').textContent = `${dropsToXrp(account_data.Balance)} XRP`;
        walletElement.querySelector('.wallet-reserve span').textContent = `${accountReserves} XRP`;
        walletElement.querySelector('.wallet-xaddress span').textContent = xAddress;

        viewMoreBtn.addEventListener('click', () => {
          window.open(`https://${process.env.EXPLORER_NETWORK}.xrpl.org/accounts/${address}`, '_blank');
        });
      })
      .finally(() => {
        walletLoadingDiv.style.display = 'none';
      });

    xrplClientManager.addListener('ledgerClosed', (ledger) => {
      ledgerLoadingDiv.style.display = 'none';
      document.querySelector('.ledger-index span').textContent = ledger.ledger_index;
      document.querySelector('.ledger-hash span').textContent = ledger.ledger_hash;
      document.querySelector('.close-time span').textContent = rippleTimeToISOTime(ledger.ledger_time);
    }, pageKey);

  } catch (error) {
    // console.error('Wallet JS Error:', error);
    walletLoadingDiv.textContent = 'Error loading wallet details';
    ledgerLoadingDiv.textContent = 'Error loading ledger details';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWallet);
} else {
  initWallet();
}