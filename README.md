# crux

/crux/
├── backend/                          # npm start :5001
│   ├── config/
│   │   ├── db.js
│   ├── routes/
│   │   ├── api.js
│   ├── models/
│   │   ├── ads.js
│   │   ├── branding.js
│   │   ├── deliveries.js
│   │   ├── favorites.js
│   │   ├── group.js
│   │   ├── history.js
│   │   ├── inventory.js
│   │   ├── locations.js
│   │   ├── login_history.js
│   │   ├── messaging.js
│   │   ├── organization.js
│   │   ├── permissions.js
│   │   ├── rating.js
│   │   ├── status.js
│   │   ├── transactions.js
│   │   ├── users.js
│   │   ├── wallets.js
│   ├── package.json
│   ├── server.js
│   ├── .env
├── public/                         # http-server -p 8080
│   ├── assets/
│   │   ├── images/
│   │   ├── styles/
│   │   │   ├── main.scss
│   ├── css/
│   │   ├── styles.css
│   ├── js/
│   │   ├── login.js
│   │   ├── register.js
│   ├── index.html
│   ├── register.html
├── src/                            # npm start :5173
│   ├── delivery-status/
│   │   ├── delivery-status.html
│   │   ├── delivery-status.js
│   ├── escrow-payments/
│   │   ├── escrow-payments.html
│   │   ├── escrow-payments.js
│   │   ├── data.js   
│   ├── helpers/
│   │   ├── xrpl-client.js
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
|   |   |   ├── delivery-status.scss
|   |   |   ├── map.scss
|   |   |   ├── send-xrp.scss
|   |   |   ├── transaction-history.scss
|   |   |   ├── wallet.scss
├── index.html
├── index.js
├── index.css
├── vite.config.js
├── package.json
├── .env
├── yarn.lock
├── prepros.config


Escrow:
- To
    - Condition
    - Fulfillment
    - FURTURE: Delivery date + 15 days to execute the escrow once the fulfillment key has been sent.
- From
    - Enter the fulfillment key to execute payment
    - Escrow is closed out when key is entered
    - There will be a 15 day grace period to close out