import React, { useState, useRef, useEffect } from 'react';
import { DeleteOutlined, DesktopOutlined, CodeOutlined } from '@ant-design/icons';
import './SwipeableDeviceCard.css';

const SwipeableDeviceCard = ({ device, onAction, children }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let touchStartX = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      startX.current = touchStartX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      
      currentX.current = e.touches[0].clientX;
      const diff = currentX.current - startX.current;
      
      // Only allow left swipe (negative values)
      const offset = Math.max(-150, Math.min(0, diff));
      setSwipeOffset(offset);
    };

    const handleTouchEnd = () => {
      setIsSwiping(false);
      const touchDuration = Date.now() - touchStartTime;
      const velocity = Math.abs(swipeOffset) / touchDuration;

      // If swiped more than 75px or fast swipe, show actions
      if (swipeOffset < -75 || velocity > 0.5) {
        setSwipeOffset(-150);
      } else {
        setSwipeOffset(0);
      }
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: true });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSwiping, swipeOffset]);

  const quickActions = [
    { key: 'terminal', icon: <CodeOutlined />, color: '#52c41a', label: 'Terminal' },
    { key: 'desktop', icon: <DesktopOutlined />, color: '#1890ff', label: 'Desktop' },
    { key: 'delete', icon: <DeleteOutlined />, color: '#ff4d4f', label: 'Remove' }
  ];

  const handleActionClick = (actionKey) => {
    onAction(actionKey, device);
    setSwipeOffset(0);
  };

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // If not mobile, just render children without swipe functionality
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="swipeable-card-container">
      <div
        ref={cardRef}
        className={`swipeable-card ${isSwiping ? 'swiping' : ''}`}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </div>
      <div className="swipe-actions">
        {quickActions.map(action => (
          <button
            key={action.key}
            className="swipe-action"
            style={{ backgroundColor: action.color }}
            onClick={() => handleActionClick(action.key)}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SwipeableDeviceCard;
