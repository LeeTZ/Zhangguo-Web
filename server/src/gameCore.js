// 战国卡牌游戏核心数据结构与牌堆管理
const { TurnPhase } = require('./gamePhases');
const { tianshiCards, getTianshiDeck, getHeroDeckByCountry, getNeutralHeroDeck } = require('./cardData');

// 卡牌类型
const CardType = {
  HERO: 'hero',           // 英杰牌
  HERO_NEUTRAL: 'hero_neutral', // 无所属英杰牌
  TIANSHI: 'tianshi',     // 天时牌
  RENHE: 'renhe',         // 人和牌
  SHISHI: 'shishi',       // 史实牌
  SHENQI: 'shenqi',       // 神机牌
  XIANJI: 'xianji',       // 先机牌
  YUANMOU: 'yuanmou'      // 远谋牌
};

// 国家（七雄）
const COUNTRY_LIST = ['齐', '楚', '燕', '韩', '赵', '魏', '秦'];

// 国家初始属性
const COUNTRY_INIT = {
  '齐': { military: 4, economy: 6, politics: 5 },
  '楚': { military: 4, economy: 5, politics: 6 },
  '燕': { military: 5, economy: 4, politics: 4 },
  '韩': { military: 4, economy: 5, politics: 5 },
  '赵': { military: 5, economy: 5, politics: 5 },
  '魏': { military: 6, economy: 5, politics: 6, hasKingToken: true }, // 初始周天子在魏国
  '秦': { military: 5, economy: 4, politics: 5 }
};

// 游戏配置常量
const GAME_CONSTANTS = {
  TIANSHI_CARDS_COUNT: {
    3: 12, // 3人游戏12张
    4: 10, // 4人游戏10张
    5: 9,  // 5人游戏9张
    6: 8,  // 6人游戏8张
    7: 8   // 7人游戏8张
  },
  INITIAL_GEO_TOKENS: 3,    // 初始地利标记数量
  INITIAL_HERO_CARDS: {     // 初始英杰牌数量
    DRAW: 4,               // 抽取数量
    KEEP: { MIN: 2, MAX: 3 } // 保留数量范围
  },
  INITIAL_RENHE_CARDS: 3,   // 初始人和牌数量
  INITIAL_SHISHI_CARDS: 2   // 初始史实牌数量
};

// 国家对象
class Country {
  constructor(name) {
    this.name = name;
    this.military = COUNTRY_INIT[name].military;
    this.economy = COUNTRY_INIT[name].economy;
    this.politics = COUNTRY_INIT[name].politics;
    this.hegemony = 0; // 称霸标记
    this.kingToken = COUNTRY_INIT[name].hasKingToken || false; // 周天子标记
    this.isAlive = true;
  }

  // 获取国力总和
  getTotalPower() {
    return this.military + this.economy + this.politics;
  }

  // 检查是否满足灭国条件
  checkDestruction() {
    return this.getTotalPower() <= 3;
  }

  // 增加属性
  addAttribute(attribute, value) {
    if (this[attribute] !== undefined) {
      this[attribute] = Math.min(9, this[attribute] + value);
      return true;
    }
    return false;
  }

  // 减少属性
  reduceAttribute(attribute, value) {
    if (this[attribute] !== undefined) {
      this[attribute] = Math.max(0, this[attribute] - value);
      return true;
    }
    return false;
  }
}

// 玩家对象
class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.hand = {
      hero: [],           // 国家英杰牌
      heroNeutral: [],    // 无所属英杰牌
      renhe: [],          // 人和牌
      shishi: [],         // 史实牌
      shenqi: [],         // 神机牌
    };
    this.geoTokens = GAME_CONSTANTS.INITIAL_GEO_TOKENS; // 地利标记
    this.tributeTokens = 0; // 贡品标记
    this.isHost = false;    // 是否为盟主
    this.isReady = false;
  }

  // 获取总手牌数
  getTotalHandCards() {
    return Object.values(this.hand).reduce((sum, cards) => sum + cards.length, 0);
  }

  // 添加卡牌到手牌
  addCard(cardType, card) {
    if (this.hand[cardType]) {
      this.hand[cardType].push(card);
      return true;
    }
    return false;
  }

  // 移除手牌
  removeCard(cardType, cardId) {
    if (this.hand[cardType]) {
      const index = this.hand[cardType].findIndex(c => c.id === cardId);
      if (index !== -1) {
        return this.hand[cardType].splice(index, 1)[0];
      }
    }
    return null;
  }

  // 获取指定类型的手牌
  getCards(cardType) {
    return this.hand[cardType] || [];
  }

  // 获取手牌信息
  getHandInfo() {
    return {
      total: this.getTotalHandCards(),
      hero: this.hand.hero.length,
      heroNeutral: this.hand.heroNeutral.length,
      renhe: this.hand.renhe.length,
      shishi: this.hand.shishi.length,
      shenqi: this.hand.shenqi.length
    };
  }

  // 转换为JSON格式（用于网络传输）
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      hand: this.hand,
      geoTokens: this.geoTokens,
      tributeTokens: this.tributeTokens,
      isHost: this.isHost,
      isReady: this.isReady
    };
  }
}

