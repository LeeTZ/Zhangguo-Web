const GameManager = require('./gameManager');
const { GamePhase } = require('./gamePhases');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostPlayer) {
    const roomId = generateRoomId();
    const room = {
      id: roomId,
      players: [{
        id: hostPlayer.id,
        name: hostPlayer.name,
        socketId: hostPlayer.socketId,
        isHost: true
      }],
      status: 'waiting'
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addPlayerToRoom(roomId, player) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    room.players.push({
      id: player.id,
      name: player.name,
      socketId: player.socketId,
      isHost: room.players.length === 0
    });

    return room;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    
    // 如果房间空了，删除房间
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // 如果房主离开，选择新房主
    if (!room.players.some(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    return room;
  }

  getRoomByPlayerId(playerId) {
    for (const [_, room] of this.rooms) {
      if (room.players.some(p => p.id === playerId)) {
        return room;
      }
    }
    return null;
  }
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = new RoomManager(); 