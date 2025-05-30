const {
  heroCards,
  renheCards,
  tianshiCards,
  getTianshiDeck,
  getHeroDeckByCountry,
  getNeutralHeroDeck
} = require('./data');

// 所有卡牌的集合
const allCards = {
  hero: heroCards,
  renhe: renheCards,
  tianshi: tianshiCards
};

// 根据卡牌ID获取卡牌
function getCardById(cardId) {
  for (const cardType in allCards) {
    const card = allCards[cardType].find(c => c.id === cardId);
    if (card) return card;
  }
  return null;
}

// 获取指定类型的所有卡牌
function getCardsByType(type) {
  return allCards[type] || [];
}

// 导出所有需要的数据和函数
module.exports = {
  heroCards,
  renheCards,
  tianshiCards,
  getTianshiDeck,
  getHeroDeckByCountry,
  getNeutralHeroDeck,
  getCardById,
  getCardsByType,
  allCards
}; 