// 牌堆对象
class Deck {
  constructor(cards = []) {
    this.cards = cards;
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  draw(n = 1) {
    return this.cards.splice(0, n);
  }
  addToTop(card) {
    this.cards.unshift(card);
  }
  addToBottom(card) {
    this.cards.push(card);
  }
  isEmpty() {
    return this.cards.length === 0;
  }
  size() {
    return this.cards.length;
  }
}

// 标记池
class TokenPool {
  constructor(total) {
    this.total = total;
    this.available = total;
  }
  take(n) {
    if (this.available >= n) {
      this.available -= n;
      return n;
    }
    const taken = this.available;
    this.available = 0;
    return taken;
  }
  putBack(n) {
    this.available += n;
    if (this.available > this.total) this.available = this.total;
  }
}

// 游戏核心状态
class GameCore {
  constructor(players) {
    this.players = players.map(p => new Player(p.id, p.name));
    this.countries = {};
    this.decks = {
      tianshi: new Deck(),
      hero: {},  // 每个国家一个英杰牌堆
      heroNeutral: new Deck(),
      renhe: new Deck(),
      shishi: new Deck(),
      shenqi: new Deck(),
      xianji: new Deck(),
      yuanmou: new Deck()
    };
    this.market = [];
    this.activeTianshiCard = null;
    this.phase = 'initial_selection';  // 设置初始阶段为initial_selection
    this.round = 1;
    this.currentPlayerIndex = 0;

    // 初始化游戏
    this.initializeGame();
  }

  initializeGame() {
    // 1. 初始化无所属国家的英杰牌堆
    this.decks.heroNeutral = new Deck(getNeutralHeroDeck());
    this.decks.heroNeutral.shuffle();

    // 2. 初始化各国状态和英杰牌堆
    COUNTRY_LIST.forEach(name => {
      // 创建国家状态
      this.countries[name] = {
        name: name,
        military: COUNTRY_INIT[name].military,
        economy: COUNTRY_INIT[name].economy,
        politics: COUNTRY_INIT[name].politics,
        hasKingToken: COUNTRY_INIT[name].hasKingToken || false,
        hegemony: 0
      };
      
      // 创建并洗混该国英杰牌堆
      this.decks.hero[name] = new Deck(getHeroDeckByCountry(name));
      this.decks.hero[name].shuffle();
    });

    // 3. 初始化其他牌堆
    this.initializeDecks();

    // 4. 发放初始英杰牌
    this.dealInitialHeroCards();

    // 5. 将各牌堆放置在地图对应位置
    // 注：这里只是逻辑上的放置，实际的UI显示需要在前端实现
    this.deckLocations = {
      heroNeutral: 'center', // 无所属英杰牌放在中央
      hero: {} // 各国英杰牌放在对应国家位置
    };
    COUNTRY_LIST.forEach(country => {
      this.deckLocations.hero[country] = country;
    });
  }

  initializeDecks() {
    const playerCount = this.players.length;

    // 初始化天时牌堆
    const tianshiDeck = getTianshiDeck(playerCount);
    this.decks.tianshi = new Deck(tianshiDeck);
    console.log('Initialized tianshi deck:', this.decks.tianshi.cards);

    // 抽取第一张天时牌
    this.drawAndActivateTianshiCard();

    // ... 其他牌堆的初始化 ...
  }

  // 发放初始英杰牌
  dealInitialHeroCards() {
    // 1. 每位玩家获得1张无所属英杰牌
    this.players.forEach(player => {
      const [neutralCard] = this.decks.heroNeutral.draw();
      if (neutralCard) {
        player.addCard('heroNeutral', neutralCard);
      }
    });

    // 2. 每位玩家从任意国家牌堆中抽取4张，让玩家选择保留2-3张
    this.players.forEach(player => {
      // 记录玩家抽取的牌，等待玩家选择
      player.tempHeroCards = [];
      
      // 从任意国家牌堆中抽取4张
      const drawnCards = [];
      for (let i = 0; i < GAME_CONSTANTS.INITIAL_HERO_CARDS.DRAW; i++) {
        // 玩家可以从任意国家牌堆中抽取
        const availableCountries = COUNTRY_LIST.filter(country => 
          this.decks.hero[country].cards.length > 0
        );
        
        if (availableCountries.length > 0) {
          const selectedCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
          const [card] = this.decks.hero[selectedCountry].draw();
          if (card) {
            drawnCards.push(card);
          }
        }
      }
      
      // 存储抽取的牌，等待玩家选择
      player.tempHeroCards = drawnCards;
    });
  }

