import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, CardType, Country, GamePhase } from './types';
import type { Draft } from 'immer';

// 定义Player接口
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

// 初始状态
const initialState: GameState = {
  phase: GamePhase.WAITING,
  round: 1,
  currentPlayerId: null,
  currentPlayer: null,
  players: [],
  countries: {
    qi: { name: '齐国', military: 2, economy: 3, politics: 2, hasKingToken: false, hegemony: 0 },
    chu: { name: '楚国', military: 3, economy: 2, politics: 2, hasKingToken: false, hegemony: 0 },
    yan: { name: '燕国', military: 2, economy: 2, politics: 2, hasKingToken: false, hegemony: 0 },
    han: { name: '韩国', military: 2, economy: 2, politics: 2, hasKingToken: false, hegemony: 0 },
    zhao: { name: '赵国', military: 2, economy: 2, politics: 3, hasKingToken: false, hegemony: 0 },
    wei: { name: '魏国', military: 3, economy: 2, politics: 2, hasKingToken: false, hegemony: 0 },
    qin: { name: '秦国', military: 3, economy: 2, politics: 2, hasKingToken: false, hegemony: 0 }
  },
  decks: {
    tianshi: 24,
    hero: 30,
    heroNeutral: 10,
    renhe: 30,
    shishi: 30,
    shenqi: 20,
    xianji: 20,
    yuanmou: 20
  },
  market: [],
  activeTianshiCard: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameState(state, action: PayloadAction<Partial<GameState>>) {
      Object.assign(state, action.payload);
    },
    setGamePhase(state, action: PayloadAction<GameState['phase']>) {
      state.phase = action.payload;
    },
    setCurrentPlayer(state, action: PayloadAction<Player>) {
      state.currentPlayer = action.payload;
    },
    updatePlayers(state, action: PayloadAction<Player[]>) {
      state.players = action.payload;
    },
    updateDeckCounts(state, action: PayloadAction<Partial<GameState['decks']>>) {
      Object.assign(state.decks, action.payload);
    },
    updateMarket(state, action: PayloadAction<CardType[]>) {
      state.market = action.payload;
    }
  }
});

export const {
  updateGameState,
  setGamePhase,
  setCurrentPlayer,
  updatePlayers,
  updateDeckCounts,
  updateMarket
} = gameSlice.actions;

export default gameSlice.reducer; 
