import { TianshiCard as BaseTianshiCard } from '../types/cards';

export interface TianshiCard extends BaseTianshiCard {
  id: string;
  name: string;
  type: 'tianshi';
  effect: string;
  description: string;
}

export const tianshiCards: TianshiCard[] = [
  {
    id: "1",
    name: "各据一方",
    type: "tianshi",
    effect: "本回合'周天子'失去效果。",
    description: ""
  },
  {
    id: "2",
    name: "开诚布公",
    type: "tianshi",
    effect: "所有手中有暗置英杰牌的玩家选择一张并展示。本回合权谋阶段，玩家出牌改为面朝上打出。",
    description: ""
  },
  {
    id: "3",
    name: "一字千金",
    type: "tianshi",
    effect: "本回合权谋阶段，仅进行第一轮出牌结算。盟主获得3枚地利标记。",
    description: ""
  },
  {
    id: "4",
    name: "按甲休兵",
    type: "tianshi",
    effect: "本回合所有战争全部跳过结算。",
    description: ""
  },
  {
    id: "5",
    name: "穷兵黩武",
    type: "tianshi",
    effect: "所有的国家若经济高于军事，则进行一次征兵。本回合所有的战争中，援兵视为+2战力，战胜方将获得额外1枚称霸标记。",
    description: ""
  },
  {
    id: "6",
    name: "各有千秋",
    type: "tianshi",
    effect: "本回合权谋阶段，先机区域和远谋区域的所有奖励均替换为先机、远谋牌。",
    description: ""
  },
  {
    id: "7",
    name: "偷天换日",
    type: "tianshi",
    effect: "盟主从未使用的天时牌中随机抽取2张，然后选择1张生效。",
    description: ""
  },
  {
    id: "8",
    name: "诸侯问政 / 闭关绝市 / 民心不壹",
    type: "tianshi",
    effect: "由盟主掷一枚骰子。结果决定本回合所有国家军事/经济/政理无法增加。",
    description: ""
  },
  {
    id: "9",
    name: "英雄辈出",
    type: "tianshi",
    effect: "由盟主决定方向，每个玩家选择一个英杰牌堆，摸2张英杰牌，保留1张，另1张放回牌堆底。",
    description: ""
  },
  {
    id: "10",
    name: "按部就班",
    type: "tianshi",
    effect: "本回合无法打出神机牌。玩家可以在筹谋阶段弃置自己的神机牌，获得3点行动力。",
    description: ""
  },
  {
    id: "11",
    name: "万象更新",
    type: "tianshi",
    effect: "所有玩家弃置手中任意数量的人和牌或史实牌，之后从人和牌堆重新抓取等量的人和牌。盟主额外抓1张。",
    description: ""
  },
  {
    id: "12",
    name: "流年不利",
    type: "tianshi",
    effect: "由盟主决定方向，每个玩家选择：弃置2张手牌，或弃置2枚地利标记，或弃置2枚贡品标记。",
    description: ""
  },
  {
    id: "13",
    name: "推心置腹",
    type: "tianshi",
    effect: "由盟主决定方向，每个玩家选择3张手牌传给左手/右手边玩家。",
    description: ""
  },
  {
    id: "14",
    name: "塞外春回 / 天子南巡",
    type: "tianshi",
    effect: "由盟主掷一枚骰子。结果为1~3：秦，楚以外国家政理+1；结果为4~6：燕，赵以外国家政理+1。",
    description: ""
  },
  {
    id: "15",
    name: "饥馑之年 / 物阜民丰",
    type: "tianshi",
    effect: "由盟主掷一枚骰子。结果为1~3：所有国家经济-1； 结果为4~6：所有国家经济+1。",
    description: ""
  },
  {
    id: "16",
    name: "铸剑为犁 / 遣将征兵",
    type: "tianshi",
    effect: "由盟主掷一枚骰子。结果为1~3：所有国家军事-1； 结果为4~6：所有国家军事+1。",
    description: ""
  },
  {
    id: "17",
    name: "坑儒焚典 / 百家争鸣",
    type: "tianshi",
    effect: "由盟主掷一枚骰子。结果为1~3：所有国家政理-1； 结果为4~6：所有国家政理+1。",
    description: ""
  },
  {
    id: "18",
    name: "天时清平",
    type: "tianshi",
    effect: "盟主摸2张人和牌；本回合筹谋阶段所有玩家行动力+2。",
    description: ""
  },
  {
    id: "19",
    name: "地尽其利",
    type: "tianshi",
    effect: "盟主获得2枚地利标记；本回合筹谋阶段，玩家的1点行动力可以换取2枚地利标记。",
    description: ""
  },
  {
    id: "20",
    name: "政通人和",
    type: "tianshi",
    effect: "所有玩家摸1张人和牌。本回合内政牌增加的经济和政理额外+1。",
    description: ""
  },
  {
    id: "21",
    name: "称臣纳贡",
    type: "tianshi",
    effect: "本回合争雄开始前，每个玩家可以选择将至多3枚地利标记换为贡品标记。",
    description: ""
  },
  {
    id: "22",
    name: "奉天承运",
    type: "tianshi",
    effect: "本回合争雄阶段，每个玩家掷骰子三枚，以点数最高者决定下回合盟主。",
    description: ""
  },
  {
    id: "23",
    name: "蚕食鲸吞",
    type: "tianshi",
    effect: "将'周天子'移出游戏。国力最高/次高的国家与国力最低/次低的国家分别进行战争。如果有并列，盟主选择国家。",
    description: ""
  },
  {
    id: "24",
    name: "共襄义举",
    type: "tianshi",
    effect: "所有手中有暗置英杰牌的玩家选择一张并展示。被展示英杰最多的两个国家经济+2。如果有并列，由诸侯盟主决定。",
    description: ""
  }
]; 