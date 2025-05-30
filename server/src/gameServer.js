const { TurnPhase } = require('./gamePhases');
const { GAME_CONSTANTS } = require('./gameCore');
const GameCore = require('./gameCore');

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
        const gameCore = new GameCore(room.players);
        gameCore.initializeGame();
        room.gameCore = gameCore;
        
        // 广播游戏开始事件
        this.io.to(roomId).emit('game_started', this.getGameState(room));
        
        // 更新房间状态
        room.status = 'playing';
        
        // 广播房间更新
        this.broadcastRoomUpdate(roomId);
      });

      // ... 其他事件处理 ...
    });
  }

  getGameState(room) {
    return {
      phase: TurnPhase.PLAYING,
      round: 1,
      currentPlayer: room.players[0],
      players: room.players.map(player => ({
        id: player.sessionId,
        username: player.username,
        hand: player.hand,
        isHost: player.isHost
      })),
      decks: room.gameCore.getDecksState()
    };
  }

  broadcastRoomUpdate(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      this.io.to(roomId).emit('room_updated', {
        id: roomId,
        players: room.players,
        status: room.status,
        gameState: room.gameCore ? this.getGameState(room) : null
      });
    }
  }
}

module.exports = GameServer; 