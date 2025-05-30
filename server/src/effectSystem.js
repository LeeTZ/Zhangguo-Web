// 效果处理系统

const { CardType, CountryAttribute } = require('./gamePhases');

class EffectSystem {
  constructor(gameCore) {
    this.gameCore = gameCore;
  }

  // 处理属性变化效果
  handleAttributeEffect(effect, player) {
    const { target, changes } = effect;
    const country = target === 'self' ? player.country : target;
    
    if (this.gameCore.countries[country]) {
      Object.entries(changes).forEach(([attr, value]) => {
        this.gameCore.countries[country][attr] = 
          Math.max(0, Math.min(12, this.gameCore.countries[country][attr] + value));
      });
    }
  }

  // 处理战斗效果
  handleBattleEffect(effect) {
    const { participants, outcome } = effect;
    const [country1, country2] = participants;
    
    const military1 = this.gameCore.countries[country1].military;
    const military2 = this.gameCore.countries[country2].military;
    
    const winner = military1 > military2 ? country1 : country2;
    const loser = winner === country1 ? country2 : country1;
    
    this.applyOutcome(winner, outcome.winner);
    this.applyOutcome(loser, outcome.loser);
  }

  // 处理外交效果
  handleDiplomacyEffect(effect, player) {
    const { effect: diplomacyType, duration } = effect;
    // TODO: 实现外交效果处理逻辑
  }

  // 处理即时效果
  handleInstantEffect(effect, player) {
    const { effect: effectType, value } = effect;
    switch (effectType) {
      case 'military_boost':
        if (player.country) {
          this.gameCore.countries[player.country].military = 
            Math.min(12, this.gameCore.countries[player.country].military + value);
        }
        break;
      // 添加更多即时效果类型处理...
    }
  }

  // 检查效果条件是否满足
  checkConditions(conditions, player) {
    if (!conditions) return true;
    
    if (conditions.required_military) {
      for (const [country, value] of Object.entries(conditions.required_military)) {
        if (this.gameCore.countries[country].military < value) {
          return false;
        }
      }
    }
    
    if (conditions.military_disadvantage) {
      if (!player.country) return false;
      const playerMilitary = this.gameCore.countries[player.country].military;
      const maxEnemyMilitary = Math.max(
        ...Object.values(this.gameCore.countries)
          .filter(c => c.name !== player.country)
          .map(c => c.military)
      );
      if (maxEnemyMilitary - playerMilitary < conditions.military_disadvantage) {
        return false;
      }
    }
    
    return true;
  }

  // 应用效果结果
  applyOutcome(country, changes) {
    Object.entries(changes).forEach(([attr, value]) => {
      this.gameCore.countries[country][attr] = 
        Math.max(0, Math.min(12, this.gameCore.countries[country][attr] + value));
    });
  }

  // 主要效果处理入口
  processEffect(effect, player) {
    if (!this.checkConditions(effect.conditions, player)) {
      return false;
    }

    switch (effect.type) {
      case 'attribute':
        this.handleAttributeEffect(effect, player);
        break;
      case 'battle':
        this.handleBattleEffect(effect);
        break;
      case 'diplomacy':
        this.handleDiplomacyEffect(effect, player);
        break;
      case 'instant':
        this.handleInstantEffect(effect, player);
        break;
      // 添加更多效果类型处理...
    }

    return true;
  }

  // 处理卡牌效果
  handleCardEffect(card, player, targets) {
    switch (card.type) {
      case CardType.HERO:
        return this.handleHeroEffect(card, player, targets);
      case CardType.HISTORY:
        return this.handleHistoryEffect(card, player, targets);
      case CardType.HEAVEN:
        return this.handleHeavenEffect(card, player, targets);
      case CardType.FIRST_MOVE:
        return this.handleFirstMoveEffect(card, player, targets);
      case CardType.STRATEGY:
        return this.handleStrategyEffect(card, player, targets);
      default:
        return false;
    }
  }

  // 处理英杰牌效果
  handleHeroEffect(hero, player, targets) {
    // 检查目标是否合法
    if (!this.validateTargets(hero, targets)) {
      return false;
    }

    // 根据英杰类型执行效果
    switch (hero.effect.type) {
      case 'attribute_boost':
        return this.handleAttributeBoost(hero, targets);
      case 'military_action':
        return this.handleMilitaryAction(hero, targets);
      case 'political_action':
        return this.handlePoliticalAction(hero, targets);
      case 'economic_action':
        return this.handleEconomicAction(hero, targets);
      case 'special_ability':
        return this.handleSpecialAbility(hero, player, targets);
      default:
        return false;
    }
  }

