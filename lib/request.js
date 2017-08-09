const pify = require('pify');
const request = require('request').defaults({
  followAllRedirects: true,
  jar: true,
});

module.exports = pify(request, { multiArgs: true });
