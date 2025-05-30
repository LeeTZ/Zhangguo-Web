const { createRenheCards, shuffleCards } = require('./data/renheCards');

class GameServer {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('start_game', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (!room) {
          socket.emit('error', { message: '房间不存在' });
          return;
        }

        // 检查是否是房主
        const player = room.players.find(p => p.sessionId === socket.id);
        if (!player || !player.isHost) {
          socket.emit('error', { message: '只有房主可以开始游戏' });
          return;
        }

        // 初始化游戏状态
        const gameState = this.initializeGame(room);
        
        // 广播游戏开始事件
        this.io.to(roomId).emit('game_started', gameState);
        
        // 更新房间状态
        room.status = 'playing';
        room.gameState = gameState;
        
        // 广播房间更新
        this.broadcastRoomUpdate(roomId);
      });

      // ... 其他事件处理 ...
    });
  }

  initializeGame(room) {
    // 初始化人和牌堆
    const renheDeck = shuffleCards(createRenheCards());
    console.log('人和牌堆初始化完成，共', renheDeck.length, '张牌');

    // 为每个玩家分配初始牌
    room.players.forEach(player => {
      // 初始化玩家手牌
      player.hand = {
        renhe: renheDeck.splice(0, 3), // 每人3张人和牌
        hero: [],
        heroNeutral: [],
        shishi: [],
        shenqi: []
      };
      
      console.log(`玩家 ${player.username} 获得了 ${player.hand.renhe.length} 张人和牌`);
    });

    // 返回游戏初始状态
    return {
      phase: 'playing',
      round: 1,
      currentPlayer: room.players[0],
      players: room.players.map(player => ({
        id: player.sessionId,
        username: player.username,
        hand: {
          renhe: player.hand.renhe.length,
          hero: player.hand.hero.length,
          heroNeutral: player.hand.heroNeutral.length,
          shishi: player.hand.shishi.length,
          shenqi: player.hand.shenqi.length
        },
        isHost: player.isHost
      })),
      decks: {
        renhe: renheDeck.length
      }
    };
  }

  broadcastRoomUpdate(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.io.to(roomId).emit('room_updated', {
        id: roomId,
        players: room.players,
        status: room.status,
        gameState: room.gameState
      });
    }
  }
}

module.exports = GameServer; 