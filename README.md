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


Escrow:
- To
    - Condition
    - Fulfillment
    - FURTURE: Delivery date + 15 days to execute the escrow once the fulfillment key has been sent.
- From
    - Enter the fulfillment key to execute payment
    - Escrow is closed out when key is entered
    - There will be a 15 day grace period to close out

I want to create a couple of pages between a buyer and seller. The buyer can initiate the purchase of N the purchase can just be the amount of XRP and the address for the seller. When the purchase is made a escrow condition is created and all created escrows should show in a datagrid below. For each record the: to address, amount of XRP, XRP transaction fee, condition, fulfillment, date created, status: 'created' || 'closed out' || 'cancelled'. On the seller page they have a datagrid of the escrows sent to them the data datagrid should have: from address, amount of xrp, status, a field to enter the fulfillment key, a submit || cancel. The seller grid should show all cancelled, closed out, created. If it is cancelled or closed out the fulfillment field and submit button are disabled. These pages should use the ledger and not local storage.