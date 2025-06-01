import React from 'react';
import styled from 'styled-components';
import RenheCard from './RenheCard';
import ShishiCard from './ShishiCard';
import ShenqiCard from './ShenqiCard';
import { RenheCard as RenheCardType, ShishiCard as ShishiCardType, ShenqiCard as ShenqiCardType } from '../types/cards';

// 定义通用的卡牌类型，确保 id 是字符串
type BaseCard = {
  id: string;
  name: string;
  description?: string;
};

type RenheCardWithStringId = BaseCard & Omit<RenheCardType, 'id'>;
type ShishiCardWithStringId = BaseCard & Omit<ShishiCardType, 'id'>;
type ShenqiCardWithStringId = BaseCard & Omit<ShenqiCardType, 'id'>;

interface HandCardListProps {
  renheCards: RenheCardWithStringId[];
  shishiCards: ShishiCardWithStringId[];
  shenqiCards: ShenqiCardWithStringId[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
}

const Container = styled.div`
  margin: 0;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 2px;
  min-height: 35px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 2px;
  margin: 0;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 2px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 1px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 1px;
    
    &:hover {
      background: #bfbfbf;
    }
  }

  /* 修改卡牌样式 */
  > div {
    height: 50%;
    > div {
      height: 50%;
      > div {
        height: 50%;
      }
    }
  }
`;

const EmptyText = styled.div`
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
`;

const CardWrapper = styled.div`
  height: 50%;
  display: flex;
  align-items: center;
`;

const HandCardList: React.FC<HandCardListProps> = ({
  renheCards,
  shishiCards,
  shenqiCards,
  selectedCardIds,
  onCardClick
}) => {
  const hasCards = (renheCards?.length > 0 || shishiCards?.length > 0 || shenqiCards?.length > 0);

  if (!hasCards) {
    return (
      <Container>
        <CardList>
          <EmptyText>暂无手牌</EmptyText>
        </CardList>
      </Container>
    );
  }

  return (
    <Container>
      <CardList>
        {renheCards?.map((card) => (
          <RenheCard
            key={card.id}
            card={card}
            isSelected={selectedCardIds.includes(card.id)}
            onClick={() => onCardClick(card.id)}
          />
        ))}
        {shishiCards?.map((card) => (
          <ShishiCard
            key={card.id}
            card={card}
            isSelected={selectedCardIds.includes(card.id)}
            onClick={() => onCardClick(card.id)}
          />
        ))}
        {shenqiCards?.map((card) => (
          <ShenqiCard
            key={card.id}
            card={card}
            isSelected={selectedCardIds.includes(card.id)}
            onClick={() => onCardClick(card.id)}
          />
        ))}
      </CardList>
    </Container>
  );
};

export default HandCardList; 