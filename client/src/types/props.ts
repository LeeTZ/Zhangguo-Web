import { HeroCard } from './cards';

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
  ready: boolean;
  hand?: Hand;
  geoTokens: number;
  tributeTokens: number;
  isBot?: boolean;
  selectedHero?: HeroCard;
}

export interface GameState {
  players: Player[];
  currentPlayer?: Player;
  round: number;
  decks: {
    tianshi: number;
    renhe: number;
    shishi: number;
    shenqi: number;
    xianji: number;
    yuanmou: number;
  };
  activeTianshiCard?: any;
  tianshiDeck?: any[];
  countries: { [key: string]: { name: string; military: number; economy: number; politics: number; hasKingToken: boolean; hegemony: number; } };
}

export interface GameBoardProps {
  gameState: GameState;
} 