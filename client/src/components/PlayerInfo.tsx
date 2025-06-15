import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Badge, Tooltip, Modal, Button } from 'antd';
import { HeroCard } from '../types/cards';
import { CrownOutlined, RobotOutlined } from '@ant-design/icons';

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
  isHost?: boolean;
  isBot?: boolean;
  selectedCountry?: string;
  country?: string;
}

interface StyledCardProps {
  $isCurrentPlayer?: boolean;
}

const PlayerContainer = styled.div<{ $isCurrentPlayer: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${props => props.$isCurrentPlayer ? 'linear-gradient(to right, #e6f7ff, #f0f7ff)' : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.95))'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${props => props.$isCurrentPlayer ? '#91d5ff' : 'transparent'};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
  flex-wrap: wrap;
`;

const PlayerNameSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: space-between;
`;

const PlayerName = styled.div`
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlayerStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
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
  gap: 4px;
  margin-top: 0;
  height: 24px;
  overflow: hidden;
  justify-content: space-between;
`;

const HeroCardList = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  padding: 0 2px;
  margin-right: 4px;

  &::-webkit-scrollbar {
    height: 2px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
  }
`;

const HeroCardTag = styled.span<{ country: string }>`
  display: inline-block;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  margin-right: 2px;
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
  color: #434343;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }
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

const HostTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d48806;
`;

const BotTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #666;
`;

const CountryTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
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
  isHost,
  isBot,
  selectedCountry,
  country
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const totalHandCards = renheCardCount + shishiCardCount + shenqiCardCount;

  return (
    <PlayerContainer $isCurrentPlayer={isCurrentPlayer}>
      <InfoRow>
        <PlayerNameSection>
          <PlayerName>
            {name}
            {isHost && (
              <HostTag>
                <CrownOutlined />
                盟主
              </HostTag>
            )}
            {isBot && (
              <BotTag>
                <RobotOutlined />
                机器人
              </BotTag>
            )}
          </PlayerName>
          <PlayerStats>
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
          </PlayerStats>
        </PlayerNameSection>
      </InfoRow>
      
      <HeroSection>
        <HeroCardList>
          {heroCards.map((hero, index) => (
            <HeroCardTag key={`${hero.id}-${index}`} country={hero.country}>{hero.name}</HeroCardTag>
          ))}
        </HeroCardList>
        {heroCards.length > 0 && (
          <Button 
            type="link" 
            onClick={() => setIsModalVisible(true)} 
            style={{ padding: '0 4px', height: 'auto', fontSize: '13px' }}
          >
            英杰详情
          </Button>
        )}
      </HeroSection>

      <Modal
        title="英杰详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {heroCards.map((hero, index) => (
          <HeroDetailCard key={`modal-${hero.id}-${index}`}>
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
    </PlayerContainer>
  );
}; 