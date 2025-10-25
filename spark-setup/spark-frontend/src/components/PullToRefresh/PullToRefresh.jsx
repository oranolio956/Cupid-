import React from 'react';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import './PullToRefresh.css';

const PullToRefresh = ({ isPulling, pullDistance, isRefreshing, threshold = 80 }) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldShow = isPulling || isRefreshing;

  if (!shouldShow) return null;

  return (
    <div 
      className="pull-to-refresh-indicator"
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        opacity: Math.min(pullDistance / threshold, 1)
      }}
    >
      <div className="pull-indicator-content">
        {isRefreshing ? (
          <>
            <LoadingOutlined spin style={{ fontSize: 24 }} />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <ReloadOutlined 
              style={{ 
                fontSize: 24,
                transform: `rotate(${progress * 3.6}deg)`
              }} 
            />
            <span>{progress >= 100 ? 'Release to refresh' : 'Pull to refresh'}</span>
          </>
        )}
      </div>
      <div className="pull-progress-bar">
        <div 
          className="pull-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PullToRefresh;
