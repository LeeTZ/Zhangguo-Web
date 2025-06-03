import React, { useState, useEffect } from 'react';
import { TianshiCard } from '../types/cards';
import './TianshiArea.css';
import styled from 'styled-components';
import { Modal } from 'antd';

interface TianshiAreaProps {
  activeTianshiCard: TianshiCard | null;
  tianshiDeckCount: number;
  tianshiDeck?: TianshiCard[];
}

// 格式化效果文本
const formatEffect = (effect: string | { type: string; value: number } | undefined): string => {
  if (!effect) return '无效果';
  if (typeof effect === 'string') return effect;
  return `${effect.type}: ${effect.value}`;
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px;
  margin-bottom: 12px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.95));
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 90px;
`;

const DeckSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: center;
`;

const DeckTitle = styled.div`
  font-size: 14px;
  color: #595959;
  margin-bottom: 2px;
  font-weight: 500;
`;

const DeckCount = styled.div`
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
`;

const CardContainer = styled.div`
  width: 50px;
  height: 60px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff, #fafafa);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

  &:hover {
    border-color: #40a9ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const ActiveCardContainer = styled(CardContainer)`
  width: 100px;
  background: linear-gradient(145deg, #f0f7ff, #e6f7ff);
  border-color: #91d5ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.08);

  &:hover {
    border-color: #69c0ff;
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
  }
`;

const ActiveCardSection = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
  height: 100%;
  align-items: center;
`;

const ActiveCardTitle = styled.div`
  font-size: 14px;
  color: #595959;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ActiveCardContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const DescriptionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: #595959;
  font-size: 16px;
  line-height: 1.4;
  font-weight: 500;
`;

const CardEffect = styled.div`
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
`;

const DeckCardItem = styled.div`
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DeckCardIndex = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const DeckCardName = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const DeckCardEffect = styled.div`
  font-size: 12px;
  color: #666;
`;

export const TianshiArea: React.FC<TianshiAreaProps> = ({
  activeTianshiCard,
  tianshiDeckCount,
  tianshiDeck = []
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <Container>
        <DeckSection>
          <DeckTitle>天时牌堆</DeckTitle>
          <CardContainer onClick={() => setIsModalVisible(true)}>
            <DeckCount>{tianshiDeckCount}</DeckCount>
          </CardContainer>
        </DeckSection>

        <ActiveCardSection>
          <div style={{ flex: 1 }}>
            <ActiveCardTitle>当前天时：</ActiveCardTitle>
            <ActiveCardContent>
              {activeTianshiCard ? (
                <>
                  <ActiveCardContainer>
                    {activeTianshiCard.name}
                  </ActiveCardContainer>
                  <DescriptionContainer>
                    <CardDescription>{activeTianshiCard.description}</CardDescription>
                    {activeTianshiCard.effect && (
                      <CardEffect>
                        {formatEffect(activeTianshiCard.effect)}
                      </CardEffect>
                    )}
                  </DescriptionContainer>
                </>
              ) : (
                <div style={{ color: '#999' }}>无</div>
              )}
            </ActiveCardContent>
          </div>
        </ActiveCardSection>
      </Container>

      <Modal
        title="天时牌堆详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {tianshiDeck.length > 0 ? (
          tianshiDeck.map((card, index) => (
            <DeckCardItem key={card.id}>
              <DeckCardIndex>#{index + 1}</DeckCardIndex>
              <DeckCardName>{card.name}</DeckCardName>
              <DeckCardEffect>{formatEffect(card.effect)}</DeckCardEffect>
            </DeckCardItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            牌堆中没有天时牌
          </div>
        )}
      </Modal>
    </>
  );
}; 
