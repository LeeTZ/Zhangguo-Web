import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { InitialHeroSelection } from './InitialHeroSelection';
import { GameBoard } from './GameBoard';
import { GamePhase } from 'constants/gamePhases';
import { Button, App, message } from 'antd';
import { updateGameState } from '../store/gameSlice';
import { RootState } from '../store';
import { socket, joinRoom } from '../socket';

const GameContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
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

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const GameWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

interface GameProps {}

export const Game: React.FC<GameProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const { roomId } = useParams<{ roomId: string }>();
  const currentRoom = useSelector((state: RootState) => state.room.currentRoom);

  useEffect(() => {
    let isComponentMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeGame = async () => {
      if (!roomId) {
        setError('无效的房间ID');
        return;
      }

      try {
        setIsConnecting(true);
        setError(null);

        console.log('Initializing game with room:', roomId);
        console.log('Current room state:', currentRoom);

        // 检查当前房间状态
        const savedState = localStorage.getItem('sessionData');
        if (!savedState) {
          console.error('No session data found');
          setError('未找到玩家信息');
          setIsConnecting(false);
          return;
        }

        const { playerName, playerId } = JSON.parse(savedState);
        if (!playerName) {
          console.error('No player name found in session data');
          setError('未找到玩家信息');
          setIsConnecting(false);
          return;
        }

        // 如果当前房间不匹配或不存在，加入新房间
        if (!currentRoom || currentRoom.id !== roomId) {
          console.log('Joining room...', { playerName, playerId, roomId });
          joinRoom(roomId);
        } else {
          console.log('Room already joined, requesting game state...');
          socket.emit('join_game', { roomId });
        }

        // 监听游戏状态更新
        const handleGameStateUpdate = (newState: any) => {
          console.log('Received game state update:', newState);
          if (isComponentMounted) {
            setGameState(newState);
            dispatch(updateGameState(newState));
            setIsConnecting(false);

            // 如果游戏阶段变为playing，显示提示
            if (newState.phase === GamePhase.PLAYING) {
              message.success('英雄选择完成，游戏正式开始！');
            }
          }
        };

        // 监听初始游戏状态
        const handleGameStarted = (data: any) => {
          console.log('Received initial game state:', data);
          if (isComponentMounted) {
            setGameState(data.gameState);
            dispatch(updateGameState(data.gameState));
            setIsConnecting(false);
          }
        };

        // 监听英雄选择结果
        const handleHeroesSelected = (response: any) => {
          console.log('Heroes selection response:', response);
          if (response.success) {
            message.success('英雄选择成功，等待其他玩家...');
          } else {
            message.error(response.error || '选择英雄失败');
          }
        };

        // 监听错误
        const handleError = (error: any) => {
          console.error('Game error:', error);
          if (isComponentMounted) {
            if (error.message === '游戏尚未开始' && retryCount < maxRetries) {
              console.log(`Retrying... (attempt ${retryCount + 1}/${maxRetries})`);
              retryCount++;
              setTimeout(initializeGame, 2000);
            } else {
              setError(error.message || '游戏出现错误');
              message.error(error.message || '游戏出现错误');
              setIsConnecting(false);
            }
          }
        };

        // 监听断开连接
        const handleDisconnect = () => {
          console.log('Disconnected from game server');
          if (isComponentMounted) {
            setError('与游戏服务器断开连接');
            message.error('与游戏服务器断开连接');
            setIsConnecting(false);
          }
        };

        // 添加事件监听
        socket.on('game_state_update', handleGameStateUpdate);
        socket.on('game_started', handleGameStarted);
        socket.on('error', handleError);
        socket.on('disconnect', handleDisconnect);
        socket.on('heroes_selected', handleHeroesSelected);

        // 主动请求游戏状态同步
        socket.emit('request_game_sync', { roomId });

      } catch (err) {
        console.error('Error initializing game:', err);
        if (isComponentMounted) {
          setError('初始化游戏失败');
          message.error('初始化游戏失败');
          setIsConnecting(false);
        }
      }
    };

    // 初始化游戏
    initializeGame();

    // 返回清理函数
    return () => {
      isComponentMounted = false;
      socket.off('game_state_update');
      socket.off('game_started');
      socket.off('error');
      socket.off('disconnect');
      socket.off('heroes_selected');
    };
  }, [roomId, dispatch, navigate, currentRoom]);

  useEffect(() => {
    if (gameState) {
      console.log('Current game state:', gameState);
      console.log('Current phase:', gameState.phase);
    }
  }, [gameState]);

  return (
    <App>
      <GameContainer>
        {error ? (
          <ErrorText>
            {error}
            <ButtonContainer>
              <Button onClick={() => navigate('/lobby')}>返回大厅</Button>
              <Button onClick={() => window.location.reload()}>重新连接</Button>
            </ButtonContainer>
          </ErrorText>
        ) : isConnecting || !gameState ? (
          <LoadingText>正在连接游戏服务器...</LoadingText>
        ) : (
          <>
            {gameState.phase === GamePhase.INITIAL_SELECTION && (
              <GameWrapper>
                <InitialHeroSelection
                  initialCards={gameState.initialCards}
                  onCardsSelected={(selectedCards) => {
                    if (socket && roomId) {
                      console.log('Selecting initial heroes:', selectedCards);
                      socket.emit('select_hero_cards', {
                        roomId,
                        cardIds: selectedCards
                      });
                    }
                  }}
                />
              </GameWrapper>
            )}
            {gameState.phase === GamePhase.PLAYING && (
              <GameWrapper>
                <GameBoard gameState={gameState} />
              </GameWrapper>
            )}
            {!gameState.phase && (
              <ErrorText>游戏状态异常：未知的游戏阶段</ErrorText>
            )}
          </>
        )}
      </GameContainer>
    </App>
  );
};

export default Game; 