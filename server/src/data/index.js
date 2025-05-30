const heroCards = require('./heroCards');
const renheCards = require('./renheCards');
const { tianshiCards, getTianshiDeck } = require('./tianshiCards');

// 根据国家获取英杰牌堆
function getHeroDeckByCountry(country) {
  return heroCards.filter(card => card.country === country);
}

// 获取无所属英杰牌堆
function getNeutralHeroDeck() {
  return heroCards.filter(card => !card.country);
}

module.exports = {
  heroCards,
  renheCards,
  tianshiCards,
  getTianshiDeck,
  getHeroDeckByCountry,
  getNeutralHeroDeck
}; 