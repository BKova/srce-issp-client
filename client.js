const urlJoin = require('url-join');
const endOfToday = require('date-fns/end_of_today');
const addDays = require('date-fns/add_days');
const isWithinRange = require('date-fns/is_within_range');
const r = require('./lib/request');
const { samlRequest, samlResponse } = require('./lib/saml');
const { parseUserInfoHtml, parseReceiptsHtml, parseReceiptDetailsHtml } = require('./lib/scraper');

const filter = (col, fn) => [].filter.call(col, fn);
const validate = data => Object.keys(data).length !== 0;
const debug = (namespace, ...args) => require('debug')(namespace)(...args);

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
    debug('client', 'Started login');
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
        Object.assign(this.user, parseUserInfoHtml(html), user);
        debug('client', 'Finished login');
        return this;
      });
  }

  getReceipts(dayLimit) {
    debug('client', 'Getting all receipts');
    const url = urlJoin(this.baseUrl, '/StudentRacun');
    const options = {
      qs: { oib: this.user.oib, jmbag: this.user.jmbag },
    };
    debug('http', 'GET %s', url);
    return r.get(url, options)
      .then(([, html]) => parseReceiptsHtml(html))
      .then(receipts => limitDate(receipts, dayLimit));
  }

  getReceiptDetails(receipt) {
    debug('client', 'Getting receipt %o', receipt.id);
    const url = urlJoin(this.baseUrl, '/StudentRacun/RacunDetalji');
    const options = { json: receipt.id };
    debug('http', 'POST %s', url);
    return r.post(url, options)
      .then(([, html]) => Object.assign({}, receipt, { items: parseReceiptDetailsHtml(html) }));
  }

  logout() {
    const url = urlJoin(this.baseUrl, '/KorisnickiRacun/Odjava');
    debug('client', 'Started logout');
    return initAuthAction(url)
      .then(html => samlRequest(r, html))
      .then(() => debug('client', 'Finished logout'));
  }
}

module.exports = Client;

function initAuthAction(url) {
  debug('http', 'GET %s', url);
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
  debug('http', 'POST %s', url);
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

function limitDate(receipts, dayLimit) {
  return filter(receipts, receipt =>
    isWithinRange(receipt.time, addDays(endOfToday(), -dayLimit), endOfToday()),
  );
}
