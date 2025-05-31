import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { ShenqiCard as ShenqiCardType } from '../types/cards';

interface ShenqiCardProps {
  card: ShenqiCardType;
  isSelected: boolean;
  onClick: () => void;
}

const CardContainer = styled.div<{ isSelected: boolean }>`
  width: 50px;
  height: 70px;
  border: 1px solid ${props => props.isSelected ? '#1890ff' : '#d9d9d9'};
  border-radius: 4px;
  padding: 4px;
  background: ${props => props.isSelected ? '#e6f7ff' : '#f9f0ff'};
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
  font-size: 12px;
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

const ShenqiCard: React.FC<ShenqiCardProps> = ({ card, isSelected, onClick }) => {
  return (
    <Tooltip title={card.description} placement="top">
      <CardContainer isSelected={isSelected} onClick={onClick}>
        <CardName>{card.name}</CardName>
      </CardContainer>
    </Tooltip>
  );
};

export default ShenqiCard; 