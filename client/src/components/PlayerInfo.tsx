import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Badge, Tooltip, Modal, Button } from 'antd';
import { HeroCard } from '../types/cards';

interface PlayerInfoProps {
  name: string;
  handSize: number;
  renheCardCount: number;
  shishiCardCount: number;
  shenqiCardCount: number;
  geoTokens: number;
  tributeTokens: number;
  heroCards: HeroCard[];
  isCurrentPlayer?: boolean;
  score?: number;
}

interface StyledCardProps {
  isCurrentPlayer?: boolean;
}

const StyledCard = styled(Card)<StyledCardProps>`
  margin-bottom: 12px;
  border: ${props => props.isCurrentPlayer ? '2px solid #1890ff' : '1px solid #d9d9d9'};
  background: ${props => props.isCurrentPlayer ? '#e6f7ff' : '#fff'};
  
  .ant-card-body {
    padding: 8px;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const PlayerNameSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #000000;
  font-weight: bold;
  flex: 1;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  white-space: nowrap;
`;

const TokenIcon = styled.span<{ type: 'geo' | 'tribute' }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => props.type === 'geo' ? '#52c41a' : '#722ed1'};
  color: white;
`;

const HeroSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

const HeroCardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
`;

const HeroCardTag = styled.div<{ country?: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  background: ${props => {
    switch (props.country) {
      case '齐': return '#ff7875';
      case '楚': return '#ffc069';
      case '燕': return '#95de64';
      case '韩': return '#69c0ff';
      case '赵': return '#b37feb';
      case '魏': return '#ff85c0';
      case '秦': return '#40a9ff';
      default: return '#8c8c8c';
    }
  }};
  color: white;
`;

const HeroDetailCard = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;

  &:last-child {
    margin-bottom: 0;
  }
`;

const HeroTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1890ff;
`;

const HeroInfo = styled.div`
  margin-bottom: 8px;
  
  > span {
    margin-right: 16px;
    color: #666;
  }
`;

const HeroDescription = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
`;

const HeroQuote = styled.div`
  margin-top: 8px;
  font-style: italic;
  color: #666;
  font-size: 14px;
`;

const ScoreIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #f5222d;
  color: white;
`;

const HandCardIcon = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #666;
  
  > span {
    background: #1890ff;
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  > span.renhe {
    background: #fa8c16;
  }
`;

const RenheCardIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #fa8c16;
  color: white;
`;

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  name,
  handSize,
  renheCardCount,
  shishiCardCount,
  shenqiCardCount,
  geoTokens,
  tributeTokens,
  heroCards,
  isCurrentPlayer = false,
  score = 0,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const totalHandCards = renheCardCount + shishiCardCount + shenqiCardCount;

  return (
    <>
      <StyledCard size="small" isCurrentPlayer={isCurrentPlayer}>
        <InfoRow>
          <PlayerNameSection>
            {name}
            <InfoItem>
              <span>得分</span>
              <ScoreIcon>{score}</ScoreIcon>
            </InfoItem>
            <InfoItem>
              <span>手牌</span>
              <HandCardIcon>
                <span>{totalHandCards}</span>
              </HandCardIcon>
            </InfoItem>
            <InfoItem>
              <span>地利</span>
              <TokenIcon type="geo">{geoTokens}</TokenIcon>
            </InfoItem>
            <InfoItem>
              <span>贡品</span>
              <TokenIcon type="tribute">{tributeTokens}</TokenIcon>
            </InfoItem>
          </PlayerNameSection>
        </InfoRow>
        
        <HeroSection>
          {heroCards.length > 0 && (
            <Button 
              type="link" 
              onClick={() => setIsModalVisible(true)} 
              style={{ padding: '0 4px', height: 'auto', fontSize: '13px' }}
            >
              英杰详情
            </Button>
          )}
          <HeroCardList>
            {heroCards.map((hero, index) => (
              <HeroCardTag country={hero.country}>{hero.name}</HeroCardTag>
            ))}
          </HeroCardList>
        </HeroSection>
      </StyledCard>

      <Modal
        title="英杰详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {heroCards.map((hero, index) => (
          <HeroDetailCard key={index}>
            <HeroTitle>{hero.name}</HeroTitle>
            <HeroInfo>
              <span>国家: {hero.country || '无所属'}</span>
              <span>生卒年: {hero.birthDeath}</span>
              <span>分数: {hero.score}</span>
            </HeroInfo>
            <HeroDescription>{hero.description}</HeroDescription>
            {hero.quote && <HeroQuote>"{hero.quote}"</HeroQuote>}
          </HeroDetailCard>
        ))}
      </Modal>
    </>
  );
}; 