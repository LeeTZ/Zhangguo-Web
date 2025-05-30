import React from 'react';
import styled from 'styled-components';
import RenheCard from './RenheCard';

interface RenheCardListProps {
  cards: Array<{
    id: string;
    name: string;
    type: string;
    cardType: string;
    description: string;
    effect: {
      type: string;
      value: number;
    };
  }>;
  selectedCardIds?: string[];
  onCardClick?: (cardId: string) => void;
}

const CardListContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 4px;
  padding: 8px;
  min-height: 80px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
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
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
`;

const RenheCardList: React.FC<RenheCardListProps> = ({
  cards,
  selectedCardIds = [],
  onCardClick
}) => {
  if (!cards || cards.length === 0) {
    return (
      <CardListContainer>
        <EmptyText>暂无人和牌</EmptyText>
      </CardListContainer>
    );
  }

  return (
    <CardListContainer>
      {cards.map(card => (
        <RenheCard
          key={card.id}
          card={card}
          isSelected={selectedCardIds.includes(card.id)}
          onClick={() => onCardClick?.(card.id)}
        />
      ))}
    </CardListContainer>
  );
};

export default RenheCardList; 