const Client = require('./client');
const credentials = require('./credentials');

const client = new Client();

client.login(credentials.username, credentials.password)
  .then(() => client.getReceipts(180))
  .then((receipts) => {
    console.log(receipts);
    return client.getReceiptDetails(receipts[0]);
  })
  .then(html => console.log(html))
  .then(() => client.logout());
