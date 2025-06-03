import { io, Socket } from 'socket.io-client';
import { store } from './store';
import {
  updateGameState,
  setPhase,
  setCurrentPlayer,
  updatePlayers,
  updateDeckCounts,
  setMarket
} from './store/gameSlice';
import { setCurrentRoom, updateRoom, setRooms } from './store/roomSlice';
import { GameState, Player, CardType, ServerRoom } from './store/types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

// 全局socket实例
let globalSocket: Socket | null = null;
let globalSessionData: {
  playerName: string | null;
  roomId: string | null;
  playerId: string | null;
} | null = null;

// 会话管理器
class SessionManager {
  private socket!: Socket;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private static instance: SessionManager;
  private sessionData: {
    playerName: string | null;
    roomId: string | null;
    playerId: string | null;
  } = {
    playerName: null,
    roomId: null,
    playerId: null
  };

  constructor() {
    if (SessionManager.instance) {
      return SessionManager.instance;
    }

    console.log('SessionManager: Initializing...');
    
    // 如果已经存在全局socket实例，则重用它
    if (globalSocket) {
      console.log('Reusing existing socket connection');
      this.socket = globalSocket;
    } else {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });
      globalSocket = this.socket;
    }

    // 尝试从localStorage恢复会话数据
    this.loadSession();
    
    // 如果有全局会话数据，优先使用它
    if (globalSessionData) {
      console.log('Restoring from global session data:', globalSessionData);
      this.sessionData = { ...globalSessionData };
    } else if (this.sessionData.playerName) {
      console.log('Restoring from local storage:', this.sessionData);
      globalSessionData = { ...this.sessionData };
    }

    this.setupEventListeners();
    SessionManager.instance = this;
  }

  private setupEventListeners() {
    // 只在首次设置事件监听器
    if (this.socket.hasListeners('connect')) {
      console.log('Event listeners already set up');
      return;
    }

    // 连接生命周期事件
    this.socket.on('connect', () => {
      console.log('Socket connected:', {
        id: this.socket.id,
        connected: this.socket.connected,
        disconnected: this.socket.disconnected
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        reason,
        id: this.socket.id,
        connected: this.socket.connected,
        disconnected: this.socket.disconnected,
        sessionData: this.sessionData
      });
    });

    // 登录成功事件监听
    this.socket.on('login_success', this.handleLoginSuccess);

    // 天时牌翻开事件监听
    this.socket.on('tianshi_card_drawn', (data) => {
      console.log('Tianshi card drawn event received:', data);
      
      // 从当前状态获取游戏状态
      const currentState = store.getState().game;
      
      // 更新游戏状态
      store.dispatch(updateGameState({
        ...currentState,
        activeTianshiCard: data.card,
        tianshiDeck: data.tianshiDeck,
        decks: {
          ...currentState.decks,
          tianshi: data.tianshiDeckCount
        }
      }));

      // 添加调试日志
      console.log('Game state after update:', {
        activeTianshiCard: data.card,
        tianshiDeck: data.tianshiDeck,
        tianshiDeckCount: data.tianshiDeckCount
      });
    });
  }

  private handleLoginSuccess = (response: any) => {
    if (response.player) {
      this.sessionData.playerName = response.player.name;
      this.sessionData.playerId = response.player.playerId;
      this.saveSession();
      console.log('Login success, session data updated:', this.sessionData);
    }
  }

  private saveSession() {
    if (this.sessionData.playerName) {
      localStorage.setItem('sessionData', JSON.stringify(this.sessionData));
      globalSessionData = { ...this.sessionData };
      console.log('Session data saved:', this.sessionData);
    } else {
      localStorage.removeItem('sessionData');
      globalSessionData = null;
      console.log('Session data cleared');
    }
  }

  private loadSession(): boolean {
    const saved = localStorage.getItem('sessionData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.sessionData = parsed;
        globalSessionData = { ...parsed };
        console.log('Session data loaded:', this.sessionData);
        return true;
      } catch (error) {
        console.error('Failed to parse session data:', error);
        localStorage.removeItem('sessionData');
        globalSessionData = null;
      }
    }
    return false;
  }

  public login(playerName: string) {
    this.sessionData.playerName = playerName;
    this.saveSession();
    this.socket.emit('login', { playerName });
  }

  public joinRoom(roomId: string) {
    if (this.sessionData.playerName) {
      console.log('Emitting join_room:', {
        roomId,
        playerName: this.sessionData.playerName,
        playerId: this.sessionData.playerId
      });
      this.socket.emit('join_room', {
        roomId,
        playerName: this.sessionData.playerName,
        playerId: this.sessionData.playerId
      });
      this.sessionData.roomId = roomId;
      this.saveSession();
    }
  }

  public leaveRoom() {
    if (this.sessionData.roomId) {
      this.socket.emit('leave_room', {
        roomId: this.sessionData.roomId
      });
      this.sessionData.roomId = null;
      this.saveSession();
    }
  }

  public startGame() {
    if (this.sessionData.roomId) {
      this.socket.emit('start_game', {
        roomId: this.sessionData.roomId
      });
    }
  }

  public getSocket() {
    return this.socket;
  }

  public setSessionData(playerName: string | null, roomId: string | null, playerId: string | null = null) {
    this.sessionData.playerName = playerName;
    this.sessionData.roomId = roomId;
    this.sessionData.playerId = playerId;
    this.saveSession();
  }

  public getSessionData() {
    return { ...this.sessionData };
  }

  public playCard(cardId: string, targets?: string[]) {
    this.socket.emit('play_card', { cardId, targets });
  }

  public selectHeroCards(cardIds: string[]) {
    this.socket.emit('select_hero_cards', { cardIds });
  }

  public drawTianshiCard() {
    console.log('[Socket] 准备发送翻开天时牌事件');
    const roomId = store.getState().room.currentRoom?.id;
    if (!roomId) {
      console.error('[Socket] 错误: 房间ID不存在');
      return;
    }
    console.log('[Socket] 发送翻开天时牌事件，房间ID:', roomId);
    this.socket.emit('draw_tianshi_card', { roomId });
  }
}

// 导出实例和方法
export const sessionManager = new SessionManager();
export const socket = sessionManager.getSocket();

// 游戏动作对象
export const gameActions = {
  startGame: () => sessionManager.startGame(),
  playCard: (cardId: string, targets?: string[]) => sessionManager.playCard(cardId, targets),
  selectHeroCards: (cardIds: string[]) => sessionManager.selectHeroCards(cardIds),
  drawTianshiCard: () => sessionManager.drawTianshiCard(),
  on: (event: string, callback: (data: any) => void) => {
    sessionManager.getSocket().on(event, callback);
  },
  off: (event: string, callback: (data: any) => void) => {
    sessionManager.getSocket().off(event, callback);
  }
};

// 导出公共方法
export const loginPlayer = (playerName: string) => sessionManager.login(playerName);
export const joinRoom = (roomId: string) => sessionManager.joinRoom(roomId);
export const leaveRoom = () => sessionManager.leaveRoom();
export const leaveCurrentRoom = () => sessionManager.leaveRoom();
export const startGame = () => sessionManager.startGame();

export const handleRoomUpdate = (room: any) => {
  store.dispatch(setCurrentRoom({
    ...room,
    maxPlayers: 7,
    isPlaying: room.status === 'playing',
    players: room.players.map((player: any) => ({
      sessionId: player.sessionId,
      username: player.username,
      isHost: player.isHost
    }))
  }));
}; 