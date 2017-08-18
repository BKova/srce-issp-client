const minidom = require('minidom');
const fecha = require('fecha');

const find = (col, fn) => [].find.call(col, fn);
const filter = (col, fn) => [].filter.call(col, fn);
const map = (col, fn) => [].map.call(col, fn);
const last = col => col[col.length - 1];
const isElement = (el, tagname) => el.tagName === tagname.toUpperCase();
const getText = el => el.textContent.trim();
const parseDate = date => fecha.parse(date, 'DD.MM.YYYY HH:mm:ss');

module.exports = { parseUserInfoHtml, parseReceiptsHtml, parseReceiptDetailsHtml };

function parseUserInfoHtml(html) {
  const doc = minidom(html);
  const img = find(doc.getElementsByTagName('img'), img => img.getAttribute('class') === 'slikastud');
  const balance = last(getText(findElement(doc, 'Raspoloživi saldo')).split(' '));
  const jmbag = last(getText(findElement(doc, 'JMBAG')).split(' '));
  return {
    img: img.getAttribute('src'),
    balance,
    jmbag,
  };
}

function findElement(doc, text) {
  const label = find(doc.getElementsByTagName('strong'), el => getText(el) === text);
  return label.parentNode;
}

function parseReceiptsHtml(html) {
  const doc = minidom(html);
  const rows = filter(doc.getElementsByTagName('tr'), row => isElement(row.children[0], 'td'));
  return map(rows, (row) => {
    const columns = row.children;
    return {
      restaurant: getText(columns[0]),
      time: parseDate(getText(columns[1])),
      price: getText(columns[2]),
      subvention: getText(columns[3]),
      id: parseReceiptId(columns[4]),
    };
  });
}

function parseReceiptId(column) {
  const id = column.getElementsByTagName('a')[0].getAttribute('data-racunid');
  const [MatBrUstanove, BrRacunala, BrDnevnika, DatumDnevnika] = id.split(';');
  return { MatBrUstanove, BrRacunala, BrDnevnika, DatumDnevnika };
}

function parseReceiptDetailsHtml(html) {
  const dom = minidom(html);
  const rows = filter(dom.getElementsByTagName('tr'), row => isElement(row.children[0], 'td'));
  return map(rows, (row) => {
    const columns = row.children;
    return {
      id: getText(columns[0]),
      name: getText(columns[1]),
      price: getText(columns[2]),
      quantity: Number(getText(columns[3])),
      totalPrice: getText(columns[4]),
      subvention: getText(columns[5]),
    };
  });
}
