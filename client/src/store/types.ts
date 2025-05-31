import { TianshiCard } from '../data/tianshi';
import { GamePhase } from '../types/game';
import { CardType, HeroCard, RenheCard, ShishiCard } from '../types/cards';

export type { CardType };
export type { HeroCard };

// 玩家类型
export interface Player {
  id: string;
  sessionId: string;
  username: string;
  name: string;
  hand: {
    hero: HeroCard[];
    heroNeutral: HeroCard[];
    renhe: CardType[];
    shishi: CardType[];
    shenqi: CardType[];
  };
  geoTokens: number;
  tributeTokens: number;
  isHost: boolean;
  isBot?: boolean;
  selectedCountry?: string;
  selectedHero?: HeroCard;
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
  winner?: string;
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
  initialCards?: HeroCard[];
  availableCountries?: string[];
  selectedCountries?: string[];
  jingnangMarket: ShishiCard[];
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