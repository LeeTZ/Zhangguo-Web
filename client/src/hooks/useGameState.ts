import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { GameState } from '../store/types';

export const useGameState = () => {
  const gameState = useSelector((state: RootState) => state.game);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);

  return {
    gameState,
    roomId: gameState.roomId || null,
    currentPlayer
  };
}; 