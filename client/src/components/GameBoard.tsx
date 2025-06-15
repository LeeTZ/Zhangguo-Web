import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Button, Tooltip } from 'antd';
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
import { gameActions } from '../socket';
import { updateGameState } from '../store/gameSlice';
import { useDispatch } from 'react-redux';

// 自定义紧凑型 Card 样式
const CompactCard = styled(Card)`
  .ant-card-body {
    padding: 4px;
  }
  .ant-card-head {
    padding: 0 4px;
    min-height: 24px;
  }
  .ant-card-head-title {
    padding: 4px 0;
  }
`;

// 样式组件定义
const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr) 300px;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 80px);
  max-width: 1750px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
`;

const PlayerArea = styled.div`
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 16px;
  
  /* 在小屏幕下增加底部边距 */
  @media (max-height: 768px) {
    padding-bottom: 32px;
  }

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
  margin-bottom: 4px;
  
  .ant-card {
    margin-bottom: 0;
  }

  /* 确保最后一个 PlayerSection 有足够的底部边距 */
  &:last-child {
    margin-bottom: 16px;
  }
`;

const MainArea = styled.div`
  grid-column: 2;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 16px;
  
  @media (max-height: 768px) {
    padding-bottom: 32px;
  }

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

const LogArea = styled.div`
  grid-column: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 300px; // 限制最大高度
`;

const GameLogContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
  max-height: 300px; // 限制最大高度
  
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

  /* 确保新消息出现时自动滚动到底部 */
  > div {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
`;

const ActionArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 8px 32px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  height: 80px;
  display: flex;
  align-items: center;
`;

const ActionContent = styled.div`
  max-width: 1750px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr; // 三列布局：左侧文字、中间按钮、右侧空白
  align-items: center;
  gap: 24px;
  width: 100%;
  height: 100%;
`;

const ActionInfo = styled.div`
  color: #666;
  text-align: left;
  min-width: 0; // 防止文字溢出
  
  h3 {
    font-size: 16px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    font-size: 14px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center; // 按钮居中对齐
  flex-shrink: 0;
  
  .ant-btn {
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
    min-width: 80px;
  }
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
  name?: string;
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
  tempHeroCards?: any[];
}

interface GameBoardProps {
  gameState: GameState;
  onSelectCountry?: (countryId: string) => void;
  onSelectInitialHeroCards?: (cardIds: string[]) => void;
  onBuyCard?: (cardId: string | number) => void;
  onDrawTianshiCard?: () => void;
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
  onBuyCard,
  onDrawTianshiCard
}) => {
  const [gameLogs, setGameLogs] = useState<GameLog[]>([
    {
      id: 'game_start',
      timestamp: Date.now(),
      type: 'info',
      message: '游戏开始'
    }
  ]);
  const [selectedCountryForKing, setSelectedCountryForKing] = useState<string | null>(null);
  const [showKingMoveDialog, setShowKingMoveDialog] = useState(false);
  const currentPlayerId = gameState.currentPlayer?.id;
  const hasGeneratedPlayingLogsRef = useRef(false);
  const [previousPhase, setPreviousPhase] = useState<string>(gameState.phase);
  const dispatch = useDispatch();

  // 将服务器返回的玩家信息转换为组件需要的格式
  const formatPlayers = (players: Player[]) => {
    return players.map(player => {
      // 判断是否是机器人玩家（根据名字前缀）
      const isBot = player.name?.startsWith('Bot') || player.username?.startsWith('Bot');
      
      // 获取玩家的手牌数据
      const playerHand = player.hand || {
        hero: [],
        heroNeutral: [],
        renhe: [],
        shishi: [],
        shenqi: []
      };
      
      // 确保 hero 和 heroNeutral 是数组
      const heroCards = Array.isArray(playerHand.hero) ? playerHand.hero.filter(card => card != null) : [];
      const heroNeutralCards = Array.isArray(playerHand.heroNeutral) ? playerHand.heroNeutral.filter(card => card != null) : [];
      
      // 计算实际的手牌数量
      const handSize = heroCards.length + heroNeutralCards.length;
      
      // 合并所有英雄牌
      const allHeroCards = [...heroCards, ...heroNeutralCards].filter(card => card != null);
      
      // 计算总得分
      const score = allHeroCards.reduce((total, hero) => total + (hero.score || 0), 0);
      
      return {
        id: player.id || player.sessionId,
        name: player.name || player.username,
        selectedCountry: player.selectedCountry || player.country,
        country: player.country,
        hand: {
          hero: heroCards,
          heroNeutral: heroNeutralCards,
          renhe: Array.isArray(playerHand.renhe) ? playerHand.renhe : [],
          shishi: Array.isArray(playerHand.shishi) ? playerHand.shishi : [],
          shenqi: Array.isArray(playerHand.shenqi) ? playerHand.shenqi : []
        },
        handSize,
        renheCardCount: Array.isArray(playerHand.renhe) ? playerHand.renhe.length : 0,
        shishiCardCount: Array.isArray(playerHand.shishi) ? playerHand.shishi.length : 0,
        shenqiCardCount: Array.isArray(playerHand.shenqi) ? playerHand.shenqi.length : 0,
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
        cards: (neutralDeck as { cards: HeroCard[]; count: number }).cards || [],
        count: (neutralDeck as { cards: HeroCard[]; count: number }).count || 0
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
            message: `玩家 ${player.username} 随机选择了国家 ${country}`
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

      // 添加地利标记发放的日志
      const geoTokensLogs: GameLog[] = gameState.players
        .filter(player => !player.isHost)
        .map(player => ({
          id: `geotoken_${player.id}_${Date.now()}`,
          timestamp: Date.now(),
          type: 'success' as const,
          message: `玩家 ${player.username} 获得1个地利标记`
        }));

      // 一次性更新所有日志
      setGameLogs(prevLogs => {
        const newLogs = [...prevLogs, ...countrySelectionLogs, roundStartLog, ...geoTokensLogs];
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

  // 监听天时牌事件
  useEffect(() => {
    const handleTianshiCardDrawn = (data: { card: any; playerId: string }) => {
      const player = gameState.players.find(p => p.id === data.playerId);
      if (player) {
        setGameLogs(prevLogs => [
          ...prevLogs,
          {
            id: `tianshi_${Date.now()}`,
            timestamp: Date.now(),
            type: 'info',
            message: `盟主 ${player.username} 翻开了天时牌「${data.card.name}」`
          }
        ]);
      }
    };

    // 添加移动周天子事件监听
    const handleKingTokenMoved = (data: { playerId: string; countryId: string }) => {
      const player = gameState.players.find(p => p.id === data.playerId);
      // 只有当找到玩家且玩家有用户名时才添加日志
      if (player && player.username) {
        // 更新游戏日志
        setGameLogs(prevLogs => {
          // 检查是否已经存在相同的日志
          const isDuplicate = prevLogs.some(log => 
            log.type === 'success' && 
            log.message.includes('将周天子移动到') && 
            log.message.includes(data.countryId)
          );
          
          if (isDuplicate) {
            return prevLogs;
          }
          
          return [...prevLogs, {
            id: `king_token_${Date.now()}`,
            timestamp: Date.now(),
            type: 'success',
            message: `盟主 ${player.username} 将周天子移动到 ${data.countryId}`
          }];
        });

        // 更新游戏状态
        const updatedCountries = { ...gameState.countries };
        // 移除所有国家的周天子标记
        Object.keys(updatedCountries).forEach(countryId => {
          updatedCountries[countryId] = {
            ...updatedCountries[countryId],
            hasKingToken: false
          };
        });
        // 设置目标国家的周天子标记
        updatedCountries[data.countryId] = {
          ...updatedCountries[data.countryId],
          hasKingToken: true
        };

        // 更新游戏状态
        dispatch(updateGameState({
          ...gameState,
          countries: updatedCountries
        }));
      }
    };

    // 添加事件监听器
    gameActions.on('tianshi_card_drawn', handleTianshiCardDrawn);
    gameActions.on('king_token_moved', handleKingTokenMoved);

    // 清理事件监听器
    return () => {
      gameActions.off('tianshi_card_drawn', handleTianshiCardDrawn);
      gameActions.off('king_token_moved', handleKingTokenMoved);
    };
  }, [gameState.players, dispatch]);

  // 获取当前玩家可执行的操作
  const getCurrentPlayerActions = () => {
    const currentPlayer = gameState.currentPlayer;
    if (!currentPlayer) return null;

    // 检查是否是盟主
    const isHost = currentPlayer.isHost;

    switch (gameState.phase) {
      case 'initial_hero_selection':
        return {
          title: '初始英杰选择',
          description: '请选择2张英杰牌',
          actions: (currentPlayer as any)?.tempHeroCards ? [
            {
              key: 'select_heroes',
              text: '选择英杰牌',
              onClick: () => {
                // 处理选择英杰牌的逻辑
              }
            }
          ] : []
        };
      case 'play_card':
        if (isHost) {
          return {
            title: '出牌阶段',
            description: '请选择一张牌打出',
            actions: [
              {
                key: 'play_card',
                text: '选择要打出的牌',
                onClick: () => {
                  // 显示选牌对话框
                  setShowCardSelectionDialog(true);
                }
              }
            ]
          };
        }
        return {
          title: '等待盟主出牌',
          description: '请等待盟主选择要打出的牌',
          actions: []
        };
      case 'playing':
        const actions = [];
        
        // 如果是盟主且没有激活的天时牌，显示翻开天时牌按钮
        if (isHost && !gameState.activeTianshiCard) {
          actions.push({
            key: 'draw_tianshi',
            text: '翻开天时牌',
            onClick: () => {
              gameActions.drawTianshiCard();
            }
          });
        }

        // 如果是盟主且有激活的天时牌，且周天子存在，显示移动周天子的按钮
        if (isHost && gameState.activeTianshiCard) {
          const hasKingToken = Object.values(gameState.countries).some(country => country.hasKingToken);
          if (hasKingToken) {
            actions.push({
              key: 'move_king',
              text: '移动周天子',
              onClick: () => {
                setShowKingMoveDialog(true);
              }
            });
          }
        }

        // 添加结束回合按钮
        actions.push({
          key: 'end_turn',
          text: '结束回合',
          onClick: () => {
            // 处理结束回合的逻辑
          }
        });

        return {
          title: isHost ? '盟主回合' : '游戏进行中',
          description: isHost && !gameState.activeTianshiCard ? '请翻开天时牌' : '请选择要执行的操作',
          actions
        };
      default:
        return {
          title: '等待中',
          description: '等待其他玩家操作',
          actions: []
        };
    }
  };

  // 添加选牌对话框状态
  const [showCardSelectionDialog, setShowCardSelectionDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // 处理出牌
  const handlePlayCard = () => {
    if (selectedCard) {
      gameActions.playCard(selectedCard);
      setShowCardSelectionDialog(false);
      setSelectedCard(null);
    }
  };

  // 获取未灭亡的国家列表
  const getAvailableCountries = () => {
    return Object.entries(gameState.countries)
      .filter(([_, country]) => {
        const totalPower = country.military + country.economy + country.politics;
        return totalPower > 3; // 国力总和大于3的国家未灭亡
      })
      .map(([id, _]) => id);
  };

  // 处理移动周天子
  const handleMoveKing = () => {
    if (selectedCountryForKing) {
      gameActions.moveKingToken(selectedCountryForKing);
      setShowKingMoveDialog(false);
      setSelectedCountryForKing(null);
    }
  };

  const currentActions = getCurrentPlayerActions();

  return (
    <>
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
                  isBot={player.isBot}
                  selectedCountry={player.selectedCountry}
                  country={player.country}
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
          <GameLogContainer>
            <GameLog logs={gameLogs} />
          </GameLogContainer>
        </LogArea>
      </BoardContainer>
      <ActionArea>
        <ActionContent>
          <ActionInfo>
            <h3>{currentActions?.title}</h3>
            <p>{currentActions?.description}</p>
          </ActionInfo>
          <ActionButtons>
            {currentActions?.actions.map(action => (
              <Button
                key={action.key}
                type="primary"
                onClick={action.onClick}
              >
                {action.text}
              </Button>
            ))}
          </ActionButtons>
        </ActionContent>
      </ActionArea>

      {/* 周天子移动对话框 */}
      {showKingMoveDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: 400 }}>
            <h3>选择周天子移动目标</h3>
            <div style={{ marginBottom: 16 }}>
              {getAvailableCountries().map(countryId => (
                <Button
                  key={countryId}
                  type={selectedCountryForKing === countryId ? 'primary' : 'default'}
                  onClick={() => setSelectedCountryForKing(countryId)}
                  style={{ margin: '0 8px 8px 0' }}
                >
                  {countryId}
                </Button>
              ))}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => {
                  setShowKingMoveDialog(false);
                  setSelectedCountryForKing(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                disabled={!selectedCountryForKing}
                onClick={handleMoveKing}
              >
                确定
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 选牌对话框 */}
      {showCardSelectionDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: 1000, maxHeight: '90vh', overflow: 'auto' }}>
            <h3>选择要打出的牌</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* 合并所有类型的牌 */}
              {[
                ...(gameState.currentPlayer?.hand?.renhe || []),
                ...(gameState.currentPlayer?.hand?.shishi || []),
                ...(gameState.currentPlayer?.hand?.shenqi || [])
              ].map(card => (
                <Tooltip 
                  key={card.id}
                  title={
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'white' }}>{card.name}</h4>
                      <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>{card.description}</p>
                    </div>
                  }
                >
                  <Card
                    style={{
                      width: 120,
                      height: 160,
                      cursor: 'pointer',
                      border: selectedCard === card.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      backgroundColor: selectedCard === card.id ? '#e6f7ff' : 
                        card.type === 'renhe' ? '#fff7e6' :
                        card.type === 'shishi' ? '#f6ffed' :
                        card.type === 'shenqi' ? '#f9f0ff' : 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px',
                      textAlign: 'center'
                    }}
                    onClick={() => setSelectedCard(String(card.id))}
                  >
                    <h4 style={{ 
                      margin: 0,
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {card.name}
                    </h4>
                  </Card>
                </Tooltip>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => {
                  setShowCardSelectionDialog(false);
                  setSelectedCard(null);
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                disabled={!selectedCard}
                onClick={handlePlayCard}
              >
                确定
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}; 