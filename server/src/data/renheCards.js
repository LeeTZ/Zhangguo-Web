// 人和牌数据
const renheCards = [
  // 军略牌
  {
    id: 'R001',
    name: '战争',
    type: 'military',
    effect: {
      type: 'battle',
      description: '指定两个未灭亡的国家进行战争。计算战力：初始战力=军事值，援兵加成每张+1，各掷1枚骰子。战败方国力减少双方战力之差，战胜方经济+1，政理+1，获得称霸标记。'
    },
    targetRequirements: {
      type: 'country',
      count: 2
    }
  },
  // ... 其他人和牌 ...
];

module.exports = renheCards; 