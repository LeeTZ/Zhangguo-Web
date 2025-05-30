import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { socket } from '../socket';
import { setCurrentPlayer } from '../store/gameSlice';
import { setCurrentRoom } from '../store/roomSlice';
import { Player } from '../store/types';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const LoginForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const QuickTestButton = styled(Button)`
  background-color: #2196F3;
  &:hover {
    background-color: #1976D2;
  }
`;

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // 监听快速测试房间创建成功的响应
    const handleRoomJoined = (response: any) => {
      console.log('Room joined:', response);
      dispatch(setCurrentRoom(response));
      navigate(`/room/${response.id}`);
    };

    socket.on('room_joined', handleRoomJoined);

    return () => {
      socket.off('room_joined', handleRoomJoined);
    };
  }, [dispatch, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && socket.id) {
      // 创建玩家对象
      const player: Player = {
        id: socket.id,
        sessionId: socket.id,
        username: name.trim(),
        name: name.trim(),
        hand: {
          hero: [],
          heroNeutral: [],
          renhe: [],
          shishi: [],
          shenqi: []
        },
        geoTokens: 0,
        tributeTokens: 0,
        isHost: false
      };

      // 更新store中的玩家信息
      dispatch(setCurrentPlayer(player));

      // 发送登录请求到服务器
      socket.emit('login', { 
        playerName: name.trim(),
        sessionId: socket.id
      });

      // 导航到大厅
      navigate('/lobby');
    }
  };

  const handleQuickTest = () => {
    if (!socket.connected) {
      socket.connect();
    }
    // 使用玩家输入的名字或默认名字"player"
    const playerName = name.trim() || 'player';
    const player: Player = {
      id: socket.id || Date.now().toString(),
      sessionId: socket.id || Date.now().toString(),
      username: playerName,
      name: playerName,
      hand: {
        hero: [],
        heroNeutral: [],
        renhe: [],
        shishi: [],
        shenqi: []
      },
      geoTokens: 3,
      tributeTokens: 0,
      isHost: false
    };

    // 更新store中的玩家信息
    dispatch(setCurrentPlayer(player));

    // 发送快速测试请求到服务器
    socket.emit('quick_test', { playerName });

    // 不再直接导航到大厅，等待room_joined事件的响应
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>战国 - 测试版</Title>
        <Input
          type="text"
          placeholder="请输入你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={10}
          required
        />
        <Button type="submit" disabled={!name.trim() || !socket.id}>
          进入游戏
        </Button>
        <QuickTestButton 
          type="button" 
          onClick={handleQuickTest}
        >
          快速测试（自动创建3个机器人）
        </QuickTestButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login; 