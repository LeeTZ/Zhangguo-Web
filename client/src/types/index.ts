// 游戏阶段
export enum GamePhase {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

// 回合阶段
export enum TurnPhase {
  STRATEGY = 'strategy',
  PLANNING = 'planning',
  ACTION = 'action',
  BATTLE = 'battle',
  TRIBUTE = 'tribute'
}

// 卡牌类型
export enum CardType {
  HERO = 'hero',
  HISTORY = 'history',
  HEAVEN = 'heaven',
  FIRST_MOVE = 'first_move',
  STRATEGY = 'strategy'
}

// 国家属性
export interface Nation {
  military: number;
  economy: number;
  politics: number;
  hegemony: number;
}

// 卡牌效果
export interface CardEffect {
  type: string;
  value?: number;
  attribute?: string;
  bonus?: any;
  cost?: any;
  action?: string;
  duration?: number;
  special?: string;
}

// 卡牌目标要求
export interface TargetRequirements {
  type: 'country' | 'player' | 'hero';
  count: number;
}

// 卡牌基础接口
export interface Card {
  id: string | number;
  name: string;
  type: CardType;
  effect: CardEffect;
  targetRequirements?: TargetRequirements;
  description: string;
  quote?: string;
}

// 英雄牌
export interface HeroCard extends Card {
  country: string;
  birthDeath: string;
  score: number;
}

// 玩家
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  heroCards: HeroCard[];
  revealedHeroes: HeroCard[];
  score: number;
  geoTokens: number;
  tributeTokens: number;
  isHost?: boolean;
  isReady?: boolean;
}

// 游戏状态
export interface GameState {
  round: number;
  phase: GamePhase | string;
  currentPlayer: string;
  players: Player[];
  nations: Record<string, Nation>;
}

// Redux状态
export interface RootState {
  game: GameState;
} 