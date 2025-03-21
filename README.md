# crux

/crux/
├── src/
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
├── assets/
├── index.html
├── index.js
├── index.css
├── vite.config.js
├── package.json
├── .env

/crux/
├── backend/                # New backend folder for PostgreSQL integration
│   ├── config/             # Configuration files
│   │   └── db.js           # Database connection setup
│   ├── routes/             # API route handlers
│   │   └── api.js          # API endpoints (e.g., /deliveries, /transactions)
│   ├── models/             # Database models (schema definitions)
│   │   └── delivery.js     # Model for deliveries table
│   ├── package.json        # Backend dependencies (e.g., express, pg)
│   ├── server.js           # Main backend server file
│   └── .env                # Environment variables (e.g., database credentials)


Escrow:
- To
    - Condition
    - Fulfillment
    - FURTURE: Delivery date + 15 days to execute the escrow once the fulfillment key has been sent.
- From
    - Enter the fulfillment key to execute payment
    - Escrow is closed out when key is entered
    - There will be a 15 day grace period to close out