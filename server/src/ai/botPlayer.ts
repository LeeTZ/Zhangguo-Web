import { CardType } from '../gamePhases';

interface HeroCard {
  id: string;
  name: string;
  country: string;
  score: number;
  goal: string;
  description: string;
}

interface GameAction {
  type: string;
  cardId?: string;
  count?: number;
  target?: string;
  country?: string;
  attribute?: string;
  attacker?: string;
  defender?: string;
}

interface GameState {
  phase: string;
  players: Array<{
    id: string;
    hand: {
      hero: HeroCard[];
      heroNeutral: HeroCard[];
      renhe: any[];
      shishi: any[];
      shenqi: any[];
    };
    geoTokens: number;
    tributeTokens: number;
  }>;
  countries: {
    [key: string]: {
      name: string;
      military: number;
      economy: number;
      politics: number;
      hasKingToken: boolean;
      hegemony: number;
    };
  };
}

export class BotPlayer {
  private id: string;
  private name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  // 选择初始英杰牌
  selectInitialHeroCards(tempHeroCards: HeroCard[]): string[] {
    // 计算每张牌的评分
    const cardScores = tempHeroCards.map(card => ({
      id: card.id,
      score: this.evaluateHeroCard(card)
    }));

    // 按评分排序
    cardScores.sort((a, b) => b.score - a.score);

    // 选择评分最高的2-3张牌
    const numCardsToKeep = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
    return cardScores.slice(0, numCardsToKeep).map(card => card.id);
  }

  // 评估英杰牌的价值
  private evaluateHeroCard(card: HeroCard): number {
    let score = 0;

    // 1. 基础分数
    score += card.score * 10; // 卡牌本身的分数权重最大

    // 2. 根据目标条件评分
    if (card.goal.includes('经济')) {
      score += 3; // 经济相关目标较容易达成
    }
    if (card.goal.includes('军事')) {
      score += 2; // 军事相关目标次之
    }
    if (card.goal.includes('政理')) {
      score += 2; // 政理相关目标也较常见
    }
    if (card.goal.includes('贡品')) {
      score += 1; // 贡品相关目标较难达成
    }

    // 3. 根据卡牌描述评分
    if (card.description.includes('增加')) {
      score += 2; // 增益效果
    }
    if (card.description.includes('获得')) {
      score += 2; // 获得资源
    }
    if (card.description.includes('防止') || card.description.includes('阻止')) {
      score += 1; // 防御效果
    }

    // 4. 根据所属国家评分
    switch (card.country) {
      case '魏':
        score += 3; // 魏国初始属性最高
        break;
      case '秦':
      case '赵':
        score += 2; // 秦赵军事较强
        break;
      case '齐':
      case '楚':
        score += 2; // 齐楚经济政理较强
        break;
      case '韩':
      case '燕':
        score += 1; // 韩燕相对较弱
        break;
    }

    // 5. 增加一些随机性，避免机器人选择过于固定
    score += Math.random() * 2;

    return score;
  }

  // 处理机器人的回合
  handleTurn(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    
    switch (gameState.phase) {
      case 'strategy':
        actions.push(...this.handleStrategyPhase(gameState));
        break;
      case 'planning':
        actions.push(...this.handlePlanningPhase(gameState));
        break;
      case 'action':
        actions.push(...this.handleActionPhase(gameState));
        break;
      case 'battle':
        actions.push(...this.handleBattlePhase(gameState));
        break;
      case 'tribute':
        actions.push(...this.handleTributePhase(gameState));
        break;
    }

    return actions;
  }

  // 处理权谋阶段
  private handleStrategyPhase(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const player = gameState.players.find(p => p.id === this.id);
    if (!player) return actions;
    
    // 1. 检查是否有可以明置的英杰牌
    const revealableHeroes = this.findRevealableHeroes(player.hand.hero);
    if (revealableHeroes.length > 0) {
      // 选择最适合当前局势的英杰牌明置
      const heroToReveal = this.selectBestHeroToReveal(revealableHeroes, gameState);
      actions.push({
        type: 'reveal_hero',
        cardId: heroToReveal.id
      });
    }

    return actions;
  }

