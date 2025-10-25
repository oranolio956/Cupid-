// Performance optimization utilities for Spark Frontend

// Lazy loading utility
export const lazyLoad = (importFunction, fallback = null) => {
  return React.lazy(() => 
    importFunction().catch(() => ({
      default: fallback || (() => <div>Failed to load component</div>)
    }))
  );
};

// Memoization utilities
export const memoize = (fn, keyGenerator = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling hook
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });
  
  const startTime = useRef(0);
  
  useEffect(() => {
    startTime.current = performance.now();
  });
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      const newAverageRenderTime = 
        (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
      
      return {
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverageRenderTime
      };
    });
  });
  
  return metrics;
};

// Bundle size optimization
export const loadChunk = (chunkName) => {
  // For now, return a resolved promise since chunks directory doesn't exist
  return Promise.resolve({ default: () => null });
};

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  // Use WebP format if supported
  const isWebPSupported = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };
  
  const format = isWebPSupported() ? 'webp' : 'jpeg';
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: format
  });
  
  return `${src}?${params.toString()}`;
};

// Request optimization
export const useRequestOptimization = () => {
  const requestCache = useRef(new Map());
  const pendingRequests = useRef(new Map());
  
  const optimizedRequest = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    
    // Check cache first
    if (requestCache.current.has(cacheKey)) {
      const cached = requestCache.current.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }
    
    // Check if request is already pending
    if (pendingRequests.current.has(cacheKey)) {
      return pendingRequests.current.get(cacheKey);
    }
    
    // Make request
    const requestPromise = fetch(url, options)
      .then(response => response.json())
      .then(data => {
        // Cache successful responses
        requestCache.current.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        // Remove from pending
        pendingRequests.current.delete(cacheKey);
        
        return data;
      })
      .catch(error => {
        // Remove from pending on error
        pendingRequests.current.delete(cacheKey);
        throw error;
      });
    
    // Store pending request
    pendingRequests.current.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, []);
  
  const clearCache = useCallback(() => {
    requestCache.current.clear();
  }, []);
  
  return { optimizedRequest, clearCache };
};

// Memory optimization
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef([]);
  
  const addCleanup = useCallback((cleanup) => {
    cleanupFunctions.current.push(cleanup);
  }, []);
  
  useEffect(() => {
    return () => {
      // Run all cleanup functions
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);
  
  return { addCleanup };
};

// Bundle analyzer
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    const stats = {
      totalSize: 0,
      chunkSizes: {},
      duplicateModules: [],
      unusedModules: []
    };
    
    // This would be populated by webpack-bundle-analyzer
    return stats;
  }
  
  return null;
};

// Performance budget checker
export const checkPerformanceBudget = (metrics) => {
  const budget = {
    firstContentfulPaint: 2000, // 2 seconds
    largestContentfulPaint: 4000, // 4 seconds
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1
    totalBlockingTime: 300 // 300ms
  };
  
  const violations = [];
  
  Object.entries(budget).forEach(([metric, threshold]) => {
    if (metrics[metric] > threshold) {
      violations.push({
        metric,
        actual: metrics[metric],
        threshold,
        severity: metrics[metric] > threshold * 1.5 ? 'high' : 'medium'
      });
    }
  });
  
  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, 100 - (violations.length * 20))
  };
};

// Web Vitals monitoring
export const useWebVitals = () => {
  const [vitals, setVitals] = useState({});
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        setVitals(prev => ({
          ...prev,
          [entry.name]: entry.value
        }));
      });
    });
    
    // Observe Core Web Vitals
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    
    return () => observer.disconnect();
  }, []);
  
  return vitals;
};

// Resource hints
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Service Worker optimization
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Service Worker registered
      })
      .catch(registrationError => {
        // Service Worker registration failed
      });
  }
};

// Critical CSS extraction
export const extractCriticalCSS = () => {
  // This would be handled by webpack plugins in production
  return process.env.NODE_ENV === 'production' ? 'critical.css' : null;
};

// Code splitting utilities
export const createAsyncComponent = (importFunction, fallback = null) => {
  return React.lazy(() => 
    importFunction().catch(error => {
      console.error('Failed to load component:', error);
      return { default: fallback || (() => <div>Component failed to load</div>) };
    })
  );
};

// Performance optimization context
export const PerformanceContext = React.createContext({
  metrics: {},
  setMetrics: () => {},
  clearMetrics: () => {}
});

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({});
  
  const clearMetrics = useCallback(() => {
    setMetrics({});
  }, []);
  
  return (
    <PerformanceContext.Provider value={{ metrics, setMetrics, clearMetrics }}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Performance monitoring component
export const PerformanceMonitor = ({ children, name }) => {
  const { setMetrics } = useContext(PerformanceContext);
  const metrics = usePerformanceMonitor(name);
  
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      [name]: metrics
    }));
  }, [metrics, name, setMetrics]);
  
  return children;
};

// Export all utilities
export default {
  lazyLoad,
  memoize,
  debounce,
  throttle,
  useVirtualScroll,
  usePerformanceMonitor,
  loadChunk,
  optimizeImage,
  useRequestOptimization,
  useMemoryOptimization,
  analyzeBundle,
  checkPerformanceBudget,
  useWebVitals,
  preloadResource,
  prefetchResource,
  registerServiceWorker,
  extractCriticalCSS,
  createAsyncComponent,
  PerformanceContext,
  PerformanceProvider,
  PerformanceMonitor
};