const Client = require('./client');
const credentials = require('./credentials');

const client = new Client();

client.login(credentials.username, credentials.password)
  .then(() => client.getRecipes(360))
  .then((recipes) => {
    console.log(recipes);
    return client.getRecipeDetails(recipes[0]);
  })
  .then(html => console.log(html))
  .then(() => client.logout());
