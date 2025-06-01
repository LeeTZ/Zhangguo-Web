const { GamePhase, TurnPhase, ActionType, GameConfig } = require('./gamePhases');
const GameCore = require('./gameCore').GameCore;
const BotPlayer = require('./botPlayer').BotPlayer;

class GameManager {
  constructor(roomId, broadcast) {
    this.roomId = roomId;
    this.players = [];
    this.gameCore = null;
    this.currentPhase = GamePhase.WAITING;
    this.currentTurnPhase = null;
    this.currentPlayerIndex = 0;
    this.hostId = null;
    this.broadcast = broadcast;
    this.round = 1;
  }

  // 添加玩家
  addPlayer(player) {
    if (this.players.length >= GameConfig.MAX_PLAYERS) {
      return { success: false, message: '房间已满' };
    }
    
    this.players.push({
      id: player.id,
      name: player.name,
      socketId: player.socketId,
      isHost: player.isHost
    });

    // 第一个加入的玩家成为房主
    if (this.players.length === 1) {
      this.hostId = player.id;
    }

    this.broadcastGameState();
    return { success: true };
  }

  // 移除玩家
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    this.broadcastGameState();
  }

  // 检查是否可以开始游戏
  canStartGame() {
    return this.players.length >= GameConfig.MIN_PLAYERS &&
           this.players.length <= GameConfig.MAX_PLAYERS &&
           this.currentPhase === GamePhase.WAITING;
  }

  // 开始游戏
  startGame() {
    if (!this.canStartGame()) {
      throw new Error('Cannot start game: not enough players');
    }

    // 初始化游戏核心
    this.gameCore = new GameCore(this.players);

    // 设置游戏阶段为国家选择
    this.currentPhase = 'country_selection';
    this.gameCore.phase = 'country_selection';

    // 广播初始游戏状态
    this.broadcastGameState();
  }

  // 开始新回合
  startNewTurn() {
    console.log(`Starting turn ${this.gameCore.round}...`);
    this.currentTurnPhase = TurnPhase.ALLIANCE;
    this.processTurnPhase();
  }

  // 处理回合阶段
  processTurnPhase() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    switch (this.currentTurnPhase) {
      case TurnPhase.ALLIANCE:
        // 盟会阶段
        this.handleAlliancePhase();
        break;
        
      case TurnPhase.STRATEGY:
        // 权谋阶段
        this.handleStrategyPhase();
        break;
        
      case TurnPhase.PLANNING:
        // 筹谋阶段
        this.handlePlanningPhase();
        break;
        
      case TurnPhase.COMPETITION:
        // 争雄阶段
        this.handleCompetitionPhase();
        break;
    }
    
    this.broadcastGameState();
  }

  // 处理盟会阶段
  handleAlliancePhase() {
    const hostPlayer = this.players.find(p => p.isHost);
    if (!hostPlayer) return;

    // 检查周天子标记
    const kingTokenCountry = Object.entries(this.gameCore.countries)
      .find(([_, country]) => country.hasKingToken)?.[0];
    
    if (kingTokenCountry) {
      // 等待盟主移动周天子
      this.waitForKingTokenMove(hostPlayer.id);
    } else {
      // 进入权谋阶段
      this.currentTurnPhase = TurnPhase.STRATEGY;
      this.processTurnPhase();
    }
  }

  // 等待盟主移动周天子
  waitForKingTokenMove(hostId) {
    this.currentPlayerIndex = this.players.findIndex(p => p.id === hostId);
    this.broadcast('waiting_for_king_token_move', {
      playerId: hostId
    });
  }

  // 处理周天子标记移动
  handleKingTokenMove(playerId, targetCountry) {
    if (playerId !== this.players.find(p => p.isHost)?.id) {
      return false;
    }

    const success = this.gameCore.moveKingToken(targetCountry);
    if (success) {
      // 广播周天子标记移动
      this.broadcast('king_token_moved', {
        playerId,
        targetCountry
      });

      // 进入权谋阶段
      this.currentTurnPhase = TurnPhase.STRATEGY;
      this.processTurnPhase();
    }

    return success;
  }

  // 处理权谋阶段
  handleStrategyPhase() {
    const hostPlayer = this.players.find(p => p.isHost);
    if (!hostPlayer) return;

    // 等待盟主打出第一张牌
    this.waitForHostCard(hostPlayer.id);
  }

  // 处理筹谋阶段
  handlePlanningPhase() {
    const hostPlayer = this.players.find(p => p.isHost);
    if (!hostPlayer) return;

    // 从盟主开始，按顺时针顺序执行操作
    this.currentPlayerIndex = this.players.findIndex(p => p.id === hostPlayer.id);
    this.waitForPlanningAction(this.players[this.currentPlayerIndex].id);
  }

  // 处理争雄阶段
  handleCompetitionPhase() {
    const hostPlayer = this.players.find(p => p.isHost);
    if (!hostPlayer) return;

    // 从盟主左手边的玩家开始
    const hostIndex = this.players.findIndex(p => p.id === hostPlayer.id);
    this.currentPlayerIndex = (hostIndex + 1) % this.players.length;
    
    // 等待玩家争雄
    this.waitForCompetition(this.players[this.currentPlayerIndex].id);
  }

  // 处理玩家行动
  handleAction(playerId, action) {
    if (this.currentPhase !== GamePhase.PLAYING) {
      return false;
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) return false;

    switch (this.currentTurnPhase) {
      case TurnPhase.ALLIANCE:
        if (action.type === ActionType.MOVE_KING) {
          return this.handleKingTokenMove(playerId, action.targetCountry);
        }
        break;

      case TurnPhase.STRATEGY:
        if (action.type === ActionType.PLAY_CARD) {
          return this.handleStrategyCardPlay(playerId, action);
        }
        break;

      case TurnPhase.PLANNING:
        switch (action.type) {
          case ActionType.DRAW_CARDS:
            return this.handlePlanningDrawCards(playerId);
          case ActionType.GET_TOKENS:
            return this.handlePlanningGetTokens(playerId);
          case ActionType.MARKET_ACTION:
            return this.handlePlanningMarketAction(playerId, action);
          case ActionType.SEEK_TALENT:
            return this.handlePlanningSeekTalent(playerId);
        }
        break;

      case TurnPhase.COMPETITION:
        if (action.type === ActionType.PLAY_CARD) {
          return this.handleCompetitionAction(playerId, action);
        }
        break;
    }

    return false;
  }

  // 结束当前回合
  endTurn() {
    // 移动到下一个玩家
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // 如果回到第一个玩家，回合数+1
    if (this.currentPlayerIndex === 0) {
      this.gameCore.round++;
      
      // 检查游戏是否结束
      if (this.gameCore.round > GameConfig.MAX_ROUNDS) {
        this.endGame();
        return;
      }
    }
    
    // 开始新回合
    this.startNewTurn();
  }

  // 结束游戏
  endGame() {
    this.currentPhase = GamePhase.FINISHED;
    // TODO: 计算胜利点数
    this.broadcastGameState();
  }

  // 广播游戏状态
  broadcastGameState() {
    if (this.broadcast) {
      const gameState = this.getGameState();
      this.broadcast(this.roomId, gameState);
    }
  }

  // 获取游戏状态
  getGameState() {
    console.log('Getting game state:', {
      phase: this.currentPhase,
      turnPhase: this.currentTurnPhase,
      currentPlayerIndex: this.currentPlayerIndex
    });
    
    // 获取游戏核心状态
    const gameState = this.gameCore ? {
      phase: this.currentPhase,
      turnPhase: this.currentTurnPhase,
      currentPlayerIndex: this.currentPlayerIndex,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        socketId: p.socketId,
        isHost: p.isHost,
        actionPoints: p.actionPoints,
        geoTokens: p.geoTokens,
        tributeTokens: p.tributeTokens,
        handSize: this.gameCore.players.find(gp => gp.id === p.id)?.hand.length || 0,
        isCurrentPlayer: this.currentPlayerIndex !== -1 && this.players[this.currentPlayerIndex].id === p.id,
        selectedCountry: this.gameCore.players.find(gp => gp.id === p.id)?.selectedCountry
      })),
      countries: this.gameCore.countries,
      turn: this.gameCore.turn,
      availableCountries: this.currentPhase === 'country_selection' ? this.gameCore.getAvailableCountries() : undefined,
      selectedCountries: Array.from(this.gameCore.selectedCountries || []),
      initialCards: this.currentPhase === 'initial_hero_selection' ? 
        this.gameCore.players[this.currentPlayerIndex]?.tempHeroCards : undefined,
      market: this.gameCore.market,
      activeTianshiCard: this.gameCore.activeTianshiCard,
      jingnangMarket: this.gameCore.jingnangMarket
    } : {
      phase: this.currentPhase,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        socketId: p.socketId,
        isHost: p.isHost
      })),
      countries: {},
      turn: 0,
      availableCountries: [],
      selectedCountries: [],
      market: [],
      jingnangMarket: []
    };

    console.log('Returning game state:', gameState);
    return gameState;
  }

  // 处理玩家选择初始英杰牌
  handleInitialHeroSelection(playerId, selectedCardIds) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不存在');
    }

    // 如果是机器人玩家，使用AI逻辑选择卡牌
    if (player.isBot) {
      const botPlayer = new BotPlayer(player.id, player.name);
      const tempCards = this.gameCore.players.find(p => p.id === playerId).tempHeroCards;
      selectedCardIds = botPlayer.selectInitialHeroCards(tempCards);
    }

    try {
      // 在游戏核心中处理卡牌选择
      this.gameCore.selectInitialHeroCards(playerId, selectedCardIds);

      // 广播更新后的游戏状态
      this.broadcastGameState();

      // 检查是否所有玩家都已完成选择
      const allPlayersSelected = this.gameCore.players.every(p => !p.tempHeroCards);
      if (allPlayersSelected) {
        // 开始正式游戏流程
        this.startGamePhase();
      }
    } catch (error) {
      throw new Error(`选择英杰牌失败: ${error.message}`);
    }
  }

  // 添加机器人玩家
  addBotPlayer() {
    const botId = `bot-${Date.now()}`;
    const botName = `机器人-${this.players.length + 1}`;
    
    const botPlayer = {
      id: botId,
      name: botName,
      isBot: true,
      isReady: true,
      socketId: null
    };

    this.players.push(botPlayer);
    this.broadcast('player_joined', { player: botPlayer });
    
    // 如果达到最小玩家数，自动开始游戏
    if (this.players.length >= GameConfig.MIN_PLAYERS) {
      this.startGame();
    }
  }

  // 开始游戏阶段
  startGamePhase() {
    this.currentPhase = GamePhase.PLAYING;
    this.currentTurnPhase = TurnPhase.STRATEGY;
    
    // 处理机器人玩家的回合
    if (this.getCurrentPlayer().isBot) {
      this.handleBotTurn();
    }
    
    this.broadcastGameState();
  }

  // 处理机器人玩家的回合
  handleBotTurn() {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer.isBot) return;

    const botPlayer = new BotPlayer(currentPlayer.id, currentPlayer.name);
    
    // TODO: 实现机器人的回合行动逻辑
    
    // 模拟机器人思考时间
    setTimeout(() => {
      // 结束回合
      this.endTurn();
    }, 2000);
  }

  // 处理玩家选择国家
  handleCountrySelection(playerId, countryId) {
    console.log(`Handling country selection for player ${playerId}, country ${countryId}`);
    
    try {
      const result = this.gameCore.selectCountry(playerId, countryId);
      
      // 如果所有玩家都已选择国家，更新游戏阶段
      if (result.allPlayersSelected) {
        this.currentPhase = 'initial_hero_selection';
      }
      
      // 广播更新后的游戏状态
      this.broadcastGameState();

      // 如果所有人类玩家都已选择，让机器人玩家选择
      if (result.success) {
        this.handleBotCountrySelections();
      }

      return { success: true };
    } catch (error) {
      console.error('Country selection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 处理机器人玩家的国家选择
  handleBotCountrySelections() {
    // 获取所有未选择国家的机器人玩家
    const botsWithoutCountry = this.players.filter(p => 
      p.isBot && !this.gameCore.players.find(gp => gp.id === p.id)?.selectedCountry
    );

    // 按顺序让每个机器人选择国家
    for (const bot of botsWithoutCountry) {
      try {
        console.log(`Bot ${bot.id} selecting country`);
        this.gameCore.botSelectCountry(bot.id);
      } catch (error) {
        console.error(`Bot ${bot.id} failed to select country:`, error);
      }
    }

    // 广播更新后的游戏状态
    this.broadcastGameState();
  }

  // 处理翻开天时牌
  handleDrawTianshiCard(playerId) {
    // 检查是否是盟主
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.isHost) {
      return;
    }

    // 检查是否已经有激活的天时牌
    if (this.gameCore.activeTianshiCard) {
      return;
    }

    // 翻开天时牌并结算
    const tianshiCard = this.gameCore.drawAndActivateTianshiCard();
    if (tianshiCard) {
      // 广播天时牌信息
      this.broadcast('tianshi_card_drawn', {
        card: tianshiCard,
        playerId: playerId
      });

      // 结算天时牌效果
      this.gameCore.resolveTianshiCard(tianshiCard);
      
      // 检查玩家英杰牌目标是否达成
      this.gameCore.checkHeroGoals();

      // 广播更新后的游戏状态
      this.broadcastGameState();
    }
  }

  // 处理WebSocket消息
  handleMessage(playerId, message) {
    switch (message.type) {
      // ... existing cases ...
      case 'DRAW_TIANSHI_CARD':
        this.handleDrawTianshiCard(playerId);
        break;
      // ... existing code ...
    }
  }
}

module.exports = GameManager; 