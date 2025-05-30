import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';

// 定义人和牌的类型
export interface RenheCardType {
  id: string;
  name: string;
  type: string;
  cardType: string;
  description: string;
  effect: {
    type: string;
    value: number;
  };
}

interface RenheCardProps {
  card: RenheCardType;
  isSelected?: boolean;
  onClick?: () => void;
}

const CardContainer = styled.div<{ isSelected?: boolean }>`
  width: 50px;
  height: 70px;
  margin: 2px;
  cursor: pointer;
  border-radius: 4px;
  background: white;
  border: ${props => props.isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const CardName = styled.div`
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
`;

const RenheCard: React.FC<RenheCardProps> = ({
  card,
  isSelected,
  onClick
}) => {
  return (
    <Tooltip 
      title={card.description}
      placement="top"
      mouseEnterDelay={0.5}
    >
      <CardContainer
        onClick={onClick}
        isSelected={isSelected}
      >
        <CardName>{card.name}</CardName>
      </CardContainer>
    </Tooltip>
  );
};

export default RenheCard;