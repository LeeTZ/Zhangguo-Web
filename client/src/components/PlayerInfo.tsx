import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Badge, Tooltip, Modal, Button } from 'antd';
import { HeroCard } from '../types/cards';

interface PlayerInfoProps {
  name: string;
  handSize: number;
  geoTokens: number;
  tributeTokens: number;
  heroCards: HeroCard[];
  isCurrentPlayer?: boolean;
}

interface StyledCardProps {
  isCurrentPlayer?: boolean;
}

const StyledCard = styled(Card)<StyledCardProps>`
  margin-bottom: 12px;
  border: ${props => props.isCurrentPlayer ? '2px solid #1890ff' : '1px solid #d9d9d9'};
  background: ${props => props.isCurrentPlayer ? '#e6f7ff' : '#fff'};
  
  .ant-card-body {
    padding: 12px;
  }
`;

const PlayerName = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1890ff;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
`;

const TokenIcon = styled.span<{ type: 'geo' | 'tribute' }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => props.type === 'geo' ? '#52c41a' : '#722ed1'};
  color: white;
`;

const HeroCardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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
      default: return '#d9d9d9';
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

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  name,
  handSize,
  geoTokens,
  tributeTokens,
  heroCards,
  isCurrentPlayer = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <StyledCard size="small" isCurrentPlayer={isCurrentPlayer}>
        <PlayerName>{name}</PlayerName>
        <InfoGrid>
          <InfoItem>
            <span>手牌:</span>
            <Badge count={handSize} style={{ backgroundColor: '#1890ff' }} />
          </InfoItem>
          <InfoItem>
            <span>地利:</span>
            <TokenIcon type="geo">{geoTokens}</TokenIcon>
          </InfoItem>
          <InfoItem>
            <span>贡品:</span>
            <TokenIcon type="tribute">{tributeTokens}</TokenIcon>
          </InfoItem>
          {heroCards.length > 0 && (
            <InfoItem>
              <Button type="link" onClick={showModal} style={{ padding: 0 }}>
                查看英杰牌
              </Button>
            </InfoItem>
          )}
        </InfoGrid>
        <HeroCardList>
          {heroCards.map((hero, index) => (
            <Tooltip key={hero.id || index} title={hero.effect}>
              <HeroCardTag country={hero.country}>
                {hero.name}
              </HeroCardTag>
            </Tooltip>
          ))}
        </HeroCardList>
      </StyledCard>

      <Modal
        title={`${name}的英杰牌`}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        footer={[
          <Button key="close" type="primary" onClick={handleOk}>
            关闭
          </Button>
        ]}
      >
        {heroCards.map((hero) => (
          <HeroDetailCard key={hero.id}>
            <HeroTitle>{hero.name}</HeroTitle>
            <HeroInfo>
              <span>国家: {hero.country || '无所属'}</span>
              <span>得分: {hero.score}</span>
              {hero.birthDeath && <span>生卒: {hero.birthDeath}</span>}
            </HeroInfo>
            <div>目标: {hero.goal}</div>
            <HeroDescription>{hero.description}</HeroDescription>
            {hero.quote && <HeroQuote>{hero.quote}</HeroQuote>}
          </HeroDetailCard>
        ))}
      </Modal>
    </>
  );
}; 