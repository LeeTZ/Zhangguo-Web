// 人和牌类型
const RENHE_CARD_TYPES = {
  JUNLUE: 'junlue',    // 军略
  MIMOU: 'mimou',      // 密谋
  NEIZHENG: 'neizheng', // 内政
  WAIJIAO: 'waijiao'    // 外交
};

// 生成人和牌
function createRenheCards() {
  const cards = [];
  let id = 1;

  // 军略牌 - 15张
  Array(15).fill().forEach(() => {
    cards.push({
      id: `renhe_${id++}`,
      name: '军略',
      type: 'renhe',
      cardType: RENHE_CARD_TYPES.JUNLUE,
      description: '可用于：1.出兵（+1）；2.征兵（+1）；3.调兵（移动1个兵力）',
      effect: {
        type: RENHE_CARD_TYPES.JUNLUE,
        value: 1
      }
    });
  });

  // 密谋牌 - 15张
  Array(15).fill().forEach(() => {
    cards.push({
      id: `renhe_${id++}`,
      name: '密谋',
      type: 'renhe',
      cardType: RENHE_CARD_TYPES.MIMOU,
      description: '可用于：1.谋略（+1）；2.离间（-1）；3.策反（转移1个兵力）',
      effect: {
        type: RENHE_CARD_TYPES.MIMOU,
        value: 1
      }
    });
  });

  // 内政牌 - 15张
  Array(15).fill().forEach(() => {
    cards.push({
      id: `renhe_${id++}`,
      name: '内政',
      type: 'renhe',
      cardType: RENHE_CARD_TYPES.NEIZHENG,
      description: '可用于：1.生产（+1）；2.税收（+1）；3.改革（转换1点资源）',
      effect: {
        type: RENHE_CARD_TYPES.NEIZHENG,
        value: 1
      }
    });
  });

  // 外交牌 - 15张
  Array(15).fill().forEach(() => {
    cards.push({
      id: `renhe_${id++}`,
      name: '外交',
      type: 'renhe',
      cardType: RENHE_CARD_TYPES.WAIJIAO,
      description: '可用于：1.结盟（+1）；2.离间（-1）；3.贸易（交换1点资源）',
      effect: {
        type: RENHE_CARD_TYPES.WAIJIAO,
        value: 1
      }
    });
  });

  return cards;
}

// 洗牌函数
function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  RENHE_CARD_TYPES,
  createRenheCards,
  shuffleCards
}; 