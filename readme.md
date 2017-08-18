# srce-issp-client

> Client for accessing Student information on [ISSP](http://issp.srce.hr).

## Install 

```bash
$ npm install srce-issp-client
```
## Usage
```js
const isspClient = require('srce-issp-client');
const client = new isspClient();
```
##### Client#login(username: string, password: string) => Promise<Client>
* Use to login client. On authentication fail error is thrown. 
* Promise returns client object and appends user info to client.user.
```js
client.login('AAI@Edu username', 'AAI@Edu password');
```
##### Client#getReceipts(maxReceiptAgeInDays: number) => Promise<Array>
* Get all receipts that are not older that `maxReceiptAgeInDays` days. 
* Promise returns receipts array.
```js
client.getReceipts(365);
```
##### Client#getReceiptDetails(receipt: object) => Promise<Object>
* Get details of `receipt`.
* Promise returns receipt details object.
```js
client.getReceiptDetails(receipt);
```
##### Client#logout() => Promise
* Perform logout action.
* Promise returns nothing.
```js
client.logout());
```
## License
MIT © Bartul Kovacic

