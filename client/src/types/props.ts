import { HeroCard, RenheCard, ShishiCard, CardType } from './cards';
import { GameState as StoreGameState, Player as StorePlayer } from '../store/types';

export interface Hand {
  hero: HeroCard[];
  heroNeutral: HeroCard[];
  renhe: CardType[];
  shishi: CardType[];
  shenqi: any[];
}

export interface Player extends StorePlayer {
  hand: Hand;
  handSize?: number;
  renheCardCount?: number;
  heroCards?: HeroCard[];
  score?: number;
}

export type { StoreGameState as GameState };

export interface GameBoardProps {
  gameState: StoreGameState;
} 