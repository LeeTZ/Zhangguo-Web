import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { App, message } from 'antd';
import { updateGameState } from '../store/gameSlice';
import { RootState } from '../store';
import { socket } from '../socket';
import { GameState } from '../store/types';
import { HeroCard } from '../types/cards';
import { CountrySelection } from './CountrySelection';
import { InitialHeroSelection } from './InitialHeroSelection';
import { GameBoard } from './GameBoard';

const GameContainer = styled.div`
  padding: 10px;
  max-width: 1800px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 18px;
  margin: 20px;
  color: #666;
`;

const ErrorText = styled.div`
  text-align: center;
  color: #ff4d4f;
  font-size: 18px;
  margin: 20px;
  padding: 16px;
  background: #fff2f0;
  border-radius: 8px;
`;

interface GameProps {}

export const Game: React.FC<GameProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const { roomId } = useParams<{ roomId: string }>();
  const gameState = useSelector((state: RootState) => state.game);

  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (newState: GameState) => {
      console.log('[游戏] 状态更新:', newState.phase);
      dispatch(updateGameState(newState));
      setIsConnecting(false);
    };

    const handleGameStarted = (data: { gameState: GameState }) => {
      console.log('[游戏] 游戏开始');
      dispatch(updateGameState(data.gameState));
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      console.log('[游戏] 与服务器断开连接');
      setIsConnecting(true);
    };

    const handleConnect = () => {
      console.log('[游戏] 已连接到服务器');
      if (roomId) {
        socket.emit('request_game_sync', { roomId });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('game_state_update', handleGameStateUpdate);
    socket.on('game_started', handleGameStarted);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected && roomId) {
      socket.emit('request_game_sync', { roomId });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('game_state_update', handleGameStateUpdate);
      socket.off('game_started', handleGameStarted);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, roomId, dispatch]);

  const handleCountrySelect = (countryId: string) => {
    if (!socket || !roomId) return;

    socket.emit('select_country', { roomId, countryId }, (response: any) => {
      if (response.success) {
        console.log('[游戏] 国家选择成功');
      } else {
        console.error('[游戏] 国家选择失败:', response.error);
      }
    });
  };

  const handleInitialHeroSelect = (selectedCards: string[]) => {
    if (!socket || !roomId) return;

    console.log('[游戏] 选择初始英雄牌:', selectedCards.length, '张');
    socket.emit('select_hero_cards', { roomId, cardIds: selectedCards });
  };

  const handleCountrySelected = () => {
    console.log('Country selection completed');
  };

  const renderGamePhase = () => {
    if (!gameState || !roomId) {
      return <LoadingText>加载中...</LoadingText>;
    }

    console.log('Rendering game phase:', {
      phase: gameState.phase,
      gameState
    });

    switch (gameState.phase) {
      case 'waiting':
        return (
          <div>
            <h2>等待其他玩家加入...</h2>
            <p>当前玩家数: {gameState.players.length}</p>
          </div>
        );
      case 'country_selection':
        return (
          <CountrySelection 
            roomId={roomId} 
            onCountrySelected={handleCountrySelected}
            availableCountries={gameState.availableCountries}
            selectedCountries={gameState.selectedCountries}
          />
        );
      case 'initial_hero_selection':
        if (!gameState.initialCards || !Array.isArray(gameState.initialCards)) {
          return <div>等待初始英雄牌分发中...</div>;
        }
        return (
          <InitialHeroSelection
            initialCards={gameState.initialCards}
            onCardsSelected={handleInitialHeroSelect}
          />
        );
      case 'playing':
        return <GameBoard gameState={gameState} />;
      case 'ended':
        return <div>游戏结束！获胜者：{gameState.winner}</div>;
      default:
        console.error('Unknown game phase:', gameState.phase);
        return <div>未知游戏状态</div>;
    }
  };

  if (error) {
    return <ErrorText>{error}</ErrorText>;
  }

  return (
    <App>
      <GameContainer>
        {isConnecting ? <LoadingText>正在连接游戏...</LoadingText> : renderGamePhase()}
      </GameContainer>
    </App>
  );
};

export default Game; 