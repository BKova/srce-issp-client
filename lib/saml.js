const minidom = require('minidom');
const debugSaml = require('debug')('saml');
const debugHttp = require('debug')('http');

const find = (col, fn) => [].find.call(col, fn);
const reduce = (col, fn, init) => [].reduce.call(col, fn, init);
const map = (col, fn) => [].map.call(col, fn);
const getLocation = resp => resp.request.href.split('?')[0];
const isSAML = str => /^SAML/.test(str);

module.exports = { samlRequest, samlResponse };

function samlRequest(r, html, resp) {
  debugSaml('Sending saml request');
  const samlData = parseSaml(html);
  if (samlData) {
    const options = { form: { SAMLRequest: samlData.payload } };
    debugHttp('POST %s', samlData.url);
    return r.post(samlData.url, options)
      .then(([resp, html]) => samlRequest(r, html, resp));
  }
  return {
    authState: parseAuthState(html),
    url: getLocation(resp),
  };
}

function samlResponse(r, html, data = {}) {
  const samlData = parseSaml(html);
  if (samlData) {
    Object.assign(data, parsePayload(samlData.payload));
    const options = { form: { SAMLResponse: samlData.payload } };
    debugSaml('Sending saml response');
    debugHttp('POST %s', samlData.url);
    return r.post(samlData.url, options)
      .then(([, html]) => samlResponse(r, html, data));
  }
  return { data, html };
}

function parseSaml(html) {
  let data;
  const document = minidom(html);
  const forms = document.getElementsByTagName('form');
  find(forms, (form) => {
    const input = find(form.getElementsByTagName('input'), input =>
      isSAML(input.getAttribute('name')));
    if (!input) return false;
    data = {
      type: input.getAttribute('name'),
      url: form.getAttribute('action'),
      payload: input.getAttribute('value'),
    };
    return true;
  });
  return data;
}

function parseAuthState(html) {
  const document = minidom(html);
  const inputs = document.getElementsByTagName('input');
  const input = find(inputs, input => input.getAttribute('name') === 'AuthState');
  return input && input.getAttribute('value');
}

function parsePayload(payload) {
  const xml = Buffer.from(payload, 'base64').toString();
  const xmldoc = minidom(xml);
  const attributes = xmldoc.getElementsByTagName('saml:Attribute');
  const data = reduce(attributes, (acc, attr) => {
    const name = attr.getAttribute('name');
    const values = map(attr.children, node => node.textContent);
    const value = values.length > 1 ? values : values[0];
    return Object.assign(acc, { [name]: value });
  }, {});
  return data;
}
