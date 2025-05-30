import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameBoardProps, Player, Hand } from 'types/props';
import { TianshiArea } from 'components/TianshiArea';
import { CountriesArea } from 'components/CountriesArea';
import { PlayerInfo } from 'components/PlayerInfo';
import { HeroCard } from 'types/cards';

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

export const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const currentPlayerId = gameState.currentPlayer?.id;

  console.log('Complete gameState:', gameState);
  console.log('Current player:', gameState.currentPlayer);
  console.log('All players in gameState:', gameState.players);

  // 将服务器返回的玩家信息转换为组件需要的格式
  const formatPlayers = (players: Player[]) => {
    console.log('Players to format:', players);
    return players.map(player => {
      // 判断是否是机器人玩家（根据名字前缀）
      const isBot = player.username?.startsWith('Bot');
      console.log('Processing player:', player.username, 'isBot:', isBot);

      // 查找完整的玩家信息（包含手牌）
      let fullPlayerInfo = null;
      
      // 如果是当前玩家，直接使用 gameState.currentPlayer
      if (player.sessionId === gameState.currentPlayer?.id || 
          player.id === gameState.currentPlayer?.id) {
        fullPlayerInfo = gameState.currentPlayer;
        console.log('Using current player info:', fullPlayerInfo);
      } 
      // 在所有玩家中查找
      else {
        // 首先在 gameState.players 中查找
        fullPlayerInfo = gameState.players.find((p: Player) => {
          // 对于机器人玩家，使用username匹配
          if (isBot) {
            const matched = p.username === player.username;
            if (matched) {
              console.log('Found bot player in players array:', p);
              console.log('Bot hand:', p.hand);
            }
            return matched;
          }
          
          // 对于普通玩家，使用id/sessionId匹配
          const matched = p.id === player.id || 
                         p.sessionId === player.sessionId || 
                         p.id === player.sessionId || 
                         p.sessionId === player.id;
          
          if (matched) {
            console.log('Found player in players array:', p);
            console.log('Player hand:', p.hand);
          }
          return matched;
        });

        // 如果是机器人且没有找到完整信息，使用默认值
        if (isBot && (!fullPlayerInfo || !fullPlayerInfo.hand)) {
          console.log('Creating default bot info for:', player.username);
          
          fullPlayerInfo = {
            ...player,
            hand: {
              hero: [],
              heroNeutral: [],
              renhe: [],
              shishi: [],
              shenqi: []
            },
            geoTokens: 3,
            tributeTokens: 0
          };
          console.log('Created default bot info:', fullPlayerInfo);
        }
      }

      console.log('Full player info for', player.username, ':', fullPlayerInfo);
      
      // 获取英雄卡
      const heroCards = fullPlayerInfo?.hand?.hero || [];
      const heroNeutralCards = fullPlayerInfo?.hand?.heroNeutral || [];
      const handSize = (heroCards.length + heroNeutralCards.length) || 0;
      
      // 合并所有英雄牌
      const allHeroCards = [...heroCards, ...heroNeutralCards];
      
      // 使用原始玩家数据和完整玩家信息的组合
      const formattedPlayer = {
        id: player.id || player.sessionId,
        name: player.username,
        hand: fullPlayerInfo?.hand || {
          hero: [],
          heroNeutral: [],
          renhe: [],
          shishi: [],
          shenqi: []
        },
        handSize,
        geoTokens: fullPlayerInfo?.geoTokens || 3,
        tributeTokens: fullPlayerInfo?.tributeTokens || 0,
        heroCards: allHeroCards,
        isHost: player.isHost,
        isReady: player.ready,
        isBot: isBot
      };

      console.log('Formatted player:', formattedPlayer);
      return formattedPlayer;
    });
  };

  const formattedPlayers = formatPlayers(gameState.players);

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
            tianshiDeckCount={gameState.decks.tianshi}
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
          <p>天时牌堆: {gameState.decks.tianshi}</p>
          <p>人和牌堆: {gameState.decks.renhe}</p>
          <p>史实牌堆: {gameState.decks.shishi}</p>
          <p>神机牌堆: {gameState.decks.shenqi}</p>
          <p>先机牌堆: {gameState.decks.xianji}</p>
          <p>远谋牌堆: {gameState.decks.yuanmou}</p>
        </Card>
      </DeckArea>
    </BoardContainer>
  );
}; 