import React, { useState } from 'react';
import { TianshiCard } from '../types/cards';
import './TianshiArea.css';

interface TianshiAreaProps {
  activeTianshiCard: TianshiCard | null;
  tianshiDeckCount: number;
  tianshiDeck?: TianshiCard[]; // 添加天时牌堆数据
}

// 格式化效果文本
const formatEffect = (effect: string | { type: string; value: number } | undefined): string => {
  if (!effect) return '无效果';
  if (typeof effect === 'string') return effect;
  return `${effect.type}: ${effect.value}`;
};

export const TianshiArea: React.FC<TianshiAreaProps> = ({ 
  activeTianshiCard, 
  tianshiDeckCount,
  tianshiDeck = []
}) => {
  const [showDeckDetails, setShowDeckDetails] = useState(false);

  return (
    <div className="tianshi-area">
      <div 
        className="tianshi-deck"
        onClick={() => setShowDeckDetails(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="deck-count">天时牌堆: {tianshiDeckCount}</div>
        <div className="deck-hint">点击查看详情</div>
      </div>
      <div className="active-tianshi">
        {activeTianshiCard ? (
          <div className="tianshi-card">
            <h3>{activeTianshiCard.name}</h3>
            <p>{formatEffect(activeTianshiCard.effect)}</p>
          </div>
        ) : (
          <div className="tianshi-card empty">
            <p>无生效天时牌</p>
          </div>
        )}
      </div>

      {/* 天时牌堆详情弹窗 */}
      {showDeckDetails && (
        <div className="tianshi-deck-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>天时牌堆详情</h2>
              <button onClick={() => setShowDeckDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              {tianshiDeck.length > 0 ? (
                <div className="deck-cards">
                  {tianshiDeck.map((card, index) => (
                    <div key={card.id} className="deck-card">
                      <div className="card-index">#{index + 1}</div>
                      <h3>{card.name}</h3>
                      <p>{formatEffect(card.effect)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-cards">牌堆中没有天时牌</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 