import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Card, Button, message, Tooltip, Spin } from 'antd';
import { socket } from '../socket';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #1890ff;
`;

const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

interface CountryCardProps {
  selected: boolean;
  disabled: boolean;
}

const StyledCountryCard = styled(Card)<CountryCardProps>`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;
  border: ${props => props.selected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
  background: ${props => {
    if (props.disabled) return '#f5f5f5';
    return props.selected ? '#e6f7ff' : '#fff';
  }};
  opacity: ${props => props.disabled ? 0.7 : 1};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.15)'};
  }
`;

const CountryName = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
  color: #1890ff;
`;

const HeroList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const HeroItem = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: help;
  font-size: 14px;
  color: #333;
  
  &:hover {
    background: #e6f7ff;
  }
`;

interface CountrySelectionProps {
  roomId: string;
  onCountrySelected: () => void;
  availableCountries?: string[];
  selectedCountries?: string[];
}

const COUNTRIES = [
  { id: '齐', name: '齐国' },
  { id: '楚', name: '楚国' },
  { id: '燕', name: '燕国' },
  { id: '韩', name: '韩国' },
  { id: '赵', name: '赵国' },
  { id: '魏', name: '魏国' },
  { id: '秦', name: '秦国' }
];

export const CountrySelection: React.FC<CountrySelectionProps> = ({ 
  roomId, 
  onCountrySelected,
  availableCountries = COUNTRIES.map(c => c.id),
  selectedCountries = []
}) => {
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);
  const [heroesData, setHeroesData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit('get_heroes_data', (response: any) => {
      if (response.success) {
        setHeroesData(response.data);
      } else {
        message.error('获取英雄数据失败');
      }
      setLoading(false);
    });
  }, []);

  const handleCountrySelect = (countryId: string) => {
    if (!availableCountries.includes(countryId)) return;
    setSelectedCountry(countryId);
  };

  const handleConfirm = () => {
    if (!selectedCountry) {
      message.error('请选择一个国家');
      return;
    }

    socket.emit('select_country', { roomId, countryId: selectedCountry }, (response: any) => {
      if (response.success) {
        message.success('国家选择成功');
        onCountrySelected();
      } else {
        message.error(response.error || '国家选择失败');
        setSelectedCountry(null);
      }
    });
  };

  if (loading) {
    return (
      <Container>
        <Spin size="large" tip="加载英雄数据中..." />
      </Container>
    );
  }

  return (
    <Container>
      <Title>想抽取哪个国家的英杰牌堆？</Title>
      <CountryGrid>
        {COUNTRIES.map(country => {
          const countryHeroes = heroesData[country.id] || [];
          return (
            <StyledCountryCard
              key={country.id}
              selected={selectedCountry === country.id}
              disabled={!availableCountries.includes(country.id) || selectedCountries.includes(country.id)}
              onClick={() => handleCountrySelect(country.id)}
            >
              <CountryName>{country.name}</CountryName>
              <HeroList>
                {countryHeroes.map(hero => (
                  <Tooltip
                    key={hero.id}
                    title={
                      <>
                        <div>生卒：{hero.birthDeath}</div>
                        <div>目标：{hero.goal}</div>
                        <div>效果：{hero.effect}</div>
                        <div>"{hero.quote}"</div>
                        <div>{hero.description}</div>
                      </>
                    }
                  >
                    <HeroItem>{hero.name}</HeroItem>
                  </Tooltip>
                ))}
              </HeroList>
            </StyledCountryCard>
          );
        })}
      </CountryGrid>
      <Button
        type="primary"
        size="large"
        block
        onClick={handleConfirm}
        disabled={!selectedCountry}
      >
        确认选择
      </Button>
    </Container>
  );
}; 