export enum GamePhase {
  WAITING = 'waiting',
  INITIAL_SELECTION = 'initial_selection',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export enum TurnPhase {
  START = 'START',
  DRAW = 'DRAW',
  ACTION = 'ACTION',
  END = 'END'
}

export enum ActionType {
  PLAY_CARD = 'PLAY_CARD',
  USE_ABILITY = 'USE_ABILITY',
  PASS = 'PASS'
}

export const GameConfig = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 7,
  INITIAL_ACTION_POINTS: 6,
  MAX_ROUNDS: 10
}; 