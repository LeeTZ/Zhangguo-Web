import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameBoardProps, Player, Hand } from 'types/props';
import { TianshiArea } from 'components/TianshiArea';
import { CountriesArea } from 'components/CountriesArea';
import { PlayerInfo } from 'components/PlayerInfo';
import { HeroCard, TianshiCard, RenheCard } from 'types/cards';
import RenheCardList from 'components/RenheCardList';

// 样式组件定义
const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 16px;
  padding: 24px;
  height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  width: 95%;
`;

const PlayerArea = styled.div`
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 100vh;
  overflow-y: auto;
  padding-right: 6px;

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

const PlayerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .ant-card {
    margin: 0;
    .ant-card-head {
      min-height: 32px;
      padding: 0 8px;
      .ant-card-head-title {
        padding: 4px 0;
        font-size: 13px;
      }
    }
    .ant-card-body {
      padding: 8px;
    }
  }

  /* 调整PlayerInfo组件在卡片中的样式 */
  .ant-card-body > div {
    margin: 4px 0;
  }

  /* 调整RenheCardList在卡片中的样式 */
  .ant-card:last-child .ant-card-body {
    padding-top: 4px;
    padding-bottom: 4px;
  }
`;

const MainArea = styled.div`
  grid-column: 2;
`;

// 格式化牌堆数量显示
const formatDeckCount = (deck: any): number => {
  if (typeof deck === 'number') {
    return deck;
  }
  if (deck && typeof deck === 'object') {
    if ('count' in deck) {
      return deck.count;
    }
    if ('cardList' in deck && Array.isArray(deck.cardList)) {
      return deck.cardList.length;
    }
  }
  return 0;
};

export const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const currentPlayerId = gameState.currentPlayer?.id;

  // 将服务器返回的玩家信息转换为组件需要的格式
  const formatPlayers = (players: Player[]) => {
    console.log('原始玩家数据:', JSON.stringify(players, null, 2));
    return players.map(player => {
      // 判断是否是机器人玩家（根据名字前缀）
      const isBot = player.username?.startsWith('Bot');
      
      // 获取玩家的手牌数据
      const playerHand = player.hand || {
        hero: [],
        heroNeutral: [],
        renhe: [],
        shishi: [],
        shenqi: []
      };

      console.log(`处理玩家 ${player.username} 的原始数据:`, JSON.stringify(player, null, 2));
      
      // 获取英雄卡
      const heroCards = playerHand.hero?.filter(card => card != null) || [];
      const heroNeutralCards = playerHand.heroNeutral?.filter(card => card != null) || [];
      
      // 计算实际的手牌数量
      const handSize = heroCards.length + heroNeutralCards.length;
      
      // 合并所有英雄牌
      const allHeroCards = [...heroCards, ...heroNeutralCards].filter(card => card != null);
      
      // 计算总得分
      const score = allHeroCards.reduce((total, hero) => total + (hero.score || 0), 0);
      
      const formattedPlayer = {
        id: player.id || player.sessionId,
        name: player.username,
        hand: {
          hero: heroCards,
          heroNeutral: heroNeutralCards,
          renhe: playerHand.renhe || [],
          shishi: playerHand.shishi || [],
          shenqi: playerHand.shenqi || []
        },
        handSize,
        renheCardCount: (playerHand.renhe || []).length,
        geoTokens: player.geoTokens || 3,
        tributeTokens: player.tributeTokens || 0,
        heroCards: allHeroCards,
        isHost: player.isHost,
        isBot: isBot,
        score: score
      };

      console.log(`玩家 ${player.username} 的格式化数据:`, JSON.stringify(formattedPlayer, null, 2));
      return formattedPlayer;
    });
  };

  const formattedPlayers = formatPlayers(gameState.players);
  console.log('最终格式化的玩家列表:', JSON.stringify(formattedPlayers, null, 2));

  return (
    <BoardContainer>
      <PlayerArea>
        {formattedPlayers.map((player) => (
          <PlayerSection key={player.id}>
            <Card>
              <PlayerInfo
                name={player.name}
                handSize={player.handSize}
                renheCardCount={player.renheCardCount}
                geoTokens={player.geoTokens}
                tributeTokens={player.tributeTokens}
                heroCards={player.heroCards}
                isCurrentPlayer={player.id === currentPlayerId}
                score={player.score}
              />
            </Card>
            
            <Card>
              <RenheCardList
                cards={player.hand.renhe as RenheCard[]}
                selectedCardIds={[]}
                onCardClick={(cardId) => {
                  console.log(`玩家 ${player.name} 点击了人和牌:`, cardId);
                }}
              />
            </Card>
          </PlayerSection>
        ))}
      </PlayerArea>

      <MainArea>
        <Card title="游戏区域">
          <TianshiArea 
            activeTianshiCard={gameState.activeTianshiCard}
            tianshiDeckCount={formatDeckCount(gameState.decks.tianshi)}
            tianshiDeck={gameState.tianshiDeck}
          />
          
          <CountriesArea countries={gameState.countries} />
          
          <div>回合: {gameState.round}</div>
        </Card>
      </MainArea>
    </BoardContainer>
  );
}; 