// 游戏阶段定义
const GamePhase = {
  WAITING: 'waiting',           // 等待玩家加入
  INITIAL_HERO_SELECTION: 'initial_hero_selection', // 初始英雄选择阶段
  PLAYING: 'playing',          // 游戏进行中
  FINISHED: 'finished'         // 游戏结束
};

// 回合阶段定义
const TurnPhase = {
  STRATEGY: 'strategy',        // 权谋阶段
  PLANNING: 'planning',        // 筹谋阶段
  ACTION: 'action',           // 行动阶段
  BATTLE: 'battle',           // 征伐阶段
  TRIBUTE: 'tribute'          // 朝贡阶段
};

// 玩家行动类型
const ActionType = {
  PLAY_CARD: 'play_card',     // 打出卡牌
  REVEAL_HERO: 'reveal_hero', // 明置英杰
  SEEK_TALENT: 'seek_talent', // 求贤
  TRADE: 'trade',            // 行商
  DIPLOMACY: 'diplomacy',    // 外交
  REFORM: 'reform',          // 变法
  BATTLE: 'battle',          // 战争
  TRIBUTE: 'tribute',        // 朝贡
  PASS: 'pass'               // 过牌
};

// 游戏配置
const GameConfig = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 7,
  INITIAL_ACTION_POINTS: 6,    // 初始行动力
  INITIAL_GEO_TOKENS: 3,      // 初始地利标记
  INITIAL_TRIBUTE_TOKENS: 0,   // 初始贡品标记
  MAX_ROUNDS: 7,              // 最大回合数
  INITIAL_HERO_CARDS: {        // 初始英杰牌数量
    UNAFFILIATED: 1,          // 无所属英杰
    COUNTRY: 4                 // 国家英杰（抽4选2-3）
  },
  CARD_LIMITS: {
    HAND_SIZE: 8,             // 手牌上限
    HERO_REVEAL: 3            // 每回合最多明置英杰数
  }
};

// 卡牌类型
const CardType = {
  HERO: 'hero',               // 英杰牌
  HISTORY: 'history',         // 史实牌
  HEAVEN: 'heaven',           // 天时牌
  FIRST_MOVE: 'first_move',   // 先机牌
  STRATEGY: 'strategy'        // 远谋牌
};

// 国家属性
const CountryAttribute = {
  MILITARY: 'military',       // 军事
  POLITICS: 'politics',       // 政理
  ECONOMY: 'economy'         // 经济
};

module.exports = {
  GamePhase,
  TurnPhase,
  ActionType,
  GameConfig,
  CardType,
  CountryAttribute
}; 