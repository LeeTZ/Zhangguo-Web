import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Player, CardType, Country } from './types';
import { GamePhase } from '../types/game';
import type { Draft } from 'immer';

// 将 Player 转换为 WritableDraft<Player>
type WritablePlayer = Draft<Player>;

// 初始状态
const initialState: GameState = {
  phase: 'waiting',
  round: 0,
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
    tianshi: 0,
    hero: 0,
    heroNeutral: 0,
    renhe: 0,
    shishi: 0,
    shenqi: 0,
    xianji: 0,
    yuanmou: 0
  },
  market: [],
  activeTianshiCard: null,
  initialCards: [],
  availableCountries: [],
  selectedCountries: [],
  jingnangMarket: []
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameState(state, action: PayloadAction<GameState>) {
      return action.payload;
    },
    setCurrentPlayer(state, action: PayloadAction<Player>) {
      state.currentPlayer = action.payload as WritablePlayer;
    },
    updatePlayers(state, action: PayloadAction<Player[]>) {
      state.players = action.payload as WritablePlayer[];
    },
    updateDeckCounts(state, action: PayloadAction<Partial<GameState['decks']>>) {
      Object.assign(state.decks, action.payload);
    },
    updateCountries(state, action: PayloadAction<Record<string, Country>>) {
      state.countries = action.payload;
    },
    setPhase(state, action: PayloadAction<GamePhase>) {
      state.phase = action.payload;
    },
    setRound(state, action: PayloadAction<number>) {
      state.round = action.payload;
    },
    setMarket(state, action: PayloadAction<CardType[]>) {
      state.market = action.payload;
    }
  }
});

export const {
  updateGameState,
  setCurrentPlayer,
  updatePlayers,
  updateDeckCounts,
  updateCountries,
  setPhase,
  setRound,
  setMarket
} = gameSlice.actions;

export default gameSlice.reducer; 
