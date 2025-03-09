Let's start the documentation about the curx application. Below is the app structure. Don't mention any import of css into the package.json because that is being handled by prepros css compiler. Also, assets is where i house images or videos so you can ignore that folder.

/crux/
├── src/
│   ├── helpers/
│   │   ├── get-wallet-details.js
│   │   ├── submit-transaction.js
│   │   ├── data.js             
│   ├── wallet/
│   │   ├── wallet.html
│   │   ├── wallet.js
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboard.js
│   ├── map/
│   │   ├── map.html
│   │   ├── map.js
│   ├── send-xrp/
│   │   ├── send-xrp.html
│   │   ├── send-xrp.js
│   ├── transaction-history/
│   │   ├── transaction-history.html
│   │   ├── transaction-history.js
│   ├── styles/
│   │   ├── main.scss
│   │   ├── abstracts/
|   |   |   ├── mixins.scss
|   |   |   ├── variables.scss
│   │   ├── base/
|   |   |   ├── reset.scss
|   |   |   ├── typography.scss
│   │   ├── components/
|   |   |   ├── filters.scss
|   |   |   ├── footer.scss
|   |   |   ├── header.scss
|   |   |   ├── layout.scss
│   │   ├── pages/
|   |   |   ├── dashboard.scss
|   |   |   ├── map.scss
|   |   |   ├── send-xrp.scss
|   |   |   ├── transaction-history.scss
|   |   |   ├── wallet.scss
├── assets/
├── index.html
├── index.js
├── index.css
├── vite.config.js
├── package.json
├── .env

below is the code for the app.

<!-- src/dashboard/dashboard.html -->
<div id="dashboard-info">
    <p>Welcome to your XRP Dashboard!</p>
</div>

// src/dashboard/dashboard.js
import { setPageTitle } from '/index.js';

// Set page title
setPageTitle('Dashboard');

