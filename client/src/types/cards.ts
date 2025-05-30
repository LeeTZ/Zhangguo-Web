// 基础卡牌类型
export interface BaseCard {
  id: string | number;
  name: string;
  type: string;
  description?: string;
  effect?: string | { type: string; value: number };
}

// 天时牌类型
export interface TianshiCard extends BaseCard {
  type: 'tianshi';
}

// 英杰牌类型
export interface HeroCard extends BaseCard {
  type: 'hero' | 'heroNeutral';
  country: string;
  birthDeath: string;
  score: number;
  goal: string;
  quote: string;
}

// 人和牌类型
export interface RenheCard extends BaseCard {
  type: 'renhe';
  cardType?: 'junlue' | 'mimou' | 'neizheng' | 'waijiao';
  description: string;
  effect: {
    type: string;
    value: number;
  };
}

// 史实牌类型
export interface ShishiCard extends BaseCard {
  type: 'shishi';
  countries: string[];
  story?: string;
}

// 神机牌类型
export interface ShenqiCard extends BaseCard {
  type: 'shenqi';
}

// 先机牌类型
export interface XianjiCard extends BaseCard {
  type: 'xianji';
}

// 远谋牌类型
export interface YuanmouCard extends BaseCard {
  type: 'yuanmou';
}

// 卡牌类型联合
export type CardType = 
  | TianshiCard 
  | HeroCard 
  | RenheCard 
  | ShishiCard 
  | ShenqiCard 
  | XianjiCard 
  | YuanmouCard; 