import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { RenheCard as RenheCardType } from '../types/cards';

interface RenheCardProps {
  card: RenheCardType;
  isSelected: boolean;
  onClick: () => void;
}

const CardContainer = styled.div<{ isSelected: boolean }>`
  min-width: 50px;
  height: 35px;
  border: 1px solid ${props => props.isSelected ? '#1890ff' : '#d9d9d9'};
  border-radius: 4px;
  padding: 2px 4px;
  background: ${props => props.isSelected ? '#e6f7ff' : '#fff7e6'};
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px;
`;

const RenheCard: React.FC<RenheCardProps> = ({ card, isSelected, onClick }) => {
  const tooltipContent = (
    <>
      <div>{card.description}</div>
      {card.effect && (
        <div style={{ marginTop: '4px' }}>
          效果：{card.effect.type} {card.effect.value > 0 ? '+' : ''}{card.effect.value}
        </div>
      )}
      {card.cardType && (
        <div style={{ marginTop: '4px' }}>类型：{card.cardType}</div>
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

export default RenheCard;