  // 处理史实牌效果
  handleHistoryEffect(card, player, targets) {
    // 检查目标是否合法
    if (!this.validateTargets(card, targets)) {
      return false;
    }

    // 执行史实牌效果
    const { effect } = card;
    switch (effect.type) {
      case 'battle':
        return this.executeBattle(effect, targets);
      case 'reform':
        return this.executeReform(effect, targets);
      case 'diplomacy':
        return this.executeDiplomacy(effect, targets);
      case 'trade':
        return this.executeTrade(effect, targets);
      default:
        return false;
    }
  }

  // 处理天时牌效果
  handleHeavenEffect(card, player, targets) {
    // 天时牌效果实现
    const { effect } = card;
    return this.executeHeavenEffect(effect, player, targets);
  }

  // 处理先机牌效果
  handleFirstMoveEffect(card, player, targets) {
    // 先机牌效果实现
    const { effect } = card;
    return this.executeFirstMoveEffect(effect, player, targets);
  }

  // 处理远谋牌效果
  handleStrategyEffect(card, player, targets) {
    // 远谋牌效果实现
    const { effect } = card;
    return this.executeStrategyEffect(effect, player, targets);
  }

  // 验证目标是否合法
  validateTargets(card, targets) {
    if (!card.targetRequirements) {
      return true;
    }

    const { targetRequirements } = card;
    
    // 检查目标数量
    if (targetRequirements.count) {
      if (targets.length !== targetRequirements.count) {
        return false;
      }
    }

    // 检查目标类型
    if (targetRequirements.type) {
      return targets.every(target => {
        switch (targetRequirements.type) {
          case 'country':
            return this.gameCore.countries[target] !== undefined;
          case 'player':
            return this.gameCore.players.find(p => p.id === target) !== undefined;
          case 'hero':
            return this.isValidHeroTarget(target);
          default:
            return false;
        }
      });
    }

    return true;
  }

  // 执行属性提升效果
  handleAttributeBoost(hero, targets) {
    const target = this.gameCore.countries[targets[0]];
    if (!target) return false;

    const { attribute, value } = hero.effect;
    return target.addAttribute(attribute, value);
  }

  // 执行军事行动
  handleMilitaryAction(hero, targets) {
    // 实现军事行动逻辑
    return this.executeMilitaryAction(hero.effect, targets);
  }

  // 执行政治行动
  handlePoliticalAction(hero, targets) {
    // 实现政治行动逻辑
    return this.executePoliticalAction(hero.effect, targets);
  }

  // 执行经济行动
  handleEconomicAction(hero, targets) {
    // 实现经济行动逻辑
    return this.executeEconomicAction(hero.effect, targets);
  }

  // 执行特殊能力
  handleSpecialAbility(hero, player, targets) {
    // 实现特殊能力逻辑
    return this.executeSpecialAbility(hero.effect, player, targets);
  }

  // 执行战斗
  executeBattle(effect, targets) {
    const [attacker, defender] = targets.map(t => this.gameCore.countries[t]);
    if (!attacker || !defender) return false;

    // 计算战斗结果
    const attackerStrength = attacker.military + effect.bonus;
    const defenderStrength = defender.military;

    if (attackerStrength > defenderStrength) {
      // 攻击方胜利
      defender.reduceAttribute('military', effect.damage);
      return true;
    }
    return false;
  }

  // 执行变法
  executeReform(effect, targets) {
    const country = this.gameCore.countries[targets[0]];
    if (!country) return false;

    // 执行变法效果
    return country.addAttribute('politics', effect.value);
  }

  // 执行外交
  executeDiplomacy(effect, targets) {
    const [country1, country2] = targets.map(t => this.gameCore.countries[t]);
    if (!country1 || !country2) return false;

    // 执行外交效果
    return this.executeDiplomaticAction(effect, country1, country2);
  }

  // 执行行商
  executeTrade(effect, targets) {
    const country = this.gameCore.countries[targets[0]];
    if (!country) return false;

    // 执行行商效果
    return country.addAttribute('economy', effect.value);
  }
}

module.exports = EffectSystem; 