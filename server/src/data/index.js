const heroCards = require('./heroCards');
const renheCards = require('./renheCards');
const { tianshiCards, getTianshiDeck } = require('./tianshiCards');

// 根据国家获取英杰牌堆
function getHeroDeckByCountry(country) {
  return heroCards.filter(card => card.country === country);
}

// 获取无所属英杰牌堆
function getNeutralHeroDeck() {
  console.log('[中立英雄] 开始获取中立英雄牌...');
  console.log('[中立英雄] 当前英雄牌总数:', heroCards.length);
  
  const neutralHeroes = heroCards.filter(card => {
    const isNeutral = card.country === '无' || !card.country;
    if (isNeutral) {
      console.log(`[中立英雄] 找到中立英雄: ${card.name} (${card.country})`);
    }
    return isNeutral;
  });
  
  console.log('[中立英雄] 获取到的卡牌数量:', neutralHeroes.length);
  return neutralHeroes;
}

module.exports = {
  heroCards,
  renheCards,
  tianshiCards,
  getTianshiDeck,
  getHeroDeckByCountry,
  getNeutralHeroDeck
}; 