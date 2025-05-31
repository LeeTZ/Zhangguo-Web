import React from 'react';
import { GameBoard } from '../components/GameBoard';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { socket } from '../socket';

export const Game: React.FC = () => {
  const gameState = useSelector((state: RootState) => state.game);

  const handleBuyCard = (cardId: string | number) => {
    socket.emit('buy_card', { cardId });
  };

  return (
    <div className="game-container">
      <GameBoard 
        gameState={gameState} 
        onBuyCard={handleBuyCard}
      />
    </div>
  );
}; 