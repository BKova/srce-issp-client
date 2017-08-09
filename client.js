const urlJoin = require('url-join');
const endOfToday = require('date-fns/end_of_today');
const addDays = require('date-fns/add_days');
const debugClient = require('debug')('client');
const debugHttp = require('debug')('http');
const isWithinRange = require('date-fns/is_within_range');
const r = require('./lib/request');
const { samlRequest, samlResponse } = require('./lib/saml');
const { getUserInfo, getRecipes, getRecipeDetails } = require('./lib/scraper');

const filter = (col, fn) => [].filter.call(col, fn);
const validate = data => Object.keys(data).length !== 0;

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
    debugClient('Started login');
    const url = urlJoin(this.baseUrl, '/isspaaieduhr/login.ashx');
    return initAuthAction(url)
      .then(html => samlRequest(r, html))
      .then(data => doLogin(data.url, credentials, data.authState))
      .then(html => samlResponse(r, html))
      .then(({ data, html }) => {
        if (!validate(data)) {
          const err = new Error('Logging in failed');
          return Promise.reject(err);
        }
        const user = parseUserInfo(data);
        Object.assign(this.user, getUserInfo(html), user);
        debugClient('Finished login');
        return this;
      });
  }

  getRecipes(dayLimit) {
    debugClient('Getting all recipes');
    const url = urlJoin(this.baseUrl, '/StudentRacun');
    const options = {
      qs: { oib: this.user.oib, jmbag: this.user.jmbag },
    };
    debugHttp('GET %o', url);
    return r.get(url, options)
      .then(([, html]) => getRecipes(html))
      .then(recipes => filter(recipes, recipe => limitDate(recipe.time, dayLimit)));
  }

  getRecipeDetails(recipe) {
    debugClient('Getting recipe %o', recipe.id);
    const url = urlJoin(this.baseUrl, '/StudentRacun/RacunDetalji');
    const options = { json: recipe.id };
    debugHttp('POST %o', url);
    return r.post(url, options)
      .then(([, html]) => getRecipeDetails(html));
  }

  logout() {
    const url = urlJoin(this.baseUrl, '/KorisnickiRacun/Odjava');
    debugClient('Started logout');
    return initAuthAction(url)
      .then(html => samlRequest(r, html))
      .then(() => debugClient('Finished logout'));
  }
}

module.exports = Client;

function initAuthAction(url) {
  debugHttp('GET %o', url);
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
  debugHttp('POST %o', url);
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

function limitDate(date, dayLimit) {
  return isWithinRange(date, addDays(endOfToday(), -dayLimit), endOfToday());
}
