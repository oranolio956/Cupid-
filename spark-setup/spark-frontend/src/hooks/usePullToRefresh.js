import { useState, useEffect, useRef } from 'react';

/**
 * Pull-to-refresh hook for mobile devices
 * @param {Function} onRefresh - Callback function to execute on refresh
 * @param {number} threshold - Distance in pixels to trigger refresh (default: 80)
 * @returns {Object} - { isPulling, pullDistance, isRefreshing }
 */
export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isMobile = useRef(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    // Only enable on mobile
    if (!isMobile.current) return;

    let touchStartY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      // Only trigger if at top of page
      if (window.scrollY === 0 && !isRefreshing) {
        touchStartY = e.touches[0].clientY;
        startY.current = touchStartY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && startY.current > 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;
        
        if (distance > 0) {
          // Prevent default scroll behavior
          e.preventDefault();
          
          // Apply resistance curve (diminishing returns)
          const resistance = 0.5;
          const adjustedDistance = Math.pow(distance, resistance) * 10;
          
          setIsPulling(true);
          setPullDistance(Math.min(adjustedDistance, threshold * 1.5));
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  return { 
    isPulling, 
    pullDistance, 
    isRefreshing: isRefreshing || pullDistance >= threshold 
  };
};

export default usePullToRefresh;
