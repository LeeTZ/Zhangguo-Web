import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameBoardProps } from '../types/props';
import { TianshiArea } from './TianshiArea';
import { CountriesArea } from './CountriesArea';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 20px;
  height: 100%;
`;

const PlayerArea = styled.div`
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DeckArea = styled.div`
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
`;

export const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  return (
    <BoardContainer>
      <PlayerArea>
        <Card title="玩家信息">
          {/* 玩家列表 */}
          {gameState.players.map((player: any) => (
            <div key={player.id}>
              <p>{player.name}</p>
              <p>手牌数: {player.handSize}</p>
              <p>地利标记: {player.geoTokens}</p>
              <p>贡品标记: {player.tributeTokens}</p>
            </div>
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