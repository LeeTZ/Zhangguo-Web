import React from 'react';
import styled from '@emotion/styled';
import { Card } from 'antd';

interface Country {
  name: string;
  military: number;
  economy: number;
  politics: number;
  hasKingToken: boolean;
  hegemony: number;
}

interface CountriesAreaProps {
  countries: {
    [key: string]: Country;
  };
}

const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const CountryCard = styled(Card)`
  .ant-card-body {
    padding: 12px;
  }
`;

const CountryName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const KingToken = styled.span`
  color: #ffd700;
  font-size: 16px;
  background: #fff7e6;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ffd700;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  font-size: 14px;
`;

const StatLabel = styled.span<{ type: 'military' | 'economy' | 'politics' | 'hegemony' }>`
  color: ${props => {
    switch (props.type) {
      case 'military':
        return '#f5222d'; // 红色
      case 'economy':
        return '#faad14'; // 黄色
      case 'politics':
        return '#1890ff'; // 蓝色
      default:
        return 'inherit';
    }
  }};
  font-weight: 500;
`;

const StatValue = styled.span<{ type: 'military' | 'economy' | 'politics' | 'hegemony' }>`
  color: ${props => {
    switch (props.type) {
      case 'military':
        return '#ff4d4f'; // 红色
      case 'economy':
        return '#ffc53d'; // 黄色
      case 'politics':
        return '#40a9ff'; // 蓝色
      default:
        return 'inherit';
    }
  }};
  font-weight: 500;
`;

export const CountriesArea: React.FC<CountriesAreaProps> = ({ countries }) => {
  return (
    <div className="countries-area">
      <h2>七国形势</h2>
      <CountryGrid>
        {Object.entries(countries).map(([key, country]) => (
          <CountryCard key={key} size="small">
            <CountryName>
              {country.name}
              {country.hasKingToken && (
                <KingToken>
                  <span>👑</span>
                  <span>周天子</span>
                </KingToken>
              )}
            </CountryName>
            <StatGrid>
              <StatLabel type="military">军事:</StatLabel>
              <StatValue type="military">{country.military}</StatValue>
              <StatLabel type="economy">经济:</StatLabel>
              <StatValue type="economy">{country.economy}</StatValue>
              <StatLabel type="politics">政理:</StatLabel>
              <StatValue type="politics">{country.politics}</StatValue>
              <StatLabel type="hegemony">称霸:</StatLabel>
              <StatValue type="hegemony">{country.hegemony}</StatValue>
            </StatGrid>
          </CountryCard>
        ))}
      </CountryGrid>
    </div>
  );
}; 