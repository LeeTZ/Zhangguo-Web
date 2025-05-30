// 天时牌类型
export interface TianshiCard {
  id: string | number;
  name: string;
  effect: string;
}

// 英杰牌类型
export interface HeroCard {
  id: string | number;
  name: string;
  country?: string;
  effect: string;
}

// 人和牌类型
export interface RenheCard {
  id: string | number;
  name: string;
  effect: string;
}

// 史实牌类型
export interface ShishiCard {
  id: string | number;
  name: string;
  effect: string;
}

// 神机牌类型
export interface ShenqiCard {
  id: string | number;
  name: string;
  effect: string;
}

// 先机牌类型
export interface XianjiCard {
  id: string | number;
  name: string;
  effect: string;
}

// 远谋牌类型
export interface YuanmouCard {
  id: string | number;
  name: string;
  effect: string;
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