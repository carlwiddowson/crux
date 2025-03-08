export default function siteMenu() {
    // Inject the buttons into the DOM
    document.getElementById('site_menu').innerHTML = `
        <button class="home" id="home_button">Home</button>
        <button class="wallet" id="wallet_button">Wallet</button>
        <button class="send_xrp" id="send_xrp_button">Send XRP</button>
        <button class="transaction_history" id="transaction_history_button">Transaction History</button>
        <button class="map" id="map_button">Map</button>
    `;

    // Query the buttons AFTER they are added to the DOM
    const homeButton = document.querySelector('#home_button');
    const walletButton = document.querySelector('#wallet_button');
    const sendXrpButton = document.querySelector('#send_xrp_button');
    const transHistoryButton = document.querySelector('#transaction_history_button');
    const mapButton = document.querySelector('#map_button');

    // Add event listeners
    homeButton.addEventListener('click', () => {
        window.location.pathname = '/';
    });

    walletButton.addEventListener('click', () => {
        window.location.pathname = '/src/wallet/wallet.html';
    });

    sendXrpButton.addEventListener('click', () => {
        window.location.pathname = '/src/send-xrp/send-xrp.html';
    });

    transHistoryButton.addEventListener('click', () => {
        window.location.pathname = '/src/transaction-history/transaction-history.html';
    });

    mapButton.addEventListener('click', () => {
        window.location.pathname = '/src/map/map.html';
    });
}