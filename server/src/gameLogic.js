// 游戏状态管理
const games = new Map();

// 创建新游戏
function createGame(roomId, players) {
  const game = {
    roomId,
    players,
    status: 'waiting',
    currentTurn: 0,
    // 这里可以添加更多游戏相关的状态
  };
  games.set(roomId, game);
  return game;
}

// 加入游戏
function joinGame(roomId, player) {
  const game = games.get(roomId);
  if (!game) return null;
  
  if (game.players.length >= 7) return null;
  
  game.players.push(player);
  return game;
}

// 离开游戏
function leaveGame(roomId, playerId) {
  const game = games.get(roomId);
  if (!game) return null;
  
  game.players = game.players.filter(player => player.socketId !== playerId);
  
  if (game.players.length === 0) {
    games.delete(roomId);
    return null;
  }
  
  return game;
}

module.exports = {
  createGame,
  joinGame,
  leaveGame
}; 