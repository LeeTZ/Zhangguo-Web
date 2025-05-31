import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { ShishiCard as ShishiCardType } from '../types/cards';

interface ShishiCardProps {
  card: ShishiCardType;
  isSelected: boolean;
  onClick: () => void;
}

const CardContainer = styled.div<{ isSelected: boolean }>`
  width: 50px;
  height: 70px;
  border: 1px solid ${props => props.isSelected ? '#1890ff' : '#d9d9d9'};
  border-radius: 4px;
  padding: 4px;
  background: ${props => props.isSelected ? '#e6f7ff' : '#f6ffed'};
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #1890ff;
  }
`;

const CardName = styled.div`
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 100%;
  padding: 2px;
`;

const ShishiCard: React.FC<ShishiCardProps> = ({ card, isSelected, onClick }) => {
  const tooltipContent = (
    <>
      <div>{card.description}</div>
      {card.story && <div style={{ marginTop: '8px', fontStyle: 'italic' }}>{card.story}</div>}
      {card.countries && card.countries.length > 0 && (
        <div style={{ marginTop: '4px' }}>相关国家：{card.countries.join('、')}</div>
      )}
    </>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <CardContainer isSelected={isSelected} onClick={onClick}>
        <CardName>{card.name}</CardName>
      </CardContainer>
    </Tooltip>
  );
};

export default ShishiCard; 