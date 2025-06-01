import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Card } from 'antd';
import { HeroCard } from '../types/cards';

interface HeroDeckAreaProps {
  heroDecks: {
    [country: string]: {
      cards: HeroCard[];
      count: number;
    };
  };
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

const DeckSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
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

const DeckContainer = styled.div<{ country: string }>`
  width: 80px;
  height: 110px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.country) {
      case '齐': return 'linear-gradient(145deg, #ffccc7, #fff1f0)';
      case '楚': return 'linear-gradient(145deg, #ffe58f, #fffbe6)';
      case '燕': return 'linear-gradient(145deg, #d9f7be, #f6ffed)';
      case '韩': return 'linear-gradient(145deg, #bae7ff, #e6f7ff)';
      case '赵': return 'linear-gradient(145deg, #efdbff, #f9f0ff)';
      case '魏': return 'linear-gradient(145deg, #ffd6e7, #fff0f6)';
      case '秦': return 'linear-gradient(145deg, #b5f5ec, #e6fffb)';
      case '无': return 'linear-gradient(145deg, #d9d9d9, #f5f5f5)';
      default: return 'linear-gradient(145deg, #d9d9d9, #f5f5f5)';
    }
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const CountryName = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #434343;
  margin-bottom: 4px;
`;

const CardCount = styled.div`
  font-size: 12px;
  color: #8c8c8c;
`;

const HeroCardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const HeroCardItem = styled(Card)`
  .ant-card-meta-title {
    color: #1890ff;
    font-size: 16px;
    margin-bottom: 8px;
  }

  .ant-card-meta-description {
    color: #666;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
`;

const CardItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    transform: translateY(-2px);
  }
`;

const CardName = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const NameText = styled.span`
  flex: 1;
`;

const ScoreText = styled.span`
  color: #666;
  font-size: 14px;
  margin-left: 8px;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
  line-height: 1.4;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: #1890ff;
    border-radius: 50%;
    margin-right: 6px;
  }
`;

const QuoteItem = styled(InfoItem)`
  font-style: italic;
  color: #888;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed #f0f0f0;

  &::before {
    background: #d9d9d9;
  }
`;

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
};

export const HeroDeckArea: React.FC<HeroDeckAreaProps> = ({ heroDecks }) => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleDeckClick = (country: string) => {
    setSelectedCountry(country);
  };

  const handleModalClose = () => {
    setSelectedCountry(null);
  };

  // 确保heroDecks是有效的对象
  if (!heroDecks || typeof heroDecks !== 'object') {
    return null;
  }

  return (
    <Container>
      <div style={{ flex: 1 }}>
        <DeckTitle>英杰牌堆</DeckTitle>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          {heroDecks && Object.entries(heroDecks).map(([country, deck]) => {
            if (!deck || typeof deck !== 'object' || !('cards' in deck) || !('count' in deck)) {
              return null;
            }
            return (
              <DeckContainer
                key={country}
                country={country}
                onClick={() => handleDeckClick(country)}
              >
                <CountryName>{country}</CountryName>
                <CardCount>{deck.count}</CardCount>
              </DeckContainer>
            );
          })}
        </div>
      </div>

      {selectedCountry && (
        <Modal
          open={!!selectedCountry}
          onCancel={() => setSelectedCountry(null)}
          footer={null}
          width={800}
          title={`${selectedCountry}英杰牌堆`}
        >
          <ModalContent>
            <CardList>
              {heroDecks[selectedCountry]?.cards?.map((card: HeroCard) => (
                <CardItem key={card.id}>
                  <CardName>
                    <NameText>{card.name}</NameText>
                    <ScoreText>{card.score}分</ScoreText>
                  </CardName>
                  <CardInfo>
                    <InfoItem>目标：{card.goal}</InfoItem>
                    {card.quote && <QuoteItem>{card.quote}</QuoteItem>}
                  </CardInfo>
                </CardItem>
              ))}
            </CardList>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}; 