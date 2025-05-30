import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { ShishiCard as ShishiCardType } from '../types/cards';

interface ShishiCardProps {
  card: ShishiCardType;
  isSelected?: boolean;
  onClick?: () => void;
}

const CardContainer = styled.div<{ isSelected?: boolean }>`
  width: 50px;
  height: 70px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 3px;
  background: ${props => props.isSelected ? '#e6f7ff' : 'white'};
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardName = styled.div`
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShishiCard: React.FC<ShishiCardProps> = ({
  card,
  isSelected = false,
  onClick
}) => {
  const tooltipContent = (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{card.name}</div>
      <div style={{ color: '#666', marginBottom: '8px' }}>
        {card.countries.join('、')}
      </div>
      <div>{card.description}</div>
      {card.story && (
        <>
          <br />
          <div style={{ color: '#666', fontStyle: 'italic' }}>{card.story}</div>
        </>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="right">
      <CardContainer isSelected={isSelected} onClick={onClick}>
        <CardName>{card.name}</CardName>
      </CardContainer>
    </Tooltip>
  );
};

export default ShishiCard; 