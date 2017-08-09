const minidom = require('minidom');
const fecha = require('fecha');

const find = (col, fn) => [].find.call(col, fn);
const filter = (col, fn) => [].filter.call(col, fn);
const map = (col, fn) => [].map.call(col, fn);
const last = col => col[col.length - 1];
const getText = el => el.textContent.trim();
const parseDate = date => fecha.parse(date, 'DD.MM.YYYY HH:mm:ss');

module.exports = { getUserInfo, getRecipes, getRecipeDetails };

function getUserInfo(html) {
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

function getRecipes(html) {
  const doc = minidom(html);
  const rows = filter(doc.getElementsByTagName('tr'), row => row.children[0].tagName === 'TD');
  return map(rows, row => getBasicDetails(row));
}

function getBasicDetails(row) {
  const columns = row.children;
  return {
    restaurant: getText(columns[0]),
    time: parseDate(getText(columns[1])),
    price: getText(columns[2]),
    subvention: getText(columns[3]),
    id: parseReceipeId(columns[4]),
  };
}

function parseReceipeId(column) {
  const id = column.getElementsByTagName('a')[0].getAttribute('data-racunid');
  const [MatBrUstanove, BrRacunala, BrDnevnika, DatumDnevnika] = id.split(';');
  return { MatBrUstanove, BrRacunala, BrDnevnika, DatumDnevnika };
}

function getRecipeDetails(html) {
  const dom = minidom(html);
  const rows = filter(dom.getElementsByTagName('tr'), row => row.children[0].tagName === 'TD');
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