  // 玩家选择要保留的英杰牌
  selectInitialHeroCards(playerId, selectedCardIds) {
    console.log('Selecting initial hero cards for player:', playerId);
    console.log('Selected card IDs:', selectedCardIds);
    
    const player = this.players.find(p => p.id === playerId);
    console.log('Found player:', player);
    
    if (!player) {
      throw new Error('玩家不存在');
    }
    
    if (!player.tempHeroCards) {
      console.log('Player temp hero cards:', player.tempHeroCards);
      throw new Error('没有待选择的英杰牌');
    }

    // 验证选择的数量是否在2-3张之间
    if (selectedCardIds.length < GAME_CONSTANTS.INITIAL_HERO_CARDS.KEEP.MIN || 
        selectedCardIds.length > GAME_CONSTANTS.INITIAL_HERO_CARDS.KEEP.MAX) {
      throw new Error('必须选择2-3张英杰牌保留');
    }

    // 验证选择的卡牌是否存在于待选择的牌中
    const invalidCards = selectedCardIds.filter(id => 
      !player.tempHeroCards.some(card => card.id === id)
    );
    if (invalidCards.length > 0) {
      throw new Error(`选择了无效的卡牌: ${invalidCards.join(', ')}`);
    }

    // 将选中的牌加入玩家手牌
    const selectedCards = player.tempHeroCards.filter(card => selectedCardIds.includes(card.id));
    console.log('Adding selected cards to player hand:', selectedCards);
    selectedCards.forEach(card => {
      player.addCard('hero', card);
    });

    // 将未选中的牌洗回原牌堆
    const unselectedCards = player.tempHeroCards.filter(card => !selectedCardIds.includes(card.id));
    console.log('Returning unselected cards to deck:', unselectedCards);
    unselectedCards.forEach(card => {
      this.decks.hero[card.country].addToBottom(card);
      this.decks.hero[card.country].shuffle();
    });

    // 清除临时存储的牌
    delete player.tempHeroCards;
    console.log('Initial hero selection completed for player:', playerId);
  }

  // 抽取一张天时牌并使其生效
  drawAndActivateTianshiCard() {
    if (!this.decks.tianshi.isEmpty()) {
      console.log('Drawing tianshi card from deck:', this.decks.tianshi.cards);
      
      // 如果有当前生效的天时牌，将其放入弃牌堆（这里简化处理，直接移除）
      this.activeTianshiCard = null;
      
      // 抽取新的天时牌
      const [newCard] = this.decks.tianshi.draw();
      console.log('Drew tianshi card:', newCard);
      this.activeTianshiCard = newCard;

      return newCard;
    }
    return null;
  }

  // 获取当前玩家
  getCurrentPlayer() {
    if (this.players.length === 0) {
      return null;
    }
    return this.players[this.currentPlayerIndex];
  }

  // 切换到下一个玩家
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    return this.getCurrentPlayer();
  }

  // 获取天时牌堆
  getTianshiDeck() {
    console.log('Getting tianshi deck:', this.decks.tianshi.cards);
    return this.decks.tianshi.cards;
  }

  // 获取游戏状态
  getState() {
    // 计算各个国家英杰牌堆的数量
    const heroDecks = {};
    COUNTRY_LIST.forEach(country => {
      heroDecks[country] = this.decks.hero[country].size();
    });

    // 获取当前玩家的临时英雄牌（用于初始选择阶段）
    const currentPlayer = this.getCurrentPlayer();
    const initialCards = currentPlayer?.tempHeroCards || [];

    return {
      phase: this.phase,  // 确保phase在返回对象的最前面
      players: this.players.map(p => p.toJSON()),
      countries: this.countries,
      decks: {
        tianshi: this.decks.tianshi.size(),
        hero: heroDecks,  // 每个国家的英杰牌堆数量
        heroNeutral: this.decks.heroNeutral.size(),
        renhe: this.decks.renhe.size(),
        shishi: this.decks.shishi.size(),
        shenqi: this.decks.shenqi.size(),
        xianji: this.decks.xianji.size(),
        yuanmou: this.decks.yuanmou.size()
      },
      tianshiDeck: this.getTianshiDeck(),
      market: this.market,
      activeTianshiCard: this.activeTianshiCard,
      round: this.round,
      currentPlayer: this.getCurrentPlayer(),
      initialCards: initialCards  // 添加初始英雄牌
    };
  }
}

module.exports = {
  CardType,
  Country,
  Player,
  Deck,
  GameCore,
  COUNTRY_LIST,
  COUNTRY_INIT,
  GAME_CONSTANTS
}; 