import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store';
import { socket } from '../socket';
import { Room } from '../store/roomSlice';

const LobbyContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #45a049;
  }
`;

const WelcomeText = styled.span`
  color: #333;
  font-size: 16px;
`;

const RoomList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const RoomCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const RoomInfo = styled.div`
  margin-top: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
`;

const PlayerCount = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin: 8px 0;
  border: 1px solid #eee;
`;

const PlayerItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    background: #f0f0f0;
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
  margin-bottom: 8px;
  font-size: 18px;
  color: white;
  font-weight: 500;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PlayerName = styled.span`
  font-size: 13px;
  color: #333;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
`;

const HostBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #4CAF50;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: 500;
`;

interface GameStatusProps {
  isPlaying: boolean;
}

const GameStatus = styled.div<GameStatusProps>`
  margin-top: 8px;
  padding: 4px 8px;
  background: ${props => props.isPlaying ? '#ff9800' : '#4CAF50'};
  color: white;
  border-radius: 4px;
  font-size: 12px;
  display: inline-block;
`;

interface RoomCreatedResponse {
  roomId: string;
  players: Array<{
    username: string;
    sessionId: string;
    ready: boolean;
    isHost: boolean;
  }>;
}

const GameLobby: React.FC = () => {
  const navigate = useNavigate();
  const rooms = useSelector((state: RootState) => state.room.rooms);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);

  useEffect(() => {
    // 确保socket已连接
    if (!socket.connected) {
      socket.connect();
    }

    // 监听房间加入事件
    const handleRoomJoined = (event: CustomEvent<{ roomId: string }>) => {
      console.log('Room joined event received:', event.detail);
      navigate(`/room/${event.detail.roomId}`);
    };

    // 添加事件监听
    window.addEventListener('roomJoined', handleRoomJoined as EventListener);

    // 从localStorage获取保存的玩家状态
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
      const playerState = JSON.parse(savedState);
      console.log('Found saved player state in lobby:', playerState);

      // 如果有保存的房间ID，尝试恢复该房间的会话
      if (playerState.roomId) {
        console.log('Attempting to restore room session:', playerState.roomId);
        navigate(`/room/${playerState.roomId}`);
        return;
      }

      // 如果没有房间ID但有玩家信息，尝试恢复玩家会话
      if (!currentPlayer) {
        console.log('Attempting to restore player session');
        socket.emit('restore_session', {
          playerName: playerState.name,
          sessionId: socket.id
        });
      }
    } else if (!currentPlayer) {
      // 如果没有保存的状态且没有当前玩家信息，重定向到登录页面
      console.log('No saved state or current player, redirecting to login');
      navigate('/');
      return;
    }

    // 请求房间列表
    socket.emit('get_rooms');

    // 清理函数
    return () => {
      window.removeEventListener('roomJoined', handleRoomJoined as EventListener);
    };
  }, [navigate, currentPlayer]);

  const handleCreateRoom = () => {
    if (currentPlayer) {
      socket.emit('create_room', {
        playerName: currentPlayer.name,
        sessionId: socket.id
      });
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (currentPlayer) {
      console.log('Joining room:', roomId);
      socket.emit('join_room', {
        roomId,
        playerName: currentPlayer.name,
        sessionId: socket.id
      });
    }
  };

  return (
    <LobbyContainer>
      <Header>
        <Title>游戏大厅</Title>
        <HeaderRight>
          {currentPlayer && <WelcomeText>欢迎, {currentPlayer.name}</WelcomeText>}
          <Button onClick={handleCreateRoom}>创建房间</Button>
        </HeaderRight>
      </Header>
      <RoomList>
        {rooms.length === 0 ? (
          <div>暂无可用房间</div>
        ) : (
          rooms.map((room) => (
            <RoomCard key={room.id} onClick={() => handleJoinRoom(room.id)}>
              <h3>{room.name || `房间 ${room.id}`}</h3>
              <RoomInfo>
                <PlayerCount>玩家列表</PlayerCount>
                <PlayerList>
                  {room.players.map(player => (
                    <PlayerItem key={player.sessionId}>
                      <PlayerAvatar>
                        {player.username.charAt(0).toUpperCase()}
                      </PlayerAvatar>
                      <PlayerName>{player.username}</PlayerName>
                      {player.isHost && <HostBadge>房主</HostBadge>}
                    </PlayerItem>
                  ))}
                </PlayerList>
                <PlayerCount>
                  玩家数量: {room.players.length}/{room.maxPlayers}
                </PlayerCount>
                <GameStatus isPlaying={room.isPlaying}>
                  {room.isPlaying ? '游戏进行中' : '等待中'}
                </GameStatus>
              </RoomInfo>
            </RoomCard>
          ))
        )}
      </RoomList>
    </LobbyContainer>
  );
};

export default GameLobby; 