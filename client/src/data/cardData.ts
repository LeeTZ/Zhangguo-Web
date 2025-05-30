// 英杰牌类型定义
export type HeroCardType = 'military' | 'political' | 'economic' | 'cultural';

export interface HeroCard {
  id: string;
  name: string;
  country: string;
  birthDeath: string;
  type: HeroCardType;
  score: number;
  goal: string;
  description: string;
  quote: string;
  effects?: {
    immediate?: string;
    continuous?: string;
    revealed?: string;
  };
}

// 国家枚举
export enum Country {
  QI = '齐国',
  CHU = '楚国',
  YAN = '燕国',
  HAN = '韩国',
  ZHAO = '赵国',
  WEI = '魏国',
  QIN = '秦国',
  NEUTRAL = '无所属'
}

// 类型定义
export type GetHeroDeckByCountry = (country: Country) => HeroCard[];
export type GetNeutralHeroDeck = () => HeroCard[]; 