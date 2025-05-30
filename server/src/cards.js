// 卡牌类型枚举
const CardType = {
  HERO: 'hero',         // 英杰牌
  RENHE: 'renhe',       // 人和牌
  SHISHI: 'shishi',     // 史实牌
  XIANJI: 'xianji',     // 先机牌
  YUANMOU: 'yuanmou',   // 远谋牌
  HEAVEN: 'heaven'      // 神机牌
};

// 基础卡牌类
class Card {
  constructor(id, name, type, description) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.description = description;
  }
}

// 英杰牌
class HeroCard extends Card {
  constructor(id, name, country, abilities) {
    super(id, name, CardType.HERO, '');
    this.country = country;       // 所属国家
    this.abilities = abilities;   // 特殊能力
  }
}

// 人和牌
class RenheCard extends Card {
  constructor(id, name, effects) {
    super(id, name, CardType.RENHE, '');
    this.effects = effects;       // 牌的效果
  }
}

// 史实牌
class ShishiCard extends Card {
  constructor(id, name, effects, conditions) {
    super(id, name, CardType.SHISHI, '');
    this.effects = effects;       // 牌的效果
    this.conditions = conditions; // 触发条件
  }
}

// 先机牌
class XianjiCard extends Card {
  constructor(id, name, timing, effects) {
    super(id, name, CardType.XIANJI, '');
    this.timing = timing;         // 使用时机
    this.effects = effects;       // 牌的效果
  }
}

// 远谋牌
class YuanmouCard extends Card {
  constructor(id, name, effects, cost) {
    super(id, name, CardType.YUANMOU, '');
    this.effects = effects;       // 牌的效果
    this.cost = cost;            // 使用代价
  }
}

// 神机牌
class HeavenCard extends Card {
  constructor(id, name, effects, conditions) {
    super(id, name, CardType.HEAVEN, '');
    this.effects = effects;       // 牌的效果
    this.conditions = conditions; // 触发条件
  }
}

// 效果处理器
class EffectHandler {
  static applyEffect(effect, gameState, player) {
    // TODO: 实现效果处理逻辑
  }
}

module.exports = {
  CardType,
  Card,
  HeroCard,
  RenheCard,
  ShishiCard,
  XianjiCard,
  YuanmouCard,
  HeavenCard,
  EffectHandler
}; 