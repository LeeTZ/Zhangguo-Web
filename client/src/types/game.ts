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
  sessionId: string;
  username: string;
  isHost: boolean;
  hand?: Hand;
  geoTokens: number;
  tributeTokens: number;
  isBot?: boolean;
  selectedCountry?: string;
  selectedHero?: HeroCard;
}

export interface GameState {
  roomId?: string;
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
    }
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
  activeTianshiCard: any | null;
  tianshiDeck?: any[];
  market: CardType[];
  initialCards?: HeroCard[];
  availableCountries?: string[];
  selectedCountries?: string[];
  status?: 'waiting' | 'playing' | 'ended';
} 