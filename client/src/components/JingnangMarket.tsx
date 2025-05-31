import React from 'react';
import styled from 'styled-components';
import { ShishiCard } from '../types/cards';

interface JingnangMarketProps {
  marketCards: ShishiCard[];
  onBuyCard?: (cardId: string | number) => void;
}

const Container = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.95));
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const MarketTitle = styled.div`
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
  font-weight: 500;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  padding: 4px;
`;

const CardContainer = styled.div`
  width: 80px;
  height: 110px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f6ffed, #e6ffed);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  padding: 6px;

  &:hover {
    border-color: #52c41a;
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
    transform: translateY(-2px);
  }
`;

const CardName = styled.div`
  font-size: 12px;
  color: #595959;
  font-weight: 500;
  text-align: center;
  margin-bottom: 6px;
`;

const CardDescription = styled.div`
  font-size: 10px;
  color: #8c8c8c;
  text-align: center;
  line-height: 1.3;
`;

export const JingnangMarket: React.FC<JingnangMarketProps> = ({
  marketCards = [],
  onBuyCard
}) => {
  return (
    <Container>
      <div style={{ flex: 1 }}>
        <MarketTitle>锦囊市场</MarketTitle>
        <CardsContainer>
          {marketCards.map((card) => (
            <CardContainer
              key={card.id}
              onClick={() => onBuyCard?.(card.id)}
            >
              <CardName>{card.name}</CardName>
              <CardDescription>{card.description}</CardDescription>
            </CardContainer>
          ))}
        </CardsContainer>
      </div>
    </Container>
  );
}; 