const urlJoin = require('url-join');
const r = require('./lib/request');
const { samlRequest, samlResponse } = require('./lib/saml');
const { getUserInfo, getRecipes } = require('./lib/scraper');

const filter = (col, fn) => [].filter.call(col, fn);

class Client {
  constructor() {
    this.baseUrl = 'https://issp.srce.hr/';
    this.user = {};
  }

  login(username, password) {
    const credentials = {
      username,
      password,
    };

    const url = urlJoin(this.baseUrl, '/isspaaieduhr/login.ashx');
    return initLogin(url)
      .then(html => samlRequest(r, html))
      .then(data => doLogin(data.url, credentials, data.authState))
      .then(html => samlResponse(r, html))
      .then(({ data, html }) => {
        const user = parseUserInfo(data);
        Object.assign(this.user, getUserInfo(html), user);
        return this;
      });
  }

  getRecipes(dayLimit) {
    const url = urlJoin(this.baseUrl, '/StudentRacun');
    const options = {
      qs: { oib: this.user.oib, jmbag: this.user.jmbag },
    };
    return r.get(url, options)
      .then(([, html]) => getRecipes(html))
      .then(recipes => filter(recipes, recipe => limitDate(recipe.time, dayLimit)));
  }

  getRecipeDetails(recipe) {
    const url = urlJoin(this.baseUrl, '/StudentRacun/RacunDetalji');
    const options = { json: recipe.id };
    return r.post(url, options)
      .then(([, html]) => html);
  }
}

module.exports = Client;

function initLogin(url) {
  return r.get(url)
    .then(([, html]) => html);
}

function doLogin(url, credentials, authState) {
  const options = {
    form: {
      username: credentials.username,
      password: credentials.password,
      Submit: 'Prijavi+se',
      AuthState: authState,
    },
  };
  return r.post(url, options)
    .then(([, html]) => html);
}

function parseUserInfo(data) {
  const { givenName: name, sn: lastname } = data;
  const [, jmbg] = data.hrEduOrgUniqueNumber[0].split(' ');
  const [, oib] = data.hrEduOrgUniqueNumber[1].split(' ');
  return {
    name,
    lastname,
    jmbg,
    oib,
  };
}

// TODO: implement midnight check
function limitDate(date, dayLimit) {
  // return (new Date()).getTime() - (dayLimit * (86400000)) < date;
  return ((new Date()) - date) / 86400000 < dayLimit;
}