  // 处理筹谋阶段
  private handlePlanningPhase(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const player = gameState.players.find(p => p.id === this.id);
    if (!player) return actions;

    // 1. 检查是否有可以使用的人和牌
    if (player.hand.renhe.length > 0) {
      const bestRenheCard = this.selectBestRenheCard(player.hand.renhe, gameState);
      if (bestRenheCard) {
        actions.push({
          type: 'play_card',
          cardId: bestRenheCard.id
        });
      }
    }

    return actions;
  }

  // 处理行动阶段
  private handleActionPhase(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const player = gameState.players.find(p => p.id === this.id);
    if (!player) return actions;
    
    let remainingActions = 6; // 初始行动点数

    // 1. 求贤（优先获取需要的卡牌）
    if (remainingActions >= 2) {
      actions.push({
        type: 'seek_talent',
        count: 1
      });
      remainingActions -= 2;
    }

    // 2. 行商（获取地利标记）
    if (remainingActions >= 2 && player.geoTokens < 3) {
      actions.push({
        type: 'trade',
        target: this.selectBestTradeTarget(gameState)
      });
      remainingActions -= 2;
    }

    // 3. 变法（提升国家属性）
    if (remainingActions >= 2) {
      const reformTarget = this.selectBestReformTarget(gameState);
      if (reformTarget) {
        actions.push({
          type: 'reform',
          country: reformTarget.country,
          attribute: reformTarget.attribute
        });
        remainingActions -= 2;
      }
    }

    return actions;
  }

  // 处理征伐阶段
  private handleBattlePhase(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    
    // 评估是否适合发动战争
    const battleTarget = this.evaluateBattleTarget(gameState);
    if (battleTarget) {
      actions.push({
        type: 'battle',
        attacker: battleTarget.attacker,
        defender: battleTarget.defender
      });
    }

    return actions;
  }

  // 处理朝贡阶段
  private handleTributePhase(gameState: GameState): GameAction[] {
    const actions: GameAction[] = [];
    const player = gameState.players.find(p => p.id === this.id);
    if (!player) return actions;

    // 如果有足够的贡品标记，考虑朝贡
    if (player.tributeTokens >= 2) {
      const tributeTarget = this.selectBestTributeTarget(gameState);
      if (tributeTarget) {
        actions.push({
          type: 'tribute',
          target: tributeTarget
        });
      }
    }

    return actions;
  }

  // 辅助方法：找出可以明置的英杰牌
  private findRevealableHeroes(heroes: HeroCard[]): HeroCard[] {
    return heroes.filter(hero => {
      // TODO: 实现具体的判断逻辑
      return true;
    });
  }

  // 辅助方法：选择最佳的明置英杰
  private selectBestHeroToReveal(heroes: HeroCard[], gameState: GameState): HeroCard {
    // TODO: 实现具体的选择逻辑
    return heroes[0];
  }

  // 辅助方法：选择最佳的人和牌
  private selectBestRenheCard(cards: any[], gameState: GameState): any {
    // TODO: 实现具体的选择逻辑
    return cards[0];
  }

  // 辅助方法：选择最佳的行商目标
  private selectBestTradeTarget(gameState: GameState): string {
    // TODO: 实现具体的选择逻辑
    return Object.keys(gameState.countries)[0];
  }

  // 辅助方法：选择最佳的变法目标
  private selectBestReformTarget(gameState: GameState): { country: string; attribute: string } | null {
    // TODO: 实现具体的选择逻辑
    return null;
  }

  // 辅助方法：评估战争目标
  private evaluateBattleTarget(gameState: GameState): { attacker: string; defender: string } | null {
    // TODO: 实现具体的评估逻辑
    return null;
  }

  // 辅助方法：选择最佳的朝贡目标
  private selectBestTributeTarget(gameState: GameState): string {
    // TODO: 实现具体的选择逻辑
    return Object.keys(gameState.countries)[0];
  }
} 