function initDashboard() {
  const dashboardInfo = document.querySelector('#dashboard-info');
  if (dashboardInfo) {
    dashboardInfo.innerHTML = '<p>Welcome to your XRP Dashboard!</p>';
  }
  console.log('Dashboard JS loaded');
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// src/helpers/data.js
const companies = [
    { name: "ExxonMobil", lat: 45.1234, lng: -93.4567, barrels: 750000, category: "Light", rating: 4, pricePerBarrel: 65 },
    { name: "Chevron", lat: 32.9876, lng: -117.5432, barrels: 1200000, category: "Medium", rating: 3, pricePerBarrel: 72 },
    { name: "BP", lat: 51.2345, lng: -0.8765, barrels: 300000, category: "Heavy", rating: 5, pricePerBarrel: 88 },
    { name: "Shell", lat: 52.6789, lng: 4.3210, barrels: 900000, category: "Light", rating: 2, pricePerBarrel: 50 },
    { name: "TotalEnergies", lat: 48.7654, lng: 2.1098, barrels: 450000, category: "Medium", rating: 4, pricePerBarrel: 78 },
    { name: "ConocoPhillips", lat: 29.4321, lng: -95.6789, barrels: 600000, category: "Heavy", rating: 1, pricePerBarrel: 45 },
    { name: "Eni", lat: 41.9876, lng: 12.3456, barrels: 200000, category: "Light", rating: 5, pricePerBarrel: 92 },
    { name: "Equinor", lat: 60.5432, lng: 5.6789, barrels: 850000, category: "Medium", rating: 3, pricePerBarrel: 60 },
    { name: "Occidental Petroleum", lat: 34.5678, lng: -119.1234, barrels: 150000, category: "Heavy", rating: 2, pricePerBarrel: 55 },
    { name: "Saudi Aramco", lat: 24.8765, lng: 46.5432, barrels: 1800000, category: "Light", rating: 4, pricePerBarrel: 70 },
    { name: "Petrobras", lat: -22.9876, lng: -43.2109, barrels: 700000, category: "Medium", rating: 5, pricePerBarrel: 85 },
    { name: "Lukoil", lat: 55.6789, lng: 37.4321, barrels: 950000, category: "Heavy", rating: 3, pricePerBarrel: 62 },
    { name: "Rosneft", lat: 61.2345, lng: 73.9876, barrels: 1100000, category: "Light", rating: 1, pricePerBarrel: 48 },
    { name: "Marathon Oil", lat: 39.8765, lng: -83.5432, barrels: 250000, category: "Medium", rating: 4, pricePerBarrel: 75 },
    { name: "Hess Corporation", lat: 40.5432, lng: -74.8765, barrels: 400000, category: "Heavy", rating: 2, pricePerBarrel: 52 },
    { name: "Sinopec", lat: 31.1234, lng: 121.6789, barrels: 1300000, category: "Light", rating: 5, pricePerBarrel: 90 },
    { name: "CNPC", lat: 39.4321, lng: 116.2109, barrels: 800000, category: "Medium", rating: 3, pricePerBarrel: 68 },
    { name: "Phillips 66", lat: 36.9876, lng: -95.1234, barrels: 350000, category: "Heavy", rating: 4, pricePerBarrel: 80 },
    { name: "Valero Energy", lat: 29.2109, lng: -98.7654, barrels: 500000, category: "Light", rating: 2, pricePerBarrel: 58 },
    { name: "Repsol", lat: 40.6789, lng: -3.5432, barrels: 650000, category: "Medium", rating: 1, pricePerBarrel: 47 },
    { name: "Devon Energy", lat: 35.5432, lng: -97.8765, barrels: 200000, category: "Heavy", rating: 5, pricePerBarrel: 87 },
    { name: "Apache Corporation", lat: 32.1098, lng: -110.4321, barrels: 450000, category: "Light", rating: 3, pricePerBarrel: 64 },
    { name: "Pemex", lat: 19.8765, lng: -99.1234, barrels: 1000000, category: "Medium", rating: 4, pricePerBarrel: 76 },
    { name: "Kuwait Petroleum", lat: 29.3456, lng: 47.9876, barrels: 1500000, category: "Heavy", rating: 2, pricePerBarrel: 53 },
    { name: "Gazprom Neft", lat: 59.4321, lng: 30.6789, barrels: 700000, category: "Light", rating: 5, pricePerBarrel: 91 }
];
export default companies;

// src/helpers/get-wallet-details.js
import { Client, Wallet, classicAddressToXAddress } from 'xrpl';

export default async function getWalletDetails({ client }) {
    try {
        const wallet = Wallet.fromSeed(process.env.SEED); // Convert the seed to a wallet : https://xrpl.org/cryptographic-keys.html

        // Get the wallet details: https://xrpl.org/account_info.html
        const {
            result: { account_data },
        } = await client.request({
            command: 'account_info',
            account: wallet.address,
            ledger_index: 'validated',
        });

        const ownerCount = account_data.OwnerCount || 0;

        // Get the reserve base and increment
        const {
            result: {
                info: {
                    validated_ledger: { reserve_base_xrp, reserve_inc_xrp },
                },
            },
        } = await client.request({
            command: 'server_info',
        });

        // Calculate the reserves by multiplying the owner count by the increment and adding the base reserve to it.
        const accountReserves = ownerCount * reserve_inc_xrp + reserve_base_xrp;

        //console.log('Got wallet details!');

        return { 
            account_data, 
            accountReserves, 
            xAddress: classicAddressToXAddress(wallet.address, false, false), // Learn more: https://xrpaddress.info/
            address: wallet.address 
        };
    } catch (error) {
        console.log('Error getting wallet details', error);
        return error;
    }
}

// src/helpers/submit-transaction.js
import { Wallet } from 'xrpl';

export default async function submitTransaction({ client, tx }) {
    try {
        // Create a wallet using the seed
        const wallet = await Wallet.fromSeed(process.env.SEED);
        tx.Account = wallet.address;

        // Sign and submit the transaction : https://xrpl.org/send-xrp.html#send-xrp
        const response = await client.submit(tx, { wallet });
        console.log(response);

        return response;
    } catch (error) {
        console.log(error);
        return null;
    }
}

<!-- src/map/map.html -->
<div id="map"></div>
<div class="filter-container">
  <select id="category-select">
    <option value="all">Grade</option>
    <option value="Light">Light</option>
    <option value="Medium">Medium</option>
    <option value="Heavy">Heavy</option>
  </select>
  <div class="star-rating" id="star-rating"></div>
  <div class="barrels-container">
    <label>Barrels: </label>
    <input type="range" id="barrels-slider" min="0" max="1000000" value="1000000" step="50000" style="width: 200px;" />
    <span id="barrels-value">1.0M</span>
  </div>
  <div class="price-container">
    <label>Price/Barrel: $</label>
    <input type="range" id="price-slider" min="45" max="92" value="92" step="1" style="width: 200px;" />
    <span id="price-value">$92</span>
  </div>
  <span class="no-results" id="no-results"></span>
</div>

// src/map/map.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import companies from '../helpers/data.js';
import { setPageTitle } from '/index.js';

// Set the page title
setPageTitle('Map');

function formatNumberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initMap() {
  const mapDiv = document.getElementById('map');
  const filterContainer = document.querySelector('.filter-container');
  const categorySelect = document.getElementById('category-select');
  const ratingContainer = document.getElementById('star-rating');
  const barrelsSlider = document.getElementById('barrels-slider');
  const barrelsValue = document.getElementById('barrels-value');
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  const noResultsMessage = document.getElementById('no-results');

  if (!mapDiv || !filterContainer || !categorySelect || !ratingContainer || !barrelsSlider || !priceSlider) {
    console.error('Required DOM elements not found');
    return;
  }

  // Initialize Leaflet map
  const map = L.map(mapDiv);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Create markers
  const markers = companies.map(company => {
    const marker = L.marker([company.lat, company.lng])
      .bindPopup(`<strong>${company.name}</strong><br>
        Barrels: ${formatNumberWithCommas(company.barrels)}<br>
        Price/Barrel: $${company.pricePerBarrel}<br>
        Rating: ${company.rating}`);
    marker.on('click', () => {
      map.setView([company.lat, company.lng], 10);
    });
    return marker;
  });

  // Star rating setup
  let selectedRating = 'all';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
      </svg>
    `;
    star.dataset.rating = i;
    star.addEventListener('click', () => {
      selectedRating = star.dataset.rating;
      ratingContainer.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('active', Number(s.dataset.rating) <= Number(selectedRating));
      });
      updateMap(categorySelect.value, selectedRating, barrelsSlider.value, priceSlider.value);
    });
    ratingContainer.appendChild(star);
  }

  function updateMap(category, rating, barrels, price) {
    noResultsMessage.textContent = '';
    markers.forEach(marker => marker.remove());

    let filtered = companies;
    if (category !== 'all') {
      filtered = filtered.filter(company => company.category === category);
    }
    if (rating !== 'all') {
      filtered = filtered.filter(company => company.rating === Number(rating));
    }
    if (barrels !== 'all') {
      filtered = filtered.filter(company => company.barrels <= Number(barrels));
    }
    if (price !== 'all') {
      filtered = filtered.filter(company => company.pricePerBarrel <= Number(price));
    }

    const visibleMarkers = [];
    filtered.forEach((company, index) => {
      const marker = markers[companies.indexOf(company)];
      marker.addTo(map);
      visibleMarkers.push(marker);
    });

    if (filtered.length > 0) {
      const filteredBounds = L.latLngBounds(filtered.map(c => [c.lat, c.lng]));
      map.fitBounds(filteredBounds, { padding: [50, 50] });
    } else {
      noResultsMessage.textContent = 'No Results Found';
      map.setView([37.7749, -122.4194], 5);
    }
  }

  // Event listeners for filters
  categorySelect.addEventListener('change', (e) => {
    updateMap(e.target.value, selectedRating, barrelsSlider.value, priceSlider.value);
  });

  barrelsSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    barrelsValue.textContent = `${(value / 1000000).toFixed(1)}M`;
    updateMap(categorySelect.value, selectedRating, e.target.value, priceSlider.value);
  });

  priceSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    priceValue.textContent = `$${value}`;
    updateMap(categorySelect.value, selectedRating, barrelsSlider.value, e.target.value);
  });

  // Initial load
  markers.forEach(marker => marker.addTo(map));
  const initialBounds = L.latLngBounds(companies.map(c => [c.lat, c.lng]));
  map.fitBounds(initialBounds, { padding: [50, 50] });

  // Move filter container before map (ensures proper stacking)
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.insertBefore(filterContainer, mapDiv);
  }
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}

<!-- src/send-xrp/send-xrp.html -->
<div class="send_xrp_container">
  <div class="heading_h3">Send XRP</div>
  <div class="available_balance" id="available_balance"></div>
  <label for="destination_address">Destination Address:</label>
  <input type="text" id="destination_address" placeholder="Destination Address" maxlength="35" />
  <span class="isvalid_destination_address" id="isvalid_destination_address"></span>
  <label for="amount">Amount:</label>
  <input type="text" id="amount" placeholder="Amount" />
  <label for="destination_tag">Destination Tag:</label>
  <input type="text" id="destination_tag" placeholder="Destination Tag" />
  <button class="submit_tx_button" id="submit_tx_button">Submit Transaction</button>
</div>

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

<!-- src/transaction-history/transaction-history.html -->
<div class="tx_history_container">
  <div class="heading_h3">Transaction History</div>
  <div class="tx_history_data" id="tx_history_data"></div>
  <button class="load_more_button" id="load_more_button">Load More</button>
</div>

// src/transaction-history/transaction-history.js
import { Client, Wallet, convertHexToString, dropsToXrp } from 'xrpl';
import { setPageTitle } from '/index.js';

// Set the page title
setPageTitle('Transaction History');

// Declare variables
let marker = null;

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

async function fetchTxHistory(txHistoryElement, loadMore) {
  try {
    loadMore.textContent = 'Loading...';
    loadMore.disabled = true;

    const wallet = Wallet.fromSeed(process.env.SEED);
    const client = new Client(process.env.CLIENT);

    await client.connect();

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
      const { hash, meta, tx_json } = transaction;
      return {
        Account: tx_json.Account,
        Destination: tx_json.Destination,
        Fee: tx_json.Fee,
        Hash: hash,
        TransactionType: tx_json.TransactionType,
        result: meta?.TransactionResult,
        delivered: meta?.delivered_amount,
      };
    });

    loadMore.style.display = nextMarker ? 'block' : 'none';

    if (values.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="7">No transactions found</td>`;
      txHistoryElement.appendChild(row);
    } else {
      values.forEach((value) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          ${value.Account ? `<td>${value.Account}</td>` : '<td>-</td>'}
          ${value.Destination ? `<td>${value.Destination}</td>` : '<td>-</td>'}
          ${value.Fee ? `<td>${dropsToXrp(value.Fee)}</td>` : '<td>-</td>'}
          <td>${renderAmount(value.delivered)}</td>
          ${value.TransactionType ? `<td>${value.TransactionType}</td>` : '<td>-</td>'}
          ${value.result ? `<td>${value.result}</td>` : '<td>-</td>'}
          ${value.Hash ? `<td><a href="https://${process.env.EXPLORER_NETWORK}.xrpl.org/transactions/${value.Hash}" target="_blank">View</a></td>` : '<td>-</td>'}
        `;
        txHistoryElement.appendChild(row);
      });
    }

    await client.disconnect();
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

function initTransactionHistory() {
  const txHistoryElement = document.querySelector('#tx_history_data');
  const loadMore = document.querySelector('#load_more_button');

  if (!txHistoryElement || !loadMore) {
    console.error('Required DOM elements not found');
    return;
  }

  // Add table header
  const header = document.createElement('tr');
  header.innerHTML = `
    <th>Account</th>
    <th>Destination</th>
    <th>Fee (XRP)</th>
    <th>Amount Delivered</th>
    <th>Transaction Type</th>
    <th>Result</th>
    <th>Link</th>
  `;
  txHistoryElement.appendChild(header);

  // Render transaction history
  async function renderTxHistory() {
    marker = await fetchTxHistory(txHistoryElement, loadMore);
    loadMore.addEventListener('click', async () => {
      const nextMarker = await fetchTxHistory(txHistoryElement, loadMore);
      marker = nextMarker;
    });
  }

  renderTxHistory();
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransactionHistory);
} else {
  initTransactionHistory();
}

<!-- src/wallet/wallet.html -->
<div class="wallet_details" id="wallet">
  <div class="heading_h3">Account Info:</div>
  <div id="loading_wallet_details">Loading Wallet Details...</div>
  <span class="wallet_address"></span>
  <span class="wallet_balance"></span>
  <span class="wallet_reserve"></span>
  <span class="wallet_xaddress"></span>
  <span class="view_more"><a id="view_more_button">View More</a></span>
</div>
<div class="ledger_details">
  <div class="heading_h3">Latest Validated Ledger:</div>
  <div id="loading_ledger_details">Loading Ledger Details...</div>
  <span class="ledger_index" id="ledger_index"></span>
  <span class="ledger_hash" id="ledger_hash"></span>
  <span class="close_time" id="close_time"></span>
</div>

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

# .env
# https://xrpl.org/resources/dev-tools/xrp-faucets
CLIENT=wss://s.altnet.rippletest.net:51233/
SEED=sEdVhtZAzrQ3PYvsKe6qABP3J6pH9K2
EXPLORER_NETWORK=testnet

<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./assets/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CruX - ${pageTitle}</title>
    <link rel="preload" href="/index.css" as="style">
    <link rel="stylesheet" href="/index.css">
  </head>
  <body>
    <div id="app">
      <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo">
              <img alt="CruX" src="/src/assets/logo.svg" />
            </div>
          </div>
          <div class="search-bar">
            <input type="text" placeholder="Search..." id="search-input" />
          </div>
          <nav class="sidebar-menu" id="site_menu">
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/wallet">Wallet</a></li>
              <li><a href="/send-xrp">Send XRP</a></li>
              <li><a href="/transaction-history">Transaction History</a></li>
              <li><a href="/map">Map</a></li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <header class="header" id="site_header">
            <h1 id="page-title"></h1>
          </header>
          <div class="content" id="page-content"></div>
          <footer class="footer">
            <p>&copy; 2025 CruX. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
    <script type="module" src="./index.js"></script>
  </body>
</html>

// index.js
async function loadComponent(containerId, componentUrl) {
    try {
      const response = await fetch(componentUrl);
      const html = await response.text();
      document.getElementById(containerId).innerHTML = html;
    } catch (error) {
      console.error(`Error loading component ${componentUrl}:`, error);
    }
  }
  
  export function setPageTitle(title) {
    document.title = `CruX - ${title}`;
    const titleElement = document.getElementById('page-title');
    if (titleElement) titleElement.textContent = title;
  }
  
  async function loadPage(pageName) {
    const contentContainer = document.getElementById('page-content');
    
    try {
      const htmlResponse = await fetch(`/src/${pageName}/${pageName}.html`);
      const html = await htmlResponse.text();
      contentContainer.innerHTML = html;
  
      const existingScript = document.getElementById('page-script');
      if (existingScript) existingScript.remove();
  
      const script = document.createElement('script');
      script.type = 'module';
      script.id = 'page-script';
      script.src = `/src/${pageName}/${pageName}.js`;
      script.onload = () => console.log(`${pageName}.js loaded`);
      script.onerror = () => console.log(`No JS file found for ${pageName}`);
      document.body.appendChild(script);
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
      contentContainer.innerHTML = '<h2>404 - Page Not Found</h2>';
    }
  }
  
  function getPageFromPath() {
    const path = window.location.pathname.slice(1); // Remove leading "/"
    return path || 'dashboard'; // Default to 'dashboard' if path is empty (i.e., "/")
  }
  
  function handleNavigation(event) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    if (href) {
      const pageName = href === '/' ? 'dashboard' : href.slice(1); // Map "/" to "dashboard"
      window.history.pushState({}, '', href); // Update URL without reloading
      loadPage(pageName);
    }
  }
  
  // Load components and initial page
  document.addEventListener('DOMContentLoaded', () => {
    // loadComponent('header-container', '/src/components/header.html');
    // loadComponent('footer-container', '/src/components/footer.html');
  
    // Load initial page based on URL
    const initialPage = getPageFromPath();
    loadPage(initialPage);
  
    // Add click handlers to nav links after header loads
    setTimeout(() => {
      const navLinks = document.querySelectorAll('nav a');
      navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    }, 100); // Delay to ensure header is loaded
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const page = getPageFromPath();
    loadPage(page);
  });

package.json
  {
  "name": "crux",
  "private": true,
  "version": "0.0.0",
  "author": "Carl Widdowson",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@esbuild-plugins/node-globals-polyfill": "^0.2.3",
    "crypto-browserify": "^3.12.0",
    "events": "^3.3.0",
    "https-browserify": "^1.0.0",
    "rollup-plugin-polyfill-node": "^0.12.0",
    "stream-browserify": "^3.0.0",
    "stream-http": "^3.2.0",
    "vite": "^6.2.0"
  },
  "dependencies": {
    "chart.js": "^4.4.8",
    "dotenv": "^16.0.3",
    "leaflet": "^1.9.4",
    "vite": "^6.2.0",
    "xrpl": "^4.0.0"
  }
}

// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import polyfillNode from 'rollup-plugin-polyfill-node';

const viteConfig = ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, '', '') };
    return defineConfig({
        root: './', // Explicitly set the root to the project directory
        define: {
            'process.env': process.env,
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
        build: {
            outDir: 'dist', // Output directory for the build
            rollupOptions: {
                plugins: [polyfillNode()],
                input: {
                    main: 'index.html', // Explicitly define the entry point
                },
            },
        },
        resolve: {
            alias: {
                ws: 'xrpl/dist/npm/client/WSWrapper',
            },
        },
        server: {
            // Enable SPA routing in development
            historyApiFallback: true, // Serve index.html for all routes
        },
    });
};

export default viteConfig;