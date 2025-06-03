// 战国卡牌游戏核心数据结构与牌堆管理
const { TurnPhase } = require('./gamePhases');
const { tianshiCards, getTianshiDeck, getHeroDeckByCountry, getNeutralHeroDeck } = require('./cardData');
const { createRenheCards, shuffleCards } = require('./data/renheCards');
const { createShishiCards } = require('./data/shishiCards');

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
  INITIAL_GEO_TOKENS: 5,    // 初始地利标记数量
  INITIAL_HERO_CARDS: {     // 初始英杰牌数量
    DRAW: 4,               // 抽取数量
    KEEP: { MIN: 2, MAX: 2 } // 保留数量固定为2张
  },
  INITIAL_RENHE_CARDS: 4,   // 初始人和牌数量
  INITIAL_SHISHI_CARDS: 2,  // 初始史实牌数量
  INITIAL_SHENQI_CARDS: 1,  // 初始神机牌数量（每位玩家1张）
  JINGNANG_MARKET_SIZE: 7   // 锦囊市场的卡牌数量固定为7张
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
    if (!this.hand[cardType]) {
      this.hand[cardType] = [];
    }
    this.hand[cardType].push(card);
    return true;
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
    if (n <= 0) {
      console.error('[牌堆] 错误: 无效的抽牌数量:', n);
      return [];
    }
    
    if (this.cards.length < n) {
      console.error(`[牌堆] 错误: 牌堆剩余卡牌不足. 请求: ${n}, 可用: ${this.cards.length}`);
      return [];
    }
    
    const drawnCards = this.cards.splice(0, n);
    return drawnCards.filter(card => card !== null && card !== undefined);
  }
  
  addToTop(card) {
    if (card === null || card === undefined) {
      console.error('[牌堆] 错误: 尝试添加空卡牌到牌堆顶部');
      return;
    }
    this.cards.unshift(card);
  }
  
  addToBottom(card) {
    if (card === null || card === undefined) {
      console.error('[牌堆] 错误: 尝试添加空卡牌到牌堆底部');
      return;
    }
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
    this.players = players.map(player => {
      console.log('[游戏核心] 初始化玩家数据:', player);
      return {
        ...player,
        selectedCountry: undefined,
        hand: {
          hero: [],
          heroNeutral: [],
          renhe: [],
          shishi: [],
          shenqi: []
        },
        geoTokens: GAME_CONSTANTS.INITIAL_GEO_TOKENS,
        tributeTokens: 0,
        isHost: false,
        isReady: false,
        isBot: Boolean(player.isBot)  // 确保 isBot 是布尔值
      };
    });

    console.log('[游戏核心] 初始化玩家:', this.players.map(p => ({
      id: p.id,
      name: p.name,
      isBot: p.isBot
    })));

    this.countries = {};
    this.decks = {
      tianshi: new Deck(),
      hero: {},  // 每个国家一个英杰牌堆
      heroNeutral: new Deck(),
      renhe: new Deck(),
      shishi: new Deck(),
      shenqi: new Deck(),
      xianji: new Deck(),
      yuanmou: new Deck(),
      tianshiDiscardPile: [] // 添加天时牌弃牌堆
    };
    this.market = [];
    this.activeTianshiCard = null;
    this.phase = 'initial_hero_selection';
    this.round = 1;
    this.currentPlayerIndex = 0;
    this.selectedCountries = new Set();
    this.jingnangMarket = []; // 锦囊市场中的卡牌
    this.currentHost = null; // 当前盟主

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
    this.initializeJingnangMarket(); // 初始化锦囊市场

    // 4. 随机分配国家给所有玩家
    this.assignCountriesToPlayers();

    // 5. 将各牌堆放置在地图对应位置
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
    console.log('[游戏核心] 初始化牌堆，玩家数量:', playerCount);

    try {
      // 初始化天时牌堆
      const tianshiDeck = getTianshiDeck(playerCount);
      console.log('[游戏核心] 获取天时牌堆:', tianshiDeck?.length || 0, '张牌');
      
      if (!tianshiDeck || tianshiDeck.length === 0) {
        console.error('[游戏核心] 错误: 天时牌堆初始化失败');
        this.decks.tianshi = new Deck([]);
      } else {
        // 确保每张牌都有正确的ID和类型
        const formattedTianshiCards = tianshiDeck.map((card, index) => ({
          ...card,
          id: card.id || `tianshi_${index + 1}`,
          type: 'tianshi'
        }));
        
        this.decks.tianshi = new Deck(formattedTianshiCards);
        this.decks.tianshi.shuffle();
        console.log('[游戏核心] 天时牌堆初始化完成，包含', this.decks.tianshi.size(), '张牌');
      }

      // 初始化人和牌堆
      const renheCards = createRenheCards();
      this.decks.renhe = new Deck(renheCards);
      this.decks.renhe.shuffle();
      console.log('[游戏核心] 人和牌堆初始化完成，包含', this.decks.renhe.size(), '张牌');

      // 初始化史实牌堆
      const shishiCards = createShishiCards();
      this.decks.shishi = new Deck(shishiCards);
      this.decks.shishi.shuffle();
      console.log('[游戏核心] 史实牌堆初始化完成，包含', this.decks.shishi.size(), '张牌');
      console.log('[游戏核心] 史实牌堆前5张:', JSON.stringify(this.decks.shishi.cards.slice(0, 5), null, 2));

      // 初始化神机牌堆
      const { cards: shenqiCards } = require('./data/shenqiCards');
      this.decks.shenqi = new Deck(shenqiCards);
      this.decks.shenqi.shuffle();
      console.log('[游戏核心] 神机牌堆初始化完成，包含', this.decks.shenqi.size(), '张牌');

      console.log('[游戏核心] 所有牌堆初始化完成');
    } catch (error) {
      console.error('[游戏核心] 初始化牌堆时发生错误:', error);
    }
  }

  // 设置盟主
  setHost(playerId) {
    // 清除所有玩家的盟主状态
    this.players.forEach(player => {
      player.isHost = false;
    });

    // 设置新的盟主
    const newHost = this.players.find(player => player.id === playerId);
    if (newHost) {
      newHost.isHost = true;
      this.currentHost = playerId;
      console.log(`[游戏] 玩家 ${newHost.name} 成为盟主`);
    }
  }

  // 进入第一回合时设置盟主
  startFirstRound() {
    // 找到第一个真实玩家（非机器人）作为盟主
    const firstRealPlayer = this.players.find(player => !player.isBot);
    if (firstRealPlayer) {
      this.setHost(firstRealPlayer.id);
      
      // 给其他玩家发放地利标记
      this.players.forEach(player => {
        if (player.id !== firstRealPlayer.id) {
          player.geoTokens += 1;
          console.log(`[游戏] 玩家 ${player.name} 获得1个地利标记`);
        }
      });
    }
  }

  // 检查是否所有玩家都选择了国家
  checkAllPlayersSelectedCountry() {
    return this.players.every(player => player.selectedCountry);
  }

  // 选择国家
  selectCountry(playerId, countryId) {
    // 验证玩家
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不存在');
    }

    // 验证玩家是否已经选择过国家
    if (player.selectedCountry) {
      throw new Error('玩家已经选择过国家');
    }

    // 验证国家是否存在
    if (!COUNTRY_LIST.includes(countryId)) {
      throw new Error('无效的国家选择');
    }

    // 验证国家是否已被选择
    if (this.selectedCountries.has(countryId)) {
      throw new Error('该国家已被其他玩家选择');
    }

    // 记录选择
    player.selectedCountry = countryId;
    this.selectedCountries.add(countryId);
    player.country = countryId;

    console.log(`[游戏] 玩家 ${player.name} 选择了 ${countryId}`);

    // 检查是否所有玩家都已选择国家
    const allPlayersSelected = this.players.every(p => p.selectedCountry);
    if (allPlayersSelected) {
      console.log('[游戏] 所有玩家已选择国家，进入初始英雄选择阶段');
      this.phase = 'initial_hero_selection';
      this.dealInitialCards(); // 发放初始卡牌
      this.dealInitialHeroCards();
    }

    return { success: true, allPlayersSelected };
  }

  // 从指定牌堆中抽取指定数量的牌
  drawCards(deck, count) {
    if (!deck || typeof deck.draw !== 'function') {
      console.error('Invalid deck:', deck);
      return [];
    }
    return deck.draw(count);
  }

  // 发放初始英雄牌
  dealInitialHeroCards() {
    console.log('[游戏核心] 开始发放初始英雄牌');
    
    this.players.forEach(player => {
      if (!player.selectedCountry) {
        console.error(`[游戏核心] 错误: 玩家 ${player.name} 未选择国家`);
        return;
      }

      console.log(`[游戏核心] 为玩家 ${player.name} 发放初始英雄牌，所选国家: ${player.selectedCountry}`);

      // 获取玩家所选国家的英雄牌堆
      const countryHeroDeck = this.decks.hero[player.selectedCountry];
      if (!countryHeroDeck || countryHeroDeck.isEmpty()) {
        console.log(`[游戏核心] 重新初始化 ${player.selectedCountry} 的英雄牌堆`);
        this.decks.hero[player.selectedCountry] = new Deck(getHeroDeckByCountry(player.selectedCountry));
        this.decks.hero[player.selectedCountry].shuffle();
      }

      // 从玩家所选国家的英雄牌堆中抽取4张牌
      const countryHeroCards = this.drawCards(this.decks.hero[player.selectedCountry], GAME_CONSTANTS.INITIAL_HERO_CARDS.DRAW);
      
      if (!countryHeroCards || countryHeroCards.length === 0) {
        console.error(`[游戏核心] 错误: 无法为玩家 ${player.name} 抽取英雄牌`);
        return;
      }

      // 确保每张牌都有正确的ID
      countryHeroCards.forEach((card, index) => {
        if (!card.id) {
          card.id = `${player.selectedCountry}_hero_${Date.now()}_${index}`;
        }
      });

      console.log(`[游戏核心] 玩家 ${player.name} (${player.selectedCountry}) 获得初始英雄牌:`, 
        countryHeroCards.map(card => ({id: card.id, name: card.name})));

      // 存储待选择的英雄牌
      player.tempHeroCards = countryHeroCards;
    });

    // 设置游戏阶段为初始英雄选择
    this.phase = 'initial_hero_selection';
    console.log('[游戏核心] 进入初始英雄选择阶段，当前玩家:', this.getCurrentPlayer()?.name);
  }

  // 选择初始英雄牌
  selectInitialHeroCards(playerId, selectedCardIds) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('玩家不存在');
    }

    if (!player.tempHeroCards || player.tempHeroCards.length === 0) {
      throw new Error('没有可选择的英雄牌');
    }

    if (selectedCardIds.length !== 2) {
      throw new Error('必须选择2张英雄牌');
    }

    // 验证选择的卡牌ID是否有效
    const validCardIds = player.tempHeroCards.map(card => card.id.toString());
    const invalidCardIds = selectedCardIds.filter(id => !validCardIds.includes(id.toString()));
    if (invalidCardIds.length > 0) {
      throw new Error(`无效的卡牌ID: ${invalidCardIds.join(', ')}`);
    }

    // 将选中的卡牌添加到玩家手牌
    const selectedCards = player.tempHeroCards.filter(card => 
      selectedCardIds.includes(card.id.toString())
    );
    
    console.log(`[游戏] 玩家 ${player.name} 选择了 ${selectedCards.length} 张初始英雄牌`);
    player.hand.hero.push(...selectedCards);

    // 清除临时英雄牌
    delete player.tempHeroCards;

    // 检查是否所有玩家都已选择完国家英雄牌
    const allPlayersSelected = this.players.every(p => !p.tempHeroCards);
    if (allPlayersSelected) {
      console.log('[游戏] 所有玩家已选择初始英雄牌，开始发放中立英雄牌');
      this.dealNeutralHeroCards();
    }

    return true;
  }

  // 发放中立英雄牌
  dealNeutralHeroCards() {
    // 确保中立英雄牌堆已经初始化
    if (!this.decks.heroNeutral || this.decks.heroNeutral.isEmpty()) {
      const neutralHeroDeck = getNeutralHeroDeck();
      console.log('[中立英雄] 初始化牌堆:', neutralHeroDeck);
      
      if (!neutralHeroDeck || neutralHeroDeck.length === 0) {
        console.error('[中立英雄] 错误: 牌堆为空!');
        return;
      }
      
      this.decks.heroNeutral = new Deck(neutralHeroDeck);
      this.decks.heroNeutral.shuffle();
    }

    // 为每个玩家发放1张中立英雄牌
    this.players.forEach(player => {
      if (!this.decks.heroNeutral || this.decks.heroNeutral.isEmpty()) {
        console.error(`[中立英雄] 错误: 没有足够的牌给玩家 ${player.name}`);
        return;
      }

      const drawnCards = this.drawCards(this.decks.heroNeutral, 1);
      const neutralCard = drawnCards[0];
      
      if (!neutralCard) {
        console.error(`[中立英雄] 错误: 抽取卡牌失败，玩家 ${player.name}`);
        return;
      }
      
      if (!player.hand.heroNeutral) {
        player.hand.heroNeutral = [];
      }
      
      player.hand.heroNeutral.push(neutralCard);
      console.log(`[中立英雄] 玩家 ${player.name} 获得卡牌:`, neutralCard);
    });
  }

  // 翻开并激活天时牌
  drawAndActivateTianshiCard() {
    if (this.decks.tianshi.isEmpty()) {
      // 如果天时牌堆为空，将弃牌堆洗回
      this.decks.tianshi = new Deck([...this.decks.tianshiDiscardPile]);
      this.decks.tianshiDiscardPile = [];
    }

    if (this.decks.tianshi.isEmpty()) {
      return null;
    }

    const card = this.decks.tianshi.cards.pop();
    // 设置激活的天时牌
    this.activeTianshiCard = card;
    console.log('[游戏核心] 激活天时牌:', card);
    return card;
  }

  // 结算天时牌效果
  resolveTianshiCard(card) {
    if (!card) return;

    // 获取天时牌效果
    const effect = this.getTianshiCardEffect(card);
    
    // 对每个国家应用效果
    Object.entries(this.countries).forEach(([countryId, country]) => {
      // 如果国家属性为1，不降低
      if (country[effect.attribute] > 1) {
        country[effect.attribute] = Math.max(1, country[effect.attribute] + effect.value);
      }
    });

    // 将天时牌移至弃牌堆
    this.decks.tianshiDiscardPile.push(card);
    console.log('[游戏核心] 天时牌效果结算完成，已移至弃牌堆');
  }

  // 获取天时牌效果
  getTianshiCardEffect(card) {
    // 根据卡牌ID获取效果
    const effects = {
      'tianshi_1': { attribute: 'military', value: -1 },
      'tianshi_2': { attribute: 'politics', value: -1 },
      'tianshi_3': { attribute: 'economy', value: -1 },
      // ... 其他天时牌效果
    };
    return effects[card.id] || { attribute: 'military', value: 0 };
  }

  // 移动周天子标记
  moveKingToken(countryId) {
    // 检查目标国家是否存在且未灭亡
    const targetCountry = this.countries[countryId];
    if (!targetCountry || this.isCountryDestroyed(countryId)) {
      return false;
    }

    // 移除当前周天子标记
    Object.values(this.countries).forEach(country => {
      country.hasKingToken = false;
    });

    // 放置周天子标记到目标国家
    targetCountry.hasKingToken = true;
    return true;
  }

  // 检查国家是否灭亡
  isCountryDestroyed(countryId) {
    const country = this.countries[countryId];
    return country.military <= 0 && country.politics <= 0 && country.economy <= 0;
  }

  // 检查玩家英杰牌目标是否达成
  checkHeroGoals() {
    // 暂时不实现具体逻辑
    console.log('[游戏核心] 检查英杰牌目标 - 暂未实现');
    return;
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
    //console.log('Getting tianshi deck:', this.decks.tianshi.cards);
    return this.decks.tianshi.cards;
  }

  // 获取可选择的国家列表
  getAvailableCountries() {
    return COUNTRY_LIST.filter(country => !this.selectedCountries.has(country));
  }

  // 初始化锦囊市场
  initializeJingnangMarket() {
    // 从未分配的史实牌中抽取7张卡牌
    const marketCards = this.decks.shishi.draw(GAME_CONSTANTS.JINGNANG_MARKET_SIZE);
    this.jingnangMarket = marketCards;
  }

  // 获取锦囊市场信息
  getJingnangMarket() {
    return this.jingnangMarket;
  }

  // 从锦囊市场购买卡牌
  buyFromJingnangMarket(playerId, cardId) {
    const player = this.players.find(p => p.id === playerId);
    const cardIndex = this.jingnangMarket.findIndex(card => card.id === cardId);
    
    if (!player || cardIndex === -1) {
      return false;
    }

    // 从市场移除卡牌并添加到玩家手牌
    const card = this.jingnangMarket.splice(cardIndex, 1)[0];
    player.addCard('shishi', card);

    // 补充市场
    if (this.decks.shishi.size() > 0) {
      const newCard = this.decks.shishi.draw(1)[0];
      this.jingnangMarket.push(newCard);
    }

    return true;
  }

  // 获取游戏状态
  getState() {
    const currentPlayer = this.getCurrentPlayer();
    
    // 格式化牌堆数量
    const formatDeckCount = (deck) => {
      if (!deck) return 0;
      if (typeof deck.size === 'function') {
        return deck.size();
      }
      if (typeof deck === 'object' && Object.keys(deck).length > 0) {
        // 如果是国家英雄牌堆的集合，返回所有牌堆的总和
        return Object.values(deck).reduce((sum, d) => sum + (d.size ? d.size() : 0), 0);
      }
      return 0;
    };

    // 获取牌堆数量
    const deckCounts = {
      tianshi: formatDeckCount(this.decks.tianshi),
      hero: formatDeckCount(this.decks.hero),
      heroNeutral: formatDeckCount(this.decks.heroNeutral),
      renhe: formatDeckCount(this.decks.renhe),
      shishi: formatDeckCount(this.decks.shishi),
      shenqi: formatDeckCount(this.decks.shenqi),
      xianji: formatDeckCount(this.decks.xianji),
      yuanmou: formatDeckCount(this.decks.yuanmou)
    };

    // 获取完整的英杰牌数据
    const getHeroDeckData = () => {
      const heroDecks = {};
      
      // 添加各国英杰牌堆
      COUNTRY_LIST.forEach(country => {
        const deck = this.decks.hero[country];
        if (deck) {
          heroDecks[country] = {
            cards: deck.cards.map(card => ({
              id: card.id,
              name: card.name,
              country: card.country,
              birthDeath: card.birthDeath,
              score: card.score,
              goal: card.goal,
              quote: card.quote,
              type: 'hero'
            })),
            count: deck.size()
          };
        }
      });

      // 添加无所属英杰牌堆
      if (this.decks.heroNeutral) {
        heroDecks['无'] = {
          cards: this.decks.heroNeutral.cards.map(card => ({
            id: card.id,
            name: card.name,
            country: card.country,
            birthDeath: card.birthDeath,
            score: card.score,
            goal: card.goal,
            quote: card.quote,
            type: 'hero'
          })),
          count: this.decks.heroNeutral.size()
        };
      }

      return heroDecks;
    };

    return {
      phase: this.phase,
      round: this.round,
      currentPlayerId: currentPlayer?.id,
      currentPlayer: currentPlayer ? {
        ...currentPlayer,
        tempHeroCards: currentPlayer.tempHeroCards
      } : null,
      players: this.players.map(player => ({
        ...player,
        hand: (player.isBot || player.id === currentPlayer?.id) ? player.hand : {
          hero: player.hand.hero.length,
          heroNeutral: player.hand.heroNeutral.length,
          renhe: player.hand.renhe.length,
          shishi: player.hand.shishi.length,
          shenqi: player.hand.shenqi.length
        }
      })),
      countries: this.countries,
      decks: {
        ...deckCounts,
        hero: getHeroDeckData() // 使用完整的英杰牌数据替换原来的数量
      },
      market: this.market,
      activeTianshiCard: this.activeTianshiCard,
      tianshiDeck: this.decks.tianshi.cards,
      initialCards: currentPlayer?.tempHeroCards,
      availableCountries: this.phase === 'country_selection' ? this.getAvailableCountries() : undefined,
      selectedCountries: Array.from(this.selectedCountries),
      jingnangMarket: this.jingnangMarket,
      currentHost: this.currentHost // 添加当前盟主信息
    };
  }

  // 发放初始卡牌
  dealInitialCards() {
    console.log('[游戏核心] 开始发放初始卡牌，玩家数量:', this.players.length);
    
    this.players.forEach(player => {
      console.log(`[游戏核心] 为玩家 ${player.name} (${player.isBot ? '机器人' : '人类'}) 发放初始卡牌`);
      
      // 发放初始人和牌
      const initialRenheCards = this.decks.renhe.draw(GAME_CONSTANTS.INITIAL_RENHE_CARDS);
      if (initialRenheCards.length > 0) {
        player.hand.renhe = initialRenheCards;
        console.log(`[游戏核心] 玩家 ${player.name} 获得 ${initialRenheCards.length} 张人和牌:`, 
          initialRenheCards.map(card => ({id: card.id, name: card.name})));
      } else {
        console.error(`[游戏核心] 错误: 无法为玩家 ${player.name} 发放初始人和牌`);
      }

      // 发放初始史实牌
      const initialShishiCards = this.decks.shishi.draw(GAME_CONSTANTS.INITIAL_SHISHI_CARDS);
      if (initialShishiCards.length > 0) {
        player.hand.shishi = initialShishiCards;
        console.log(`[游戏核心] 玩家 ${player.name} 获得 ${initialShishiCards.length} 张史实牌:`,
          initialShishiCards.map(card => ({id: card.id, name: card.name})));
      } else {
        console.error(`[游戏核心] 错误: 无法为玩家 ${player.name} 发放初始史实牌`);
        player.hand.shishi = [];
      }

      // 发放初始神机牌
      const initialShenqiCards = this.decks.shenqi.draw(GAME_CONSTANTS.INITIAL_SHENQI_CARDS);
      if (initialShenqiCards.length > 0) {
        player.hand.shenqi = initialShenqiCards;
        console.log(`[游戏核心] 玩家 ${player.name} 获得 ${initialShenqiCards.length} 张神机牌:`,
          initialShenqiCards.map(card => ({id: card.id, name: card.name})));
      } else {
        console.error(`[游戏核心] 错误: 无法为玩家 ${player.name} 发放初始神机牌`);
        player.hand.shenqi = [];
      }

      // 打印玩家当前的手牌信息
      console.log(`[游戏核心] 玩家 ${player.name} 当前手牌信息:`, {
        hero: player.hand.hero.length,
        heroNeutral: player.hand.heroNeutral.length,
        renhe: player.hand.renhe.length,
        shishi: player.hand.shishi.length,
        shenqi: player.hand.shenqi.length
      });
    });

    // 设置第一回合的盟主
    this.startFirstRound();
  }

  // 随机分配国家给所有玩家
  assignCountriesToPlayers() {
    console.log('[游戏核心] 开始随机分配国家');
    
    // 获取可用的国家列表
    const availableCountries = [...COUNTRY_LIST];
    
    // 洗牌算法
    for (let i = availableCountries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableCountries[i], availableCountries[j]] = [availableCountries[j], availableCountries[i]];
    }
    
    // 为每个玩家分配国家
    this.players.forEach((player, idx) => {
      if (idx >= availableCountries.length) {
        console.error(`[游戏核心] 错误: 玩家数量(${this.players.length})超过可用国家数量(${availableCountries.length})`);
        return;
      }
      
      const country = availableCountries[idx];
      player.selectedCountry = country;
      player.country = country;
      this.selectedCountries.add(country);
      
      console.log(`[游戏核心] 玩家 ${player.name} 随机选择了国家 ${country}`);
    });
    
    // 直接进入初始英杰选择阶段
    console.log('[游戏核心] 国家分配完成，进入初始英杰选择阶段');
    this.phase = 'initial_hero_selection';
    this.dealInitialCards();
    this.dealInitialHeroCards();
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