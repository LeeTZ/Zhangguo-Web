import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { socket, joinRoom, leaveRoom } from '../socket';
import { GamePhase } from '../store/types';
import { setCurrentRoom } from '../store/roomSlice';
import { message, Button, App } from 'antd';

const RoomContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
`;

const PlayerList = styled.div`
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const PlayerItem = styled.div<{ isHost?: boolean }>`
  padding: 16px;
  background: ${props => props.isHost ? '#f0f7ff' : '#f5f5f5'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.isHost ? '#91caff' : '#eee'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const PlayerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 18px;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const PlayerStatus = styled.div<{ isHost?: boolean }>`
  font-size: 12px;
  color: ${props => props.isHost ? '#1890ff' : '#666'};
  margin-top: 4px;
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
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const GameRoom: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();
  const [isConnecting, setIsConnecting] = useState(false);
  const currentRoom = useSelector((state: RootState) => state.room.currentRoom);

  useEffect(() => {
    let isComponentMounted = true;

    const initializeRoom = async () => {
      if (!roomId) {
        messageApi.error('无效的房间ID');
        navigate('/lobby');
        return;
      }

      setIsConnecting(true);

      try {
        // 检查会话数据
        const savedState = localStorage.getItem('sessionData');
        if (!savedState) {
          messageApi.error('未找到玩家信息');
          navigate('/');
          return;
        }

        const { playerName } = JSON.parse(savedState);
        if (!playerName) {
          messageApi.error('未找到玩家信息');
          navigate('/');
          return;
        }

        // 如果当前不在房间中或者房间ID不匹配，加入新房间
        if (!currentRoom || currentRoom.id !== roomId) {
          console.log('Joining room:', roomId);
          joinRoom(roomId);
        }

        setIsConnecting(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        if (isComponentMounted) {
          messageApi.error('初始化房间失败');
          setIsConnecting(false);
        }
      }
    };

    const handleRoomJoined = (response: any) => {
      console.log('Room joined:', response);
      if (isComponentMounted) {
        dispatch(setCurrentRoom(response));
      }
    };

    const handleRoomUpdated = (room: any) => {
      console.log('Room updated:', room);
      if (isComponentMounted && room.id === roomId) {
        dispatch(setCurrentRoom(room));
      }
    };

    const handleGameStarted = (data: any) => {
      console.log('Game started:', data);
      if (isComponentMounted && roomId) {
        navigate(`/game/${roomId}`);
      }
    };

    const handleError = (error: any) => {
      console.error('Room error:', error);
      if (isComponentMounted) {
        messageApi.error(error.message || '发生错误');
      }
    };

    // 添加事件监听
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_updated', handleRoomUpdated);
    socket.on('game_started', handleGameStarted);
    socket.on('error', handleError);

    // 初始化房间
    initializeRoom();

    // 清理函数
    return () => {
      isComponentMounted = false;
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_updated', handleRoomUpdated);
      socket.off('game_started', handleGameStarted);
      socket.off('error', handleError);
    };
  }, [roomId, dispatch, navigate, messageApi, currentRoom]);

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/lobby');
  };

  if (isConnecting) {
    return <LoadingText>正在连接房间...</LoadingText>;
  }

  if (!currentRoom) {
    return <ErrorText>房间不存在或已关闭</ErrorText>;
  }

  const isCurrentPlayerHost = currentRoom.players.some(p => {
    console.log('Checking player:', {
      playerName: p.username,
      isHost: p.isHost,
      playerSessionId: p.sessionId,
      currentPlayerSocketId: currentRoom.currentPlayer?.socketId,
      currentPlayerPlayerId: currentRoom.currentPlayer?.playerId,
      currentPlayer: currentRoom.currentPlayer
    });
    return p.isHost && p.sessionId === currentRoom.currentPlayer?.playerId;
  });

  console.log('Room state:', {
    currentRoom,
    isCurrentPlayerHost
  });

  return (
    <App>
      <RoomContainer>
        <RoomHeader>
          <h2>房间 {currentRoom.id}</h2>
          <Button onClick={handleLeaveRoom} danger>离开房间</Button>
        </RoomHeader>
        <PlayerList>
          {currentRoom.players.map((player) => (
            <PlayerItem 
              key={player.sessionId}
              isHost={player.isHost}
            >
              <PlayerAvatar>
                {player.username.charAt(0).toUpperCase()}
              </PlayerAvatar>
              <PlayerInfo>
                <PlayerName>
                  {player.username}
                  {player.sessionId === currentRoom.currentPlayer?.playerId && ' (我)'}
                </PlayerName>
                <PlayerStatus isHost={player.isHost}>
                  {player.isHost ? '房主' : '玩家'}
                </PlayerStatus>
              </PlayerInfo>
            </PlayerItem>
          ))}
        </PlayerList>
        {currentRoom.status === GamePhase.WAITING && (
          <ButtonContainer>
            <Button
              type="primary"
              size="large"
              disabled={!isCurrentPlayerHost}
              onClick={() => socket.emit('start_game', { roomId })}
            >
              {isCurrentPlayerHost ? '开始游戏' : '等待房主开始游戏'}
            </Button>
          </ButtonContainer>
        )}
      </RoomContainer>
    </App>
  );
};

export default GameRoom; 