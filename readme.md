# srce-issp-client
[![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/srce-issp-client)

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
##### Client#getRecipes(maxRecipeAgeInDays: number) => Promise<Array>
* Get all recipes that are not older that `maxRecipeAgeInDays` days. 
* Promise returns recipes array.
```js
client.getRecipes(365);
```
##### Client#getRecipeDetails(recipe: object) => Promise<Object>
* Get details of `recipe`.
* Promise returns recipe details object.
```js
client.getRecipeDetails(recipe);
```
##### Client#logout() => Promise
* Perform logout action.
* Promise returns nothing.
```js
client.logout());
```
## License
MIT © Bartul Kovacic

