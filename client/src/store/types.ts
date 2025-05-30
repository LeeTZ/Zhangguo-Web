import { TianshiCard } from '../data/tianshi';

// 卡牌类型
export interface CardType {
  id: string;
  name: string;
  type: string;
  description: string;
}

// 玩家类型
export interface Player {
  id: string;
  name: string;
  hand: {
    hero: CardType[];
    heroNeutral: CardType[];
    renhe: CardType[];
    shishi: CardType[];
    shenqi: CardType[];
  };
  geoTokens: number;
  tributeTokens: number;
  isHost: boolean;
}

// 牌堆数量类型
export type DeckCounts = {
  tianshi: number;
  hero: number;
  heroNeutral: number;
  renhe: number;
  shishi: number;
  shenqi: number;
  xianji: number;
  yuanmou: number;
};

// 国家类型
export type Country = {
  name: string;
  military: number;
  economy: number;
  politics: number;
  hasKingToken: boolean;
  hegemony: number;
};

// 游戏状态类型
export interface GameState {
  phase: GamePhase;
  round: number;
  currentPlayerId: string | null;
  currentPlayer: Player | null;
  players: Player[];
  countries: {
    [key: string]: {
      name: string;
      military: number;
      economy: number;
      politics: number;
      hasKingToken: boolean;
      hegemony: number;
    };
  };
  decks: {
    tianshi: number;
    hero: number;
    heroNeutral: number;
    renhe: number;
    shishi: number;
    shenqi: number;
    xianji: number;
    yuanmou: number;
  };
  tianshiDeck?: TianshiCard[];
  market: CardType[];
  activeTianshiCard: TianshiCard | null;
}

// 服务器房间类型
export interface ServerRoom {
  id: string;
  name: string;
  players: ServerPlayer[];
  status: 'waiting' | 'playing';
  currentPlayer?: {
    socketId: string;
    playerId: string;
    name: string;
  };
}

// 服务器玩家类型
export interface ServerPlayer {
  username: string;
  sessionId: string;
  playerId: string;
  socketId: string;
  isHost: boolean;
}

// 游戏阶段
export enum GamePhase {
  WAITING = 'waiting',
  PREPARING = 'preparing',
  PLAYING = 'playing',
  ENDED = 'ended'
}

// 英雄牌
export interface HeroCard extends CardType {
  country: string;
  birthDeath: string;
  score: number;
} 