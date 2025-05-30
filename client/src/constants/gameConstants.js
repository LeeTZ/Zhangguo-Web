// 游戏阶段定义
export const GamePhase = {
  WAITING: 'waiting',           // 等待玩家加入
  INITIAL_SELECTION: 'initial_selection', // 初始英杰牌选择阶段
  PLAYING: 'playing',          // 游戏进行中
  FINISHED: 'finished'         // 游戏结束
};

// 回合阶段定义
export const TurnPhase = {
  START: 'start',              // 回合开始
  DRAW: 'draw',               // 抽牌阶段
  ACTION: 'action',           // 行动阶段
  END: 'end'                  // 回合结束
};

// 玩家行动类型
export const ActionType = {
  PLAY_CARD: 'play_card',     // 打出卡牌
  USE_ABILITY: 'use_ability', // 使用英杰能力
  PASS: 'pass'                // 过牌
};

// 游戏配置
export const GameConfig = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 7,
  INITIAL_ACTION_POINTS: 6,
  INITIAL_HAND_SIZE: 5,
  MAX_HAND_SIZE: 8,
  MAX_ROUNDS: 12,
  INITIAL_GEO_TOKENS: 3,      // 初始地利标记
  INITIAL_TRIBUTE_TOKENS: 0   // 初始贡品标记
}; 