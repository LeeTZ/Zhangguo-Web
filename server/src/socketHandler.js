const GameCore = require('./gameCore').GameCore;

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.games = new Map(); // 游戏房间映射
    this.playerSessions = new Map(); // 玩家会话映射 {playerName: {socketId, roomId, disconnectTimer}}
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);

      // 登录
      socket.on('login', (data) => {
        const { playerName } = data;
        this.handleLogin(socket, playerName);
      });

      // 快速测试
      socket.on('quick_test', (data) => {
        this.handleQuickTest(socket, data?.playerName);
      });

      // 恢复会话
      socket.on('restore_session', (data) => {
        const { playerName, roomId } = data;
        this.handleSessionRestore(socket, playerName, roomId);
      });

      // 创建房间
      socket.on('create_room', (data) => {
        const { playerName } = data;
        this.handleCreateRoom(socket, playerName);
      });

      // 加入房间
      socket.on('join_room', (data) => {
        const { roomId, playerName } = data;
        this.handleJoinRoom(socket, playerName, roomId);
      });

      // 加入游戏
      socket.on('join_game', (data) => {
        const { roomId } = data;
        this.handleJoinGame(socket, roomId);
      });

      // 离开房间
      socket.on('leave_room', (data) => {
        const { roomId } = data;
        this.handleLeaveRoom(socket, roomId);
      });

      // 开始游戏
      socket.on('start_game', (data) => {
        const { roomId } = data;
        this.handleStartGame(socket, roomId);
      });

      // 断开连接
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });

      // 添加游戏状态同步事件处理
      socket.on('request_game_sync', (data) => {
        this.handleRequestGameSync(socket, data);
      });

      // 处理选择初始英雄
      socket.on('select_hero_cards', (data) => {
        this.handleSelectHeroCards(socket, data);
      });
    });
  }

  handleLogin(socket, playerName) {
    console.log(`Player ${playerName} attempting to login with socket ${socket.id}`);
    
    // 检查是否已存在同名玩家的会话
    const existingSession = this.playerSessions.get(playerName);
    if (existingSession) {
      // 如果同名玩家的socket ID不同，说明是新的标签页
      if (existingSession.socketId !== socket.id) {
        // 为玩家名称添加唯一标识
        const newPlayerName = `${playerName}_${Date.now()}`;
        console.log(`Player ${playerName} already exists, creating new session with name ${newPlayerName}`);
        playerName = newPlayerName;
      }
    }

    // 生成一个唯一的玩家ID
    const playerId = `${playerName}_${Date.now()}`;
    console.log(`Generated unique player ID: ${playerId} for player ${playerName}`);

    // 创建新会话
    this.playerSessions.set(playerName, {
      socketId: socket.id,
      playerId: playerId,
      roomId: null,
      disconnectTimer: null
    });

    // 发送登录成功响应
    socket.emit('login_success', {
      player: {
        name: playerName,
        socketId: socket.id,
        playerId: playerId
      }
    });

    // 发送房间列表
    this.broadcastRoomList();
  }

  handleSessionRestore(socket, playerName, roomId) {
    console.log(`Restoring session for player ${playerName}, room ${roomId}`);
    const existingSession = this.playerSessions.get(playerName);
    
    // 如果存在现有会话，更新socket ID和生成新的playerId
    if (existingSession) {
      console.log(`Updating socket ID for existing player ${playerName}`);
      existingSession.socketId = socket.id;
      if (!existingSession.playerId) {
        existingSession.playerId = `${playerName}_${Date.now()}`;
      }
      if (existingSession.disconnectTimer) {
        clearTimeout(existingSession.disconnectTimer);
        existingSession.disconnectTimer = null;
      }
      this.playerSessions.set(playerName, existingSession);
    } else {
      // 如果不存在会话，创建新的会话
      const playerId = `${playerName}_${Date.now()}`;
      const newSession = {
        socketId: socket.id,
        playerId: playerId,
        roomId: null,
        disconnectTimer: null
      };
      this.playerSessions.set(playerName, newSession);
    }

    // 准备响应数据
    const response = {
      player: {
        name: playerName,
        socketId: socket.id,
        playerId: existingSession?.playerId || `${playerName}_${Date.now()}`,
        isHost: false
      }
    };

    // 如果请求包含房间ID，尝试恢复房间状态
    if (roomId) {
      console.log(`Attempting to restore room ${roomId} for player ${playerName}`);
      const room = this.games.get(roomId);
      if (room) {
        // 检查玩家是否已经在房间中
        const existingPlayer = room.players.find(p => p.name === playerName);
        if (existingPlayer) {
          // 更新玩家的socket ID和playerId
          console.log(`Updating socket ID for player ${playerName} in room ${roomId}`);
          existingPlayer.socketId = socket.id;
          if (!existingPlayer.playerId) {
            existingPlayer.playerId = response.player.playerId;
          }
          socket.join(roomId);
          response.player.isHost = existingPlayer.isHost;
          this.playerSessions.get(playerName).roomId = roomId;
        } else {
          // 作为新玩家加入
          console.log(`Adding ${playerName} as new player to room ${roomId}`);
          const newPlayer = {
            socketId: socket.id,
            playerId: response.player.playerId,
            name: playerName,
            isHost: false,
            isReady: false
          };
          room.players.push(newPlayer);
          socket.join(roomId);
          this.playerSessions.get(playerName).roomId = roomId;
        }

        // 为每个玩家发送更新，包含他们各自的currentPlayer信息
        room.players.forEach(player => {
          const playerResponse = {
            id: roomId,
            currentPlayer: {
              socketId: player.socketId,
              playerId: player.playerId,
              name: player.name
            },
            players: room.players.map(p => ({
              username: p.name,
              sessionId: p.playerId,
              ready: p.ready || false,
              isHost: p.isHost
            })),
            status: room.status
          };
          console.log(`Sending room update to player ${player.name}:`, playerResponse);
          this.io.to(player.socketId).emit('room_updated', playerResponse);
        });

        // 更新响应数据
        response.room = {
          id: roomId,
          currentPlayer: {
            socketId: socket.id,
            playerId: response.player.playerId,
            name: playerName
          },
          players: room.players.map(p => ({
            username: p.name,
            sessionId: p.playerId,
            ready: p.ready || false,
            isHost: p.isHost
          })),
          status: room.status
        };
      } else {
        console.log(`Room ${roomId} not found`);
      }
    }

    // 发送会话恢复响应
    console.log(`Sending session restore response:`, response);
    socket.emit('session_restored', response);
  }

  handleCreateRoom(socket, playerName) {
    const roomId = this.generateRoomId();
    const session = this.playerSessions.get(playerName);
    
    if (!session) {
      socket.emit('error', { message: '未找到玩家会话' });
      return;
    }

    // 生成一个唯一的玩家ID
    const playerId = `${playerName}_${Date.now()}`;

    // 创建房间
    const room = {
      players: [{
        socketId: socket.id,
        playerId: playerId,
        name: playerName,
        isHost: true,
        isReady: false
      }],
      status: 'waiting'
    };
    
    this.games.set(roomId, room);
    socket.join(roomId);
    session.roomId = roomId;
    session.socketId = socket.id;

    // 发送房间创建成功响应
    const response = {
      id: roomId,
      currentPlayer: {
        socketId: socket.id,
        playerId: playerId,
        name: playerName
      },
      players: room.players.map(p => ({
        username: p.name,
        sessionId: p.playerId,
        ready: p.ready || false,
        isHost: p.isHost
      })),
      status: room.status
    };

    socket.emit('room_joined', response);
    this.broadcastRoomList();
  }

  handleJoinRoom(socket, playerName, roomId) {
    console.log(`Player ${playerName} attempting to join room ${roomId} with socket ${socket.id}`);
    const session = this.playerSessions.get(playerName);
    const room = this.games.get(roomId);

    if (!session) {
      socket.emit('error', { message: '未找到玩家会话' });
      return;
    }

    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    // 检查玩家是否已在房间中
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      console.log(`Player ${playerName} already in room, updating socket ID from ${existingPlayer.socketId} to ${socket.id}`);
      existingPlayer.socketId = socket.id;
      session.socketId = socket.id;
    } else {
      // 检查房间是否已满
      if (room.players.length >= 7) {
        socket.emit('error', { message: '房间已满' });
        return;
      }

      // 生成一个唯一的玩家ID
      const playerId = `${playerName}_${Date.now()}`;
      console.log(`Generated unique player ID: ${playerId} for player ${playerName}`);

      // 添加新玩家
      const newPlayer = {
        socketId: socket.id,  // 用于Socket.IO通信
        playerId: playerId,   // 用于React key和玩家标识
        name: playerName,
        isHost: false,
        isReady: false
      };
      console.log(`Adding new player ${playerName} to room with ID ${playerId}`);
      room.players.push(newPlayer);
      session.socketId = socket.id;
      session.playerId = playerId;
    }

    // 加入房间
    socket.join(roomId);
    session.roomId = roomId;

    // 为每个玩家发送更新，包含他们各自的currentPlayer信息
    console.log(`Broadcasting room update to all players in room ${roomId}`);
    console.log('Current players in room:', room.players);
    room.players.forEach(player => {
      const playerResponse = {
        id: roomId,
        currentPlayer: {
          socketId: player.socketId,
          playerId: player.playerId,
          name: player.name
        },
        players: room.players.map(p => ({
          username: p.name,
          sessionId: p.playerId,  // 使用playerId作为sessionId
          ready: p.ready || false,
          isHost: p.isHost
        })),
        status: room.status
      };
      console.log(`Sending room update to player ${player.name}:`, playerResponse);
      this.io.to(player.socketId).emit('room_updated', playerResponse);
    });

    // 发送加入成功响应给当前玩家
    const joinResponse = {
      id: roomId,
      currentPlayer: {
        socketId: socket.id,
        playerId: existingPlayer ? existingPlayer.playerId : room.players[room.players.length - 1].playerId,
        name: playerName
      },
      players: room.players.map(p => ({
        username: p.name,
        sessionId: p.playerId,  // 使用playerId作为sessionId
        ready: p.ready || false,
        isHost: p.isHost
      })),
      status: room.status
    };
    console.log(`Sending join response to player ${playerName}:`, joinResponse);
    socket.emit('room_joined', joinResponse);
    
    // 更新大厅的房间列表
    this.broadcastRoomList();
  }

  handleLeaveRoom(socket, roomId) {
    console.log(`Player leaving room ${roomId} with socket ${socket.id}`);
    const room = this.games.get(roomId);
    if (!room) {
      console.log(`Room ${roomId} not found`);
      return;
    }

    // 首先找到socket对应的玩家名称
    let leavingPlayerName = null;
    for (const [playerName, session] of this.playerSessions.entries()) {
      if (session.socketId === socket.id) {
        leavingPlayerName = playerName;
        break;
      }
    }

    if (!leavingPlayerName) {
      console.log(`Could not find player name for socket ${socket.id}`);
      return;
    }

    console.log(`Found leaving player name: ${leavingPlayerName}`);

    // 查找要离开的玩家
    const playerIndex = room.players.findIndex(p => p.name === leavingPlayerName);
    if (playerIndex === -1) {
      console.log(`Player ${leavingPlayerName} not found in room ${roomId}`);
      return;
    }

    const player = room.players[playerIndex];
    console.log(`Found player to remove:`, player);
    
    // 更新会话
    const session = this.playerSessions.get(player.name);
    if (session) {
      console.log(`Updating session for player ${player.name}`);
      session.roomId = null;
    }

    // 离开房间
    socket.leave(roomId);
    room.players.splice(playerIndex, 1);
    console.log(`Removed player ${player.name} from room. Remaining players:`, room.players);

    if (room.players.length === 0) {
      // 如果房间空了，删除房间
      console.log(`Room ${roomId} is empty, deleting it`);
      this.games.delete(roomId);
    } else {
      // 如果房主离开，转移房主权限
      if (player.isHost) {
        console.log(`Host left, transferring host privileges to ${room.players[0].name}`);
        room.players[0].isHost = true;
      }

      // 广播房间更新
      const response = {
        id: roomId,
        players: room.players.map(p => ({
          username: p.name,
          sessionId: p.playerId,
          ready: p.ready || false,
          isHost: p.isHost
        })),
        status: room.status
      };
      console.log(`Broadcasting room update after player left:`, response);
      this.io.to(roomId).emit('room_updated', response);
    }

    socket.emit('room_left');
    this.broadcastRoomList();
  }

  handleStartGame(socket, roomId) {
    console.log(`Handling start game request for room ${roomId}`);
    const room = this.games.get(roomId);
    if (!room) {
      console.log('Room not found');
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    // 检查是否是房主
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || !player.isHost) {
      console.log('Player is not host');
      socket.emit('error', { message: '只有房主可以开始游戏' });
      return;
    }

    // 检查玩家数量
    if (room.players.length < 2) {
      console.log('Not enough players');
      socket.emit('error', { message: '需要至少2名玩家才能开始游戏' });
      return;
    }

    console.log('Starting game...');
    // 开始游戏，确保使用正确的玩家ID
    room.status = 'playing';
    const gamePlayers = room.players.map(p => ({
      id: p.playerId,  // 使用playerId而不是socketId
      name: p.name
    }));
    console.log('Creating game with players:', gamePlayers);
    room.gameCore = new GameCore(gamePlayers);

    // 设置初始游戏阶段为英杰牌选择阶段
    room.gameCore.phase = 'initial_selection';

    // 抽取第一张天时牌
    room.gameCore.drawAndActivateTianshiCard();

    // 获取初始游戏状态
    const gameState = room.gameCore.getState();
    console.log('Initial game state:', gameState);

    // 广播游戏开始事件给房间内所有玩家
    this.io.to(roomId).emit('game_started', { gameState });
    console.log('Game started event emitted');

    // 更新房间列表
    this.broadcastRoomList();
  }

  handleDisconnect(socket) {
    // 查找断开连接的玩家
    for (const [playerName, session] of this.playerSessions.entries()) {
      if (session.socketId === socket.id) {
        console.log(`Player ${playerName} disconnected, starting cleanup timer`);
        
        // 如果已经有计时器，先清除它
        if (session.disconnectTimer) {
          clearTimeout(session.disconnectTimer);
        }

        // 设置延迟清理计时器
        session.disconnectTimer = setTimeout(() => {
          console.log(`Cleanup timer triggered for player ${playerName}`);
          
          // 再次检查玩家是否真的离线
          const currentSession = this.playerSessions.get(playerName);
          if (!currentSession || currentSession.socketId === socket.id) {
            console.log(`Player ${playerName} is still offline, cleaning up`);
            
            // 如果玩家在房间中，从房间移除
            if (session.roomId) {
              const room = this.games.get(session.roomId);
              if (room) {
                const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
                if (playerIndex !== -1) {
                  console.log(`Removing player ${playerName} from room ${session.roomId}`);
                  room.players.splice(playerIndex, 1);
                  
                  if (room.players.length === 0) {
                    console.log(`Room ${session.roomId} is empty, deleting it`);
                    this.games.delete(session.roomId);
                  } else {
                    // 如果房主离开，转移房主权限
                    if (room.players[playerIndex]?.isHost) {
                      room.players[0].isHost = true;
                    }
                    
                    // 广播房间更新
                    const response = {
                      id: session.roomId,
                      players: room.players.map(p => ({
                        username: p.name,
                        sessionId: p.socketId,
                        ready: p.ready || false,
                        isHost: p.isHost
                      })),
                      status: room.status
                    };
                    this.io.to(session.roomId).emit('room_updated', response);
                  }
                }
              }
            }
            
            // 删除会话
            this.playerSessions.delete(playerName);
            this.broadcastRoomList();
          } else {
            console.log(`Player ${playerName} has reconnected, cleanup cancelled`);
          }
        }, 30000); // 增加到30秒
      }
    }
  }

  broadcastRoomList() {
    const roomList = Array.from(this.games.entries()).map(([roomId, room]) => ({
      id: roomId,
      players: room.players.map(p => ({
        username: p.name,
        sessionId: p.playerId || p.socketId,  // 使用playerId作为sessionId
        ready: p.ready || false,
        isHost: p.isHost
      })),
      status: room.status
    }));

    console.log('Broadcasting updated room list:', roomList);
    this.io.emit('room_list_update', roomList);
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  handleQuickTest(socket, playerName) {
    // 使用传入的玩家名称
    const playerId = `${playerName}_${Date.now()}`;

    // 创建玩家会话
    this.playerSessions.set(playerName, {
      socketId: socket.id,
      playerId: playerId,
      roomId: null,
      disconnectTimer: null
    });

    // 发送登录成功响应
    socket.emit('login_success', {
      player: {
        name: playerName,
        socketId: socket.id,
        playerId: playerId
      }
    });

    // 创建房间
    const roomId = this.generateRoomId();
    const room = {
      players: [{
        socketId: socket.id,
        playerId: playerId,
        name: playerName,
        isHost: true,
        isReady: false
      }],
      status: 'waiting'
    };

    // 添加3个机器人玩家
    for (let i = 1; i <= 3; i++) {
      const botName = `Bot${i}`;
      const botId = `bot_${i}_${Date.now()}`;
      room.players.push({
        socketId: `bot_${i}`,
        playerId: botId,
        name: botName,
        isHost: false,
        isReady: true
      });
    }

    this.games.set(roomId, room);
    socket.join(roomId);
    this.playerSessions.get(playerName).roomId = roomId;

    // 发送房间创建成功响应
    const response = {
      id: roomId,
      currentPlayer: {
        socketId: socket.id,
        playerId: playerId,
        name: playerName
      },
      players: room.players.map(p => ({
        username: p.name,
        sessionId: p.playerId,
        ready: p.ready || false,
        isHost: p.isHost
      })),
      status: room.status
    };

    socket.emit('room_joined', response);
    this.broadcastRoomList();
  }

  handleJoinGame(socket, roomId) {
    console.log(`Player attempting to join game in room ${roomId}`);
    const room = this.games.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const playerSession = Array.from(this.playerSessions.entries())
      .find(([_, session]) => session.socketId === socket.id);

    if (!playerSession) {
      socket.emit('error', { message: '未找到玩家会话' });
      return;
    }

    const [playerName, session] = playerSession;
    const player = room.players.find(p => p.name === playerName);

    if (!player) {
      socket.emit('error', { message: '您不在该房间中' });
      return;
    }

    // 发送当前游戏状态
    const gameState = this.getGameState(roomId);
    if (gameState) {
      console.log(`Sending game state to player ${playerName}:`, gameState);
      socket.emit('game_state_update', gameState);
    }
  }

  // 添加游戏状态同步处理
  handleRequestGameSync(socket, data) {
    const { roomId } = data;
    console.log(`Received game sync request for room ${roomId}`);
    
    const room = this.games.get(roomId);
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const playerSession = Array.from(this.playerSessions.entries())
      .find(([_, session]) => session.socketId === socket.id);

    if (!playerSession) {
      socket.emit('error', { message: '未找到玩家会话' });
      return;
    }

    const [playerName, session] = playerSession;
    const player = room.players.find(p => p.name === playerName);

    if (!player) {
      socket.emit('error', { message: '您不在该房间中' });
      return;
    }

    // 获取并发送游戏状态
    const gameState = this.getGameState(roomId);
    if (gameState) {
      console.log(`Syncing game state to player ${playerName}:`, gameState);
      socket.emit('game_sync', {
        roomId,
        gameState
      });
    }
  }

  getGameState(roomId) {
    const room = this.games.get(roomId);
    if (!room || !room.gameCore) {
      return null;
    }

    const gameState = room.gameCore.getState();
    return {
      ...gameState,
      roomId,
      currentPlayer: room.gameCore.getCurrentPlayer(),
      players: room.players.map(p => ({
        username: p.name,
        sessionId: p.playerId,
        ready: p.ready || false,
        isHost: p.isHost
      }))
    };
  }

  handleSelectHeroCards(socket, data) {
    const { roomId, cardIds } = data;
    console.log(`Player selecting hero cards in room ${roomId}:`, cardIds);
    
    const room = this.games.get(roomId);
    if (!room) {
      socket.emit('heroes_selected', { 
        success: false, 
        error: '房间不存在' 
      });
      return;
    }

    // 找到当前玩家
    const playerSession = Array.from(this.playerSessions.entries())
      .find(([_, session]) => session.socketId === socket.id);

    if (!playerSession) {
      socket.emit('heroes_selected', { 
        success: false, 
        error: '未找到玩家会话' 
      });
      return;
    }

    const [playerName, session] = playerSession;
    const player = room.players.find(p => p.name === playerName);

    if (!player) {
      socket.emit('heroes_selected', { 
        success: false, 
        error: '您不在该房间中' 
      });
      return;
    }

    try {
      // 检查游戏核心是否存在
      if (!room.gameCore) {
        console.log('Game core not initialized');
        socket.emit('heroes_selected', { 
          success: false, 
          error: '游戏尚未初始化' 
        });
        return;
      }

      // 处理当前玩家的英雄选择
      room.gameCore.selectInitialHeroCards(player.playerId, cardIds);
      socket.emit('heroes_selected', { success: true });

      // 让机器人玩家自动选择英雄
      const botPlayers = room.players.filter(p => p.name.startsWith('Bot'));
      console.log('Bot players:', botPlayers);

      botPlayers.forEach(bot => {
        const botGamePlayer = room.gameCore.players.find(p => p.id === bot.playerId);
        if (botGamePlayer && botGamePlayer.tempHeroCards) {
          // 机器人简单地选择前两张牌
          const botSelectedCards = botGamePlayer.tempHeroCards.slice(0, 2).map(card => card.id);
          console.log(`Bot ${bot.name} selecting cards:`, botSelectedCards);
          room.gameCore.selectInitialHeroCards(bot.playerId, botSelectedCards);
        }
      });

      // 广播更新后的游戏状态
      const gameState = this.getGameState(roomId);
      if (gameState) {
        console.log('Broadcasting updated game state after hero selection');
        this.io.to(roomId).emit('game_state_update', gameState);
      }

      // 检查是否所有玩家都已完成选择
      const allPlayersSelected = room.gameCore.players.every(p => !p.tempHeroCards);
      if (allPlayersSelected) {
        console.log('All players have selected their heroes, starting game phase');
        room.gameCore.phase = 'playing';
        const updatedGameState = this.getGameState(roomId);
        if (updatedGameState) {
          this.io.to(roomId).emit('game_state_update', updatedGameState);
        }
      }
    } catch (error) {
      console.error('Error handling hero selection:', error);
      socket.emit('heroes_selected', { 
        success: false, 
        error: error.message || '选择英雄失败' 
      });
    }
  }
}

module.exports = SocketHandler; 