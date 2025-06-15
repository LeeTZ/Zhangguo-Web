import { HeroCard } from './cards';
import { CardType } from '../store/types';

export type GamePhase = 
  | 'waiting'           // 等待玩家加入
  | 'country_selection' // 选择国家阶段
  | 'initial_hero_selection' // 初始英雄选择阶段
  | 'playing'          // 游戏进行中
  | 'ended';           // 游戏结束

export interface Hand {
  hero: HeroCard[];
  heroNeutral: HeroCard[];
  renhe: any[];
  shishi: any[];
  shenqi: any[];
}

export interface Player {
  id: string;
  username: string;
  isHost: boolean;
  countryId?: string;
  handCards?: Card[];
  resources?: Resources;
}

export interface Card {
  id: string;
  type: string;
  name: string;
  description: string;
  cost?: number;
  effect?: any;
}

export interface Resources {
  gold: number;
  food: number;
  population: number;
  military: number;
}

export interface Country {
  id: string;
  name: string;
  ownerId?: string;
  hasKingToken: boolean;
  resources: Resources;
  cards: Card[];
  isDestroyed: boolean;
}

export interface GameState {
  phase: string;
  currentPlayerId: string;
  players: Player[];
  countries: { [key: string]: Country };
  deck: Card[];
  discardPile: Card[];
  activeTianshiCard?: Card;
  gameStarted: boolean;
  gameEnded: boolean;
  winner?: Player;
}

export interface GameLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
} 