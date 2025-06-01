import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card, message } from 'antd';
import { HeroCard } from '../types/cards';

interface InitialHeroSelectionProps {
  initialCards: HeroCard[];
  onCardsSelected: (selectedCards: string[]) => void;
}

const SelectionContainer = styled.div`
  text-align: center;
  padding: 20px;

  h2 {
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StyledCard = styled(Card)<{ $selected?: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  ${props => props.$selected && `
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76,175,80,0.2);
  `}

  .ant-card-meta-title {
    color: #333;
    font-size: 18px;
    margin-bottom: 12px;
  }

  .ant-card-meta-description {
    color: #666;
    
    p {
      margin-bottom: 8px;
      
      &:first-child {
        color: #1890ff;
        font-weight: 500;
      }
      
      &:nth-child(2) {
        color: #333;
      }
    }
  }
`;

const QuoteText = styled.div`
  font-style: italic;
  color: #888;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
`;

const ButtonContainer = styled.div`
  margin-top: 24px;
`;

export const InitialHeroSelection: React.FC<InitialHeroSelectionProps> = ({
  initialCards,
  onCardsSelected
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    console.log('InitialHeroSelection mounted with cards:', initialCards);
  }, []);

  useEffect(() => {
    console.log('InitialHeroSelection cards updated:', initialCards);
  }, [initialCards]);

  if (!Array.isArray(initialCards) || initialCards.length === 0) {
    return (
      <SelectionContainer>
        <h2>等待初始英杰牌</h2>
        <p>正在准备初始英杰牌，请稍候...</p>
      </SelectionContainer>
    );
  }

  const toggleCardSelection = (cardId: string | number) => {
    const stringId = String(cardId);
    setSelectedCards(prev => {
      if (prev.includes(stringId)) {
        return prev.filter(id => id !== stringId);
      } else {
        if (prev.length >= 2) {
          message.warning('只能选择2张英杰牌');
          return prev;
        }
        return [...prev, stringId];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedCards.length !== 2) {
      message.error('请选择2张英杰牌');
      return;
    }
    onCardsSelected(selectedCards);
  };

  return (
    <SelectionContainer>
      <h2>选择初始英杰牌</h2>
      <p>请从以下英杰牌中选择2张作为你的初始英杰</p>
      
      <CardGrid>
        {initialCards.map(card => {
          const stringId = String(card.id);
          return (
            <StyledCard
              key={stringId}
              $selected={selectedCards.includes(stringId)}
              onClick={() => toggleCardSelection(card.id)}
              hoverable
            >
              <Card.Meta
                title={`${card.name} (${card.country})`}
                description={
                  <>
                    <p>分数: {card.score}</p>
                    <p>目标: {card.goal}</p>
                    <p>{card.description}</p>
                    <QuoteText>{card.quote}</QuoteText>
                  </>
                }
              />
            </StyledCard>
          );
        })}
      </CardGrid>

      <ButtonContainer>
        <Button
          type="primary"
          size="large"
          onClick={handleConfirm}
          disabled={selectedCards.length !== 2}
        >
          确认选择 ({selectedCards.length}/2)
        </Button>
      </ButtonContainer>
    </SelectionContainer>
  );
};

export default InitialHeroSelection; 