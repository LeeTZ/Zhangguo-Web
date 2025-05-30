// 处理国家选择
socket.on('select_country', async (data, callback) => {
  const { roomId, countryId } = data;
  const playerId = socket.id;

  try {
    const room = gameRooms.get(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    const result = room.gameManager.handleCountrySelection(playerId, countryId);
    callback(result);
  } catch (error) {
    console.error('Error handling country selection:', error);
    callback({ success: false, error: error.message });
  }
}); 