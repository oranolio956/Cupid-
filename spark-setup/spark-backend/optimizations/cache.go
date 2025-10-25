package optimizations

import (
	"sync"
	"time"
)

// CacheManager provides caching functionality
type CacheManager struct {
	// Cache storage
	cache map[string]*CacheEntry
	
	// Configuration
	maxSize int
	ttl     time.Duration
	cleanup time.Duration
	
	// Statistics
	hits   int64
	misses int64
	
	// Mutex for thread safety
	mutex sync.RWMutex
	
	// Cleanup ticker
	cleanupTicker *time.Ticker
	stopChan      chan bool
}

// CacheEntry represents a cache entry
type CacheEntry struct {
	Value     interface{}
	ExpiresAt time.Time
	CreatedAt time.Time
	AccessCount int64
}

// NewCacheManager creates a new cache manager
func NewCacheManager(maxSize int, ttl, cleanup time.Duration) *CacheManager {
	cm := &CacheManager{
		cache:    make(map[string]*CacheEntry),
		maxSize:  maxSize,
		ttl:      ttl,
		cleanup:  cleanup,
		stopChan: make(chan bool),
	}
	
	// Start cleanup goroutine
	cm.cleanupTicker = time.NewTicker(cleanup)
	go cm.cleanup()
	
	return cm
}

// Get retrieves a value from cache
func (cm *CacheManager) Get(key string) (interface{}, bool) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	entry, exists := cm.cache[key]
	if !exists {
		cm.misses++
		return nil, false
	}
	
	// Check if expired
	if time.Now().After(entry.ExpiresAt) {
		cm.misses++
		return nil, false
	}
	
	// Update access count
	entry.AccessCount++
	cm.hits++
	
	return entry.Value, true
}

// Set stores a value in cache
func (cm *CacheManager) Set(key string, value interface{}) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	// Check if cache is full
	if len(cm.cache) >= cm.maxSize {
		cm.evictLRU()
	}
	
	// Create new entry
	entry := &CacheEntry{
		Value:       value,
		ExpiresAt:   time.Now().Add(cm.ttl),
		CreatedAt:   time.Now(),
		AccessCount: 1,
	}
	
	cm.cache[key] = entry
}

// Delete removes a value from cache
func (cm *CacheManager) Delete(key string) {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	delete(cm.cache, key)
}

// Clear removes all values from cache
func (cm *CacheManager) Clear() {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	cm.cache = make(map[string]*CacheEntry)
}

// GetSize returns the current cache size
func (cm *CacheManager) GetSize() int {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	return len(cm.cache)
}

// GetHits returns the number of cache hits
func (cm *CacheManager) GetHits() int64 {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	return cm.hits
}

// GetMisses returns the number of cache misses
func (cm *CacheManager) GetMisses() int64 {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	return cm.misses
}

// GetHitRate returns the cache hit rate
func (cm *CacheManager) GetHitRate() float64 {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	total := cm.hits + cm.misses
	if total == 0 {
		return 0.0
	}
	
	return float64(cm.hits) / float64(total) * 100.0
}

// evictLRU evicts the least recently used entry
func (cm *CacheManager) evictLRU() {
	var oldestKey string
	var oldestTime time.Time
	
	for key, entry := range cm.cache {
		if oldestKey == "" || entry.CreatedAt.Before(oldestTime) {
			oldestKey = key
			oldestTime = entry.CreatedAt
		}
	}
	
	if oldestKey != "" {
		delete(cm.cache, oldestKey)
	}
}

// cleanup removes expired entries
func (cm *CacheManager) cleanup() {
	for {
		select {
		case <-cm.cleanupTicker.C:
			cm.mutex.Lock()
			
			now := time.Now()
			for key, entry := range cm.cache {
				if now.After(entry.ExpiresAt) {
					delete(cm.cache, key)
				}
			}
			
			cm.mutex.Unlock()
			
		case <-cm.stopChan:
			cm.cleanupTicker.Stop()
			return
		}
	}
}

// Stop stops the cache manager
func (cm *CacheManager) Stop() {
	cm.stopChan <- true
}

// GetStats returns cache statistics
func (cm *CacheManager) GetStats() map[string]interface{} {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	return map[string]interface{}{
		"size":      len(cm.cache),
		"max_size":  cm.maxSize,
		"hits":      cm.hits,
		"misses":    cm.misses,
		"hit_rate":  cm.GetHitRate(),
		"ttl":       cm.ttl.String(),
	}
}