import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameBoardProps, Player, Hand } from 'types/props';
import { TianshiArea } from 'components/TianshiArea';
import { CountriesArea } from 'components/CountriesArea';
import { PlayerInfo } from 'components/PlayerInfo';
import { HeroCard, TianshiCard } from 'types/cards';

// 样式组件定义
const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 20px;
  padding: 20px;
  height: 100vh;
`;

const PlayerArea = styled.div`
  grid-column: 1;
`;

const MainArea = styled.div`
  grid-column: 2;
`;

const DeckArea = styled.div`
  grid-column: 3;
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
        geoTokens: player.geoTokens || 3,
        tributeTokens: player.tributeTokens || 0,
        heroCards: allHeroCards,
        isHost: player.isHost,
        isBot: isBot
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
        <Card title="玩家信息" variant="outlined">
          {formattedPlayers.map((player) => (
            <PlayerInfo
              key={player.id}
              name={player.name}
              handSize={player.handSize}
              geoTokens={player.geoTokens}
              tributeTokens={player.tributeTokens}
              heroCards={player.heroCards}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          ))}
        </Card>
      </PlayerArea>

      <MainArea>
        <Card title="游戏区域">
          {/* 天时牌区域 */}
          <TianshiArea 
            activeTianshiCard={gameState.activeTianshiCard}
            tianshiDeckCount={formatDeckCount(gameState.decks.tianshi)}
            tianshiDeck={gameState.tianshiDeck}
          />
          
          {/* 七国形势区域 */}
          <CountriesArea countries={gameState.countries} />
          
          {/* 回合信息 */}
          <div>回合: {gameState.round}</div>
        </Card>
      </MainArea>

      <DeckArea>
        <Card title="牌堆信息">
          {/* 牌堆信息 */}
          <p>天时牌堆: {formatDeckCount(gameState.decks.tianshi)}</p>
          <p>人和牌堆: {formatDeckCount(gameState.decks.renhe)}</p>
          <p>史实牌堆: {formatDeckCount(gameState.decks.shishi)}</p>
          <p>神机牌堆: {formatDeckCount(gameState.decks.shenqi)}</p>
          <p>先机牌堆: {formatDeckCount(gameState.decks.xianji)}</p>
          <p>远谋牌堆: {formatDeckCount(gameState.decks.yuanmou)}</p>
        </Card>
      </DeckArea>
    </BoardContainer>
  );
}; 