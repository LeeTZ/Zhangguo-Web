import React from 'react';
import { Card } from 'antd';
import styled from '@emotion/styled';

interface GameLogProps {
  logs: Array<{
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }>;
}

const LogContainer = styled(Card)`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const LogTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #262626;
`;

const LogList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

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

const LogItem = styled.div<{ type: string }>`
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  background: ${props => {
    switch (props.type) {
      case 'info': return '#f5f5f5';
      case 'success': return '#f6ffed';
      case 'warning': return '#fffbe6';
      case 'error': return '#fff2f0';
      default: return '#f5f5f5';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'info': return '#d9d9d9';
      case 'success': return '#b7eb8f';
      case 'warning': return '#ffe58f';
      case 'error': return '#ffccc7';
      default: return '#d9d9d9';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'info': return '#595959';
      case 'success': return '#389e0d';
      case 'warning': return '#d48806';
      case 'error': return '#cf1322';
      default: return '#595959';
    }
  }};
`;

const LogTime = styled.span`
  color: #8c8c8c;
  margin-right: 8px;
  font-size: 12px;
`;

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <LogContainer>
      <LogTitle>游戏日志</LogTitle>
      <LogList>
        {logs.map(log => (
          <LogItem key={log.id} type={log.type}>
            <LogTime>{formatTime(log.timestamp)}</LogTime>
            {log.message}
          </LogItem>
        ))}
      </LogList>
    </LogContainer>
  );
}; 