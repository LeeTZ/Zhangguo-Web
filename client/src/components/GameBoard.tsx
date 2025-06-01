import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameState, Player } from '../types/props';
import { TianshiArea } from './TianshiArea';
import { CountriesArea } from './CountriesArea';
import { PlayerInfo } from './PlayerInfo';
import { HeroCard, RenheCard, ShishiCard, ShenqiCard, CardType } from 'types/cards';
import HandCardList from 'components/HandCardList';
import { JingnangMarket } from './JingnangMarket';
import { HeroDeckArea } from './HeroDeckArea';

// 自定义紧凑型 Card 样式
const CompactCard = styled(Card)`
  .ant-card-body {
    padding: 8px;
  }
  .ant-card-head {
    padding: 0 8px;
    min-height: 36px;
  }
  .ant-card-head-title {
    padding: 8px 0;
  }
`;

// 样式组件定义
const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 600px 1fr;
  gap: 24px;
  padding: 32px;
  height: 100vh;
  max-width: 2800px;
  margin: 0 auto;
  width: 100%;
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
  margin-bottom: 16px;
  
  .ant-card {
    margin-bottom: 8px;
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

interface GameBoardProps {
  gameState: GameState;
  onSelectCountry?: (countryId: string) => void;
  onSelectInitialHeroCards?: (cardIds: string[]) => void;
  onBuyCard?: (cardId: string | number) => void;
}

const renderHandCards = (cards: CardType[], type: string) => {
  return cards.map((card) => ({
    id: card.id,
    name: card.name,
    description: card.description || '',
    type: type
  }));
};

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onSelectCountry,
  onSelectInitialHeroCards,
  onBuyCard
}) => {
  const currentPlayerId = gameState.currentPlayer?.id;

  // 将服务器返回的玩家信息转换为组件需要的格式
  const formatPlayers = (players: Player[]) => {
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
        shishiCardCount: (playerHand.shishi || []).length,
        shenqiCardCount: (playerHand.shenqi || []).length,
        geoTokens: player.geoTokens || 0,
        tributeTokens: player.tributeTokens || 0,
        heroCards: allHeroCards,
        isHost: player.isHost,
        isBot: isBot,
        score: score
      };

      return formattedPlayer;
    });
  };

  const formattedPlayers = formatPlayers(gameState.players);

  // 格式化英杰牌堆数据
  const formatHeroDecks = () => {
    console.log('原始hero数据:', gameState.decks.hero);
    
    const decks: { [country: string]: { cards: HeroCard[]; count: number } } = {};
    const countries = ['齐', '楚', '燕', '韩', '赵', '魏', '秦'];
    
    // 检查gameState.decks.hero的类型
    if (gameState.decks.hero && typeof gameState.decks.hero === 'object') {
      // 如果已经是正确的格式，直接返回
      if ('cards' in gameState.decks.hero) {
        console.log('使用新格式数据');
        return gameState.decks.hero;
      }
      
      // 如果是旧格式，转换为新格式
      console.log('转换为新格式');
      countries.forEach(country => {
        const deck = (gameState.decks.hero as any)[country];
        if (deck && typeof deck === 'object' && 'cards' in deck && 'count' in deck) {
          decks[country] = {
            cards: deck.cards || [],
            count: typeof deck.count === 'number' ? deck.count : 0
          };
        } else {
          decks[country] = {
            cards: [],
            count: typeof deck === 'number' ? deck : 0
          };
        }
      });
    } else {
      console.log('使用默认格式');
      // 使用默认格式
      countries.forEach(country => {
        decks[country] = {
          cards: [],
          count: 0
        };
      });
    }

    // 添加无所属国家的英杰牌堆
    const neutralDeck = gameState.decks.heroNeutral;
    if (neutralDeck && typeof neutralDeck === 'object' && 'cards' in neutralDeck && 'count' in neutralDeck) {
      decks['无'] = {
        cards: (neutralDeck as { cards: HeroCard[] }).cards || [],
        count: (neutralDeck as { count: number }).count || 0
      };
    } else {
      decks['无'] = {
        cards: [],
        count: typeof neutralDeck === 'number' ? neutralDeck : 0
      };
    }
    
    console.log('格式化后的数据:', decks);
    return decks;
  };

  const formattedHeroDecks = formatHeroDecks();
  console.log('传递给HeroDeckArea的数据:', formattedHeroDecks);

  return (
    <BoardContainer>
      <PlayerArea>
        {formattedPlayers.map((player) => (
          <PlayerSection key={player.id}>            
            <CompactCard>
              <PlayerInfo
                name={player.name}
                handSize={player.handSize}
                renheCardCount={player.renheCardCount}
                shishiCardCount={player.shishiCardCount}
                shenqiCardCount={player.shenqiCardCount}
                geoTokens={player.geoTokens}
                tributeTokens={player.tributeTokens}
                heroCards={player.heroCards}
                isCurrentPlayer={player.id === currentPlayerId}
                score={player.score}
              />
              <HandCardList
                renheCards={player.hand.renhe
                  .filter((card): card is RenheCard => card.type === 'renhe')
                  .map(card => ({
                    ...card,
                    id: String(card.id)
                  }))}
                shishiCards={player.hand.shishi
                  .filter((card): card is ShishiCard => card.type === 'shishi')
                  .map(card => ({
                    ...card,
                    id: String(card.id)
                  }))}
                shenqiCards={player.hand.shenqi
                  .filter((card): card is ShenqiCard => card.type === 'shenqi')
                  .map(card => ({
                    ...card,
                    id: String(card.id)
                  }))}
                selectedCardIds={[]}
                onCardClick={(cardId) => {
                  console.log(`玩家 ${player.name} 点击了卡牌:`, cardId);
                }}
              />
            </CompactCard>
          </PlayerSection>
        ))}
      </PlayerArea>

      <MainArea>
        <Card>
          <TianshiArea 
            activeTianshiCard={gameState.activeTianshiCard}
            tianshiDeckCount={formatDeckCount(gameState.decks.tianshi)}
            tianshiDeck={gameState.tianshiDeck}
          />
          <JingnangMarket
            marketCards={gameState.jingnangMarket}
            onBuyCard={onBuyCard}
          />
          <HeroDeckArea
            heroDecks={formattedHeroDecks}
          />
          <CountriesArea countries={gameState.countries} />
          
          <div>回合: {gameState.round}</div>
        </Card>
      </MainArea>
    </BoardContainer>
  );
}; 