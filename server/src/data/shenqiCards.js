// 神机牌数据
const shenqiCards = Array(7).fill({
  id: 'SQ001',
  name: '神机',
  type: 'shenqi',
  description: '可用于：\n1.纵横：立即结束当前回合并开始新的回合，你成为新回合的盟主。跳过争雄阶段，保留所有持续效果。\n2.平乱：选择一个未灭亡的国家，该国所有属性变为5，获得2枚称霸标记。\n3.卜筮：查看天时牌堆顶3张并任意调整顺序，抽取2张手牌。本回合手牌上限+2，可以额外使用1张牌。',
  effect: {
    type: 'shenqi',
    usages: {
      zongheng: {
        effects: [
          'end_current_round',
          'start_new_round',
          'become_alliance_leader',
          'skip_zhengxiong_phase',
          'keep_lasting_effects'
        ]
      },
      pingluan: {
        requires: ['target_country'],
        effects: {
          set_all_stats: 5,
          gain_tokens: {
            type: 'domination',
            amount: 2
          }
        }
      },
      bushi: {
        effects: {
          view_and_arrange: {
            deck: 'tianshi',
            amount: 3
          },
          draw_cards: 2,
          bonus: {
            hand_limit: 2,
            extra_card_usage: 1
          }
        }
      }
    }
  }
}).map((card, index) => ({
  ...card,
  id: `SQ${String(index + 1).padStart(3, '0')}`  // 生成唯一ID：SQ001, SQ002, SQ003
}));

// 神机牌的通用规则
const shenqiRules = {
  usage_limit: {
    per_round: 1,
    total: 1
  },
  timing: {
    can_interrupt: true,
    priority: 'highest'
  },
  restrictions: [
    'cannot_be_cancelled',
    'remove_after_use',
    'cannot_be_copied',
    'cannot_be_reused'
  ]
};

module.exports = {
  cards: shenqiCards,
  rules: shenqiRules
}; 