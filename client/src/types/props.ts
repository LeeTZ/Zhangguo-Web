import { HeroCard } from './cards';
import { GameState as StoreGameState, Player as StorePlayer } from '../store/types';

export interface Hand {
  hero: HeroCard[];
  heroNeutral: HeroCard[];
  renhe: any[];
  shishi: any[];
  shenqi: any[];
}

export type { StorePlayer as Player };
export type { StoreGameState as GameState };

export interface GameBoardProps {
  gameState: StoreGameState;
} 