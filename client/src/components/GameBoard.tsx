import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';
import { GameState } from '../types/props';
import { TianshiArea } from './TianshiArea';
import { CountriesArea } from './CountriesArea';
import { PlayerInfo } from './PlayerInfo';
import { HeroCard, RenheCard, ShishiCard, ShenqiCard, CardType } from 'types/cards';
import HandCardList from 'components/HandCardList';
import { JingnangMarket } from './JingnangMarket';
import { HeroDeckArea } from './HeroDeckArea';
import { GameLog } from './GameLog';

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
  grid-template-columns: 520px 1fr 300px;
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

const LogArea = styled.div`
  grid-column: 3;
  height: 100vh;
  overflow: hidden;
`;

const PlayerInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;
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

interface GameLog {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface Player {
  id?: string;
  sessionId?: string;
  username: string;
  hand?: {
    hero: any[];
    heroNeutral: any[];
    renhe: any[];
    shishi: any[];
    shenqi: any[];
  };
  geoTokens?: number;
  tributeTokens?: number;
  isHost?: boolean;
  isBot?: boolean;
  selectedCountry?: string;
  country?: string;
}

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
  const [gameLogs, setGameLogs] = useState<GameLog[]>([
    {
      id: 'game_start',
      timestamp: Date.now(),
      type: 'info',
      message: '游戏开始'
    }
  ]);
  const currentPlayerId = gameState.currentPlayer?.id;
  const hasGeneratedPlayingLogsRef = useRef(false);
  const [previousPhase, setPreviousPhase] = useState<string>(gameState.phase);

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
      
      return {
        id: player.id || player.sessionId,
        name: player.username,
        selectedCountry: player.selectedCountry || player.country,
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
    });
  };

  // 格式化英杰牌堆数据
  const formatHeroDecks = () => {
    const decks: { [country: string]: { cards: HeroCard[]; count: number } } = {};
    const countries = ['齐', '楚', '燕', '韩', '赵', '魏', '秦'];
    
    if (gameState.decks.hero && typeof gameState.decks.hero === 'object') {
      if ('cards' in gameState.decks.hero) {
        return gameState.decks.hero;
      }
      
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
      countries.forEach(country => {
        decks[country] = {
          cards: [],
          count: 0
        };
      });
    }

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
    
    return decks;
  };

  // 使用useMemo缓存格式化后的玩家数据
  const formattedPlayers = useMemo(() => {
    return formatPlayers(gameState.players);
  }, [gameState.players]);

  // 使用useMemo缓存格式化后的英杰牌堆数据
  const formattedHeroDecks = useMemo(() => {
    return formatHeroDecks();
  }, [gameState.decks]);

  // 使用useCallback缓存处理卡牌点击的函数
  const handleCardClick = useCallback((playerName: string, cardId: string) => {
    console.log(`玩家 ${playerName} 点击了卡牌:`, cardId);
  }, []);

  // 监听游戏阶段变化
  useEffect(() => {
    // 如果阶段没有变化且已经生成了日志，直接返回
    if (gameState.phase === previousPhase && hasGeneratedPlayingLogsRef.current) {
      return;
    }

    if (gameState.phase === 'playing' && !hasGeneratedPlayingLogsRef.current) {
      // 在进入playing阶段时，生成所有玩家选择国家的日志
      const countrySelectionLogs: GameLog[] = gameState.players
        .filter(player => {
          const firstHero = player.hand?.hero?.[0];
          const country = firstHero?.country;
          return country;
        })
        .map(player => {
          const country = player.hand?.hero?.[0]?.country;
          return {
            id: `country_${player.id}_${Date.now()}`,
            timestamp: Date.now(),
            type: 'success' as const,
            message: `玩家 ${player.username} 选择了国家 ${country}`
          };
        });

      // 添加第一回合开始的日志
      const roundStartLog: GameLog = {
        id: `round_1_start_${Date.now()}`,
        timestamp: Date.now(),
        type: 'info',
        message: '第一回合开始'
      };

      // 添加盟主信息的日志
      const hostPlayer = gameState.players.find(player => player.isHost);
      const hostLog: GameLog | null = hostPlayer ? {
        id: `host_selection_${Date.now()}`,
        timestamp: Date.now(),
        type: 'success',
        message: `玩家 ${hostPlayer.username} 成为了盟主`
      } : null;

      // 一次性更新所有日志
      setGameLogs(prevLogs => {
        const newLogs = [...prevLogs, ...countrySelectionLogs, roundStartLog];
        if (hostLog) {
          newLogs.push(hostLog);
        }
        return newLogs;
      });

      // 设置标志，表示已经生成了playing阶段的日志
      hasGeneratedPlayingLogsRef.current = true;
    } else if (gameState.phase === 'initial_hero_selection') {
      setGameLogs(prevLogs => {
        return [...prevLogs, {
          id: `phase_${Date.now()}`,
          timestamp: Date.now(),
          type: 'info' as const,
          message: '进入初始英杰选择阶段'
        }];
      });
    }

    // 更新上一个阶段
    setPreviousPhase(gameState.phase);
  }, [gameState.phase, gameState.players]);

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
                isHost={player.isHost}
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
                onCardClick={(cardId) => handleCardClick(player.name, cardId)}
              />
            </CompactCard>
          </PlayerSection>
        ))}
      </PlayerArea>

      <MainArea>
        <Card>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1.5 }}>
              <TianshiArea 
                activeTianshiCard={gameState.activeTianshiCard}
                tianshiDeckCount={formatDeckCount(gameState.decks.tianshi)}
                tianshiDeck={gameState.tianshiDeck}
              />
            </div>
            <div style={{ flex: 1 }}>
              <HeroDeckArea
                heroDecks={formattedHeroDecks}
              />
            </div>
          </div>
          <JingnangMarket
            marketCards={gameState.jingnangMarket}
            onBuyCard={onBuyCard}
          />
          <CountriesArea countries={gameState.countries} />
          
          <div>回合: {gameState.round}</div>
        </Card>
      </MainArea>

      <LogArea>
        <GameLog logs={gameLogs} />
      </LogArea>
    </BoardContainer>
  );
}; 