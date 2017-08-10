# srce-issp-client

> Client for accessing Student information on [ISSP](http://issp.srce.hr).

## Install 

```
$ npm install BKova/srce-issp-client
```
Note: Currently there is no NPM package officialy released.

## Usage
```
Example:
const isspClient = require('srce-issp-client');
const client = new isspClient();
```
#### Login
##### Client.login [Method] (username: string, password: string) => Promise
* Use to login client. On authentication fail error is thrown. 
* Promise returns client object and appends user info to client.user.
```
const  loginPromise = client.login('AAI@Edu username', 'AAI@Edu password');
```
#### GetRecipes
##### Client.getRecipes [Method] (maxRecipeAgeInDays: number) => Promise
* Get all recipes that are not older that `maxRecipeAgeInDays` days. 
* Promise returns recipes array.
```
const recipesPromise = loginPromise
  .then(client => client.getRecipes(365));
```
#### GetRecipeDetails
##### Client.getRecipeDetails [Method] (recipe: object) => Promise
* Get details of `recipe`.
* Promise returns recipe details object.
```
const recipeDetailsPromise = recipesPromise
  .then(recipes => client.getRecipeDetails(recipes[0]));
```
#### Logout
##### Client.logout [Method] () => Promise
* Perform logout action.
* Promise returns nothing.
```
recipeDetailsPromise
  .then(() => client.logout());
```
## License
MIT © Bartul Kovacic

