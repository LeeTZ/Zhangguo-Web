import React from 'react';
import styled from 'styled-components';
import RenheCard from './RenheCard';
import ShishiCard from './ShishiCard';
import { RenheCard as RenheCardType, ShishiCard as ShishiCardType } from '../types/cards';

// 定义通用的卡牌类型，确保 id 是字符串
type BaseCard = {
  id: string;
  name: string;
  description?: string;
};

type RenheCardWithStringId = BaseCard & Omit<RenheCardType, 'id'>;
type ShishiCardWithStringId = BaseCard & Omit<ShishiCardType, 'id'>;

interface HandCardListProps {
  renheCards: RenheCardWithStringId[];
  shishiCards: ShishiCardWithStringId[];
  selectedCardIds: string[];
  onCardClick: (cardId: string) => void;
}

const Container = styled.div`
  margin: 8px 0;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const CardList = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 4px;
  padding: 4px;
  min-height: 80px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  margin: 4px 0;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 2px;
    
    &:hover {
      background: #bfbfbf;
    }
  }
`;

const EmptyText = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
`;

const HandCardList: React.FC<HandCardListProps> = ({
  renheCards,
  shishiCards,
  selectedCardIds,
  onCardClick
}) => {
  const hasCards = (renheCards?.length > 0 || shishiCards?.length > 0);

  if (!hasCards) {
    return (
      <Container>
        <Title>手牌</Title>
        <CardList>
          <EmptyText>暂无手牌</EmptyText>
        </CardList>
      </Container>
    );
  }

  return (
    <Container>
      <Title>手牌</Title>
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
      </CardList>
    </Container>
  );
};

export default HandCardList; 