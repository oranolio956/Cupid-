package optimizations

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// CacheEntry represents a cached item with expiration
type CacheEntry struct {
	Data      interface{}
	ExpiresAt time.Time
}

// MemoryCache provides in-memory caching with TTL support
type MemoryCache struct {
	items map[string]CacheEntry
	mutex sync.RWMutex
}

// NewMemoryCache creates a new memory cache instance
func NewMemoryCache() *MemoryCache {
	cache := &MemoryCache{
		items: make(map[string]CacheEntry),
	}
	
	// Start cleanup goroutine
	go cache.cleanup()
	
	return cache
}

// Set stores a value in the cache with TTL
func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.items[key] = CacheEntry{
		Data:      value,
		ExpiresAt: time.Now().Add(ttl),
	}
}

// Get retrieves a value from the cache
func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	entry, exists := c.items[key]
	if !exists {
		return nil, false
	}
	
	// Check if expired
	if time.Now().After(entry.ExpiresAt) {
		return nil, false
	}
	
	return entry.Data, true
}

// Delete removes a value from the cache
func (c *MemoryCache) Delete(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	delete(c.items, key)
}

// Clear removes all items from the cache
func (c *MemoryCache) Clear() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.items = make(map[string]CacheEntry)
}

// cleanup removes expired entries periodically
func (c *MemoryCache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		c.mutex.Lock()
		now := time.Now()
		for key, entry := range c.items {
			if now.After(entry.ExpiresAt) {
				delete(c.items, key)
			}
		}
		c.mutex.Unlock()
	}
}

// GetStats returns cache statistics
func (c *MemoryCache) GetStats() map[string]interface{} {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	return map[string]interface{}{
		"items_count": len(c.items),
		"memory_usage": c.estimateMemoryUsage(),
	}
}

// estimateMemoryUsage provides a rough estimate of memory usage
func (c *MemoryCache) estimateMemoryUsage() int64 {
	var totalSize int64
	
	for key, entry := range c.items {
		// Estimate key size
		totalSize += int64(len(key))
		
		// Estimate value size by serializing to JSON
		if data, err := json.Marshal(entry.Data); err == nil {
			totalSize += int64(len(data))
		}
	}
	
	return totalSize
}

// CacheManager manages multiple cache instances
type CacheManager struct {
	caches map[string]*MemoryCache
	mutex  sync.RWMutex
}

// NewCacheManager creates a new cache manager
func NewCacheManager() *CacheManager {
	return &CacheManager{
		caches: make(map[string]*MemoryCache),
	}
}

// GetCache returns a cache instance by name
func (cm *CacheManager) GetCache(name string) *MemoryCache {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	if cache, exists := cm.caches[name]; exists {
		return cache
	}
	
	cache := NewMemoryCache()
	cm.caches[name] = cache
	return cache
}

// ClearAll clears all caches
func (cm *CacheManager) ClearAll() {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	for _, cache := range cm.caches {
		cache.Clear()
	}
}

// GetStats returns statistics for all caches
func (cm *CacheManager) GetStats() map[string]interface{} {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	stats := make(map[string]interface{})
	for name, cache := range cm.caches {
		stats[name] = cache.GetStats()
	}
	
	return stats
}

// CacheMiddleware provides caching middleware for HTTP handlers
type CacheMiddleware struct {
	cache *MemoryCache
	ttl   time.Duration
}

// NewCacheMiddleware creates a new cache middleware
func NewCacheMiddleware(cache *MemoryCache, ttl time.Duration) *CacheMiddleware {
	return &CacheMiddleware{
		cache: cache,
		ttl:   ttl,
	}
}

// CacheKey generates a cache key from request parameters
func (cm *CacheMiddleware) CacheKey(method, path string, params map[string]string) string {
	key := fmt.Sprintf("%s:%s", method, path)
	
	if len(params) > 0 {
		paramStr, _ := json.Marshal(params)
		key += fmt.Sprintf(":%s", paramStr)
	}
	
	return key
}

// Get retrieves cached response
func (cm *CacheMiddleware) Get(key string) (interface{}, bool) {
	return cm.cache.Get(key)
}

// Set stores response in cache
func (cm *CacheMiddleware) Set(key string, value interface{}) {
	cm.cache.Set(key, value, cm.ttl)
}

// Performance monitoring
type PerformanceMonitor struct {
	requestCounts    map[string]int64
	responseTimes    map[string][]time.Duration
	errorCounts      map[string]int64
	mutex            sync.RWMutex
}

// NewPerformanceMonitor creates a new performance monitor
func NewPerformanceMonitor() *PerformanceMonitor {
	return &PerformanceMonitor{
		requestCounts: make(map[string]int64),
		responseTimes: make(map[string][]time.Duration),
		errorCounts:   make(map[string]int64),
	}
}

// RecordRequest records a request
func (pm *PerformanceMonitor) RecordRequest(endpoint string, duration time.Duration) {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()
	
	pm.requestCounts[endpoint]++
	pm.responseTimes[endpoint] = append(pm.responseTimes[endpoint], duration)
	
	// Keep only last 100 response times per endpoint
	if len(pm.responseTimes[endpoint]) > 100 {
		pm.responseTimes[endpoint] = pm.responseTimes[endpoint][1:]
	}
}

// RecordError records an error
func (pm *PerformanceMonitor) RecordError(endpoint string) {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()
	
	pm.errorCounts[endpoint]++
}

// GetStats returns performance statistics
func (pm *PerformanceMonitor) GetStats() map[string]interface{} {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()
	
	stats := make(map[string]interface{})
	
	for endpoint, count := range pm.requestCounts {
		avgResponseTime := time.Duration(0)
		if times, exists := pm.responseTimes[endpoint]; exists && len(times) > 0 {
			var total time.Duration
			for _, t := range times {
				total += t
			}
			avgResponseTime = total / time.Duration(len(times))
		}
		
		errorCount := pm.errorCounts[endpoint]
		errorRate := float64(errorCount) / float64(count) * 100
		
		stats[endpoint] = map[string]interface{}{
			"request_count":     count,
			"avg_response_time": avgResponseTime.String(),
			"error_count":       errorCount,
			"error_rate":        fmt.Sprintf("%.2f%%", errorRate),
		}
	}
	
	return stats
}