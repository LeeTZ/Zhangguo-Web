import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { socket } from './socket';  // 只导入socket实例
import Login from './components/Login';
import GameLobby from './components/GameLobby';
import GameRoom from './components/GameRoom';
import Game from './components/Game';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const App: React.FC = () => {
  useEffect(() => {
    // socket.io会自动处理连接
    const handleConnect = () => {
      console.log('Connected to server');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Router>
          <AppContainer>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/lobby" element={<GameLobby />} />
              <Route path="/room/:roomId" element={<GameRoom />} />
              <Route path="/game/:roomId" element={<Game />} />
            </Routes>
          </AppContainer>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App; 