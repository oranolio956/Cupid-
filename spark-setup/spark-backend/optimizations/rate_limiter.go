package optimizations

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// RateLimiter provides rate limiting functionality
type RateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Allow checks if a request is allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()
	
	now := time.Now()
	cutoff := now.Add(-rl.window)
	
	// Get existing requests for this key
	requests, exists := rl.requests[key]
	if !exists {
		requests = make([]time.Time, 0)
	}
	
	// Remove old requests outside the window
	var validRequests []time.Time
	for _, reqTime := range requests {
		if reqTime.After(cutoff) {
			validRequests = append(validRequests, reqTime)
		}
	}
	
	// Check if we're under the limit
	if len(validRequests) >= rl.limit {
		rl.requests[key] = validRequests
		return false
	}
	
	// Add new request
	validRequests = append(validRequests, now)
	rl.requests[key] = validRequests
	
	return true
}

// GetRemaining returns the number of remaining requests
func (rl *RateLimiter) GetRemaining(key string) int {
	rl.mutex.RLock()
	defer rl.mutex.RUnlock()
	
	now := time.Now()
	cutoff := now.Add(-rl.window)
	
	requests, exists := rl.requests[key]
	if !exists {
		return rl.limit
	}
	
	// Count valid requests
	validCount := 0
	for _, reqTime := range requests {
		if reqTime.After(cutoff) {
			validCount++
		}
	}
	
	return rl.limit - validCount
}

// GetResetTime returns when the rate limit resets
func (rl *RateLimiter) GetResetTime(key string) time.Time {
	rl.mutex.RLock()
	defer rl.mutex.RUnlock()
	
	requests, exists := rl.requests[key]
	if !exists || len(requests) == 0 {
		return time.Now()
	}
	
	// Find the oldest request
	oldest := requests[0]
	for _, reqTime := range requests {
		if reqTime.Before(oldest) {
			oldest = reqTime
		}
	}
	
	return oldest.Add(rl.window)
}

// Cleanup removes old entries
func (rl *RateLimiter) Cleanup() {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()
	
	now := time.Now()
	cutoff := now.Add(-rl.window * 2) // Keep some buffer
	
	for key, requests := range rl.requests {
		var validRequests []time.Time
		for _, reqTime := range requests {
			if reqTime.After(cutoff) {
				validRequests = append(validRequests, reqTime)
			}
		}
		
		if len(validRequests) == 0 {
			delete(rl.requests, key)
		} else {
			rl.requests[key] = validRequests
		}
	}
}

// GetStats returns rate limiter statistics
func (rl *RateLimiter) GetStats() map[string]interface{} {
	rl.mutex.RLock()
	defer rl.mutex.RUnlock()
	
	totalKeys := len(rl.requests)
	totalRequests := 0
	
	now := time.Now()
	cutoff := now.Add(-rl.window)
	
	for _, requests := range rl.requests {
		for _, reqTime := range requests {
			if reqTime.After(cutoff) {
				totalRequests++
			}
		}
	}
	
	return map[string]interface{}{
		"total_keys":     totalKeys,
		"total_requests": totalRequests,
		"limit":          rl.limit,
		"window":         rl.window.String(),
	}
}

// TokenBucket implements token bucket rate limiting
type TokenBucket struct {
	capacity    int
	tokens      int
	refillRate  int
	lastRefill  time.Time
	mutex       sync.Mutex
}

// NewTokenBucket creates a new token bucket
func NewTokenBucket(capacity, refillRate int) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		tokens:     capacity,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

// Allow checks if a request is allowed (consumes a token)
func (tb *TokenBucket) Allow() bool {
	tb.mutex.Lock()
	defer tb.mutex.Unlock()
	
	// Refill tokens
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill)
	tokensToAdd := int(elapsed.Seconds()) * tb.refillRate
	
	if tokensToAdd > 0 {
		tb.tokens += tokensToAdd
		if tb.tokens > tb.capacity {
			tb.tokens = tb.capacity
		}
		tb.lastRefill = now
	}
	
	// Check if we have tokens
	if tb.tokens > 0 {
		tb.tokens--
		return true
	}
	
	return false
}

// GetTokens returns the current number of tokens
func (tb *TokenBucket) GetTokens() int {
	tb.mutex.Lock()
	defer tb.mutex.Unlock()
	
	// Refill tokens
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill)
	tokensToAdd := int(elapsed.Seconds()) * tb.refillRate
	
	if tokensToAdd > 0 {
		tb.tokens += tokensToAdd
		if tb.tokens > tb.capacity {
			tb.tokens = tb.capacity
		}
		tb.lastRefill = now
	}
	
	return tb.tokens
}

// SlidingWindowRateLimiter implements sliding window rate limiting
type SlidingWindowRateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

// NewSlidingWindowRateLimiter creates a new sliding window rate limiter
func NewSlidingWindowRateLimiter(limit int, window time.Duration) *SlidingWindowRateLimiter {
	return &SlidingWindowRateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Allow checks if a request is allowed
func (swrl *SlidingWindowRateLimiter) Allow(key string) bool {
	swrl.mutex.Lock()
	defer swrl.mutex.Unlock()
	
	now := time.Now()
	cutoff := now.Add(-swrl.window)
	
	// Get existing requests for this key
	requests, exists := swrl.requests[key]
	if !exists {
		requests = make([]time.Time, 0)
	}
	
	// Remove old requests outside the window
	var validRequests []time.Time
	for _, reqTime := range requests {
		if reqTime.After(cutoff) {
			validRequests = append(validRequests, reqTime)
		}
	}
	
	// Check if we're under the limit
	if len(validRequests) >= swrl.limit {
		swrl.requests[key] = validRequests
		return false
	}
	
	// Add new request
	validRequests = append(validRequests, now)
	swrl.requests[key] = validRequests
	
	return true
}

// GetStats returns sliding window rate limiter statistics
func (swrl *SlidingWindowRateLimiter) GetStats() map[string]interface{} {
	swrl.mutex.RLock()
	defer swrl.mutex.RUnlock()
	
	totalKeys := len(swrl.requests)
	totalRequests := 0
	
	now := time.Now()
	cutoff := now.Add(-swrl.window)
	
	for _, requests := range swrl.requests {
		for _, reqTime := range requests {
			if reqTime.After(cutoff) {
				totalRequests++
			}
		}
	}
	
	return map[string]interface{}{
		"total_keys":     totalKeys,
		"total_requests": totalRequests,
		"limit":          swrl.limit,
		"window":         swrl.window.String(),
	}
}

// RateLimitConfig provides configuration for rate limiting
type RateLimitConfig struct {
	GlobalLimit    int           `json:"global_limit"`
	GlobalWindow   time.Duration `json:"global_window"`
	PerIPLimit     int           `json:"per_ip_limit"`
	PerIPWindow    time.Duration `json:"per_ip_window"`
	PerUserLimit   int           `json:"per_user_limit"`
	PerUserWindow  time.Duration `json:"per_user_window"`
	BurstLimit     int           `json:"burst_limit"`
	BurstWindow    time.Duration `json:"burst_window"`
}

// DefaultRateLimitConfig returns default rate limiting configuration
func DefaultRateLimitConfig() *RateLimitConfig {
	return &RateLimitConfig{
		GlobalLimit:   1000,           // 1000 requests
		GlobalWindow:  1 * time.Minute, // per minute
		PerIPLimit:    100,            // 100 requests
		PerIPWindow:   1 * time.Minute, // per minute
		PerUserLimit:  50,             // 50 requests
		PerUserWindow: 1 * time.Minute, // per minute
		BurstLimit:    10,             // 10 requests
		BurstWindow:   10 * time.Second, // per 10 seconds
	}
}

// RateLimitManager manages multiple rate limiters
type RateLimitManager struct {
	config      *RateLimitConfig
	globalLimiter *RateLimiter
	ipLimiters    map[string]*RateLimiter
	userLimiters  map[string]*RateLimiter
	burstLimiter  *RateLimiter
	mutex         sync.RWMutex
}

// NewRateLimitManager creates a new rate limit manager
func NewRateLimitManager(config *RateLimitConfig) *RateLimitManager {
	return &RateLimitManager{
		config:        config,
		globalLimiter: NewRateLimiter(config.GlobalLimit, config.GlobalWindow),
		ipLimiters:    make(map[string]*RateLimiter),
		userLimiters:  make(map[string]*RateLimiter),
		burstLimiter:  NewRateLimiter(config.BurstLimit, config.BurstWindow),
	}
}

// Allow checks if a request is allowed
func (rlm *RateLimitManager) Allow(ip, userID string) bool {
	// Check global limit
	if !rlm.globalLimiter.Allow("global") {
		return false
	}
	
	// Check burst limit
	if !rlm.burstLimiter.Allow("burst") {
		return false
	}
	
	// Check IP limit
	rlm.mutex.Lock()
	ipLimiter, exists := rlm.ipLimiters[ip]
	if !exists {
		ipLimiter = NewRateLimiter(rlm.config.PerIPLimit, rlm.config.PerIPWindow)
		rlm.ipLimiters[ip] = ipLimiter
	}
	rlm.mutex.Unlock()
	
	if !ipLimiter.Allow(ip) {
		return false
	}
	
	// Check user limit if userID is provided
	if userID != "" {
		rlm.mutex.Lock()
		userLimiter, exists := rlm.userLimiters[userID]
		if !exists {
			userLimiter = NewRateLimiter(rlm.config.PerUserLimit, rlm.config.PerUserWindow)
			rlm.userLimiters[userID] = userLimiter
		}
		rlm.mutex.Unlock()
		
		if !userLimiter.Allow(userID) {
			return false
		}
	}
	
	return true
}

// GetStats returns rate limiting statistics
func (rlm *RateLimitManager) GetStats() map[string]interface{} {
	rlm.mutex.RLock()
	defer rlm.mutex.RUnlock()
	
	stats := make(map[string]interface{})
	stats["global"] = rlm.globalLimiter.GetStats()
	stats["burst"] = rlm.burstLimiter.GetStats()
	stats["ip_limiters"] = len(rlm.ipLimiters)
	stats["user_limiters"] = len(rlm.userLimiters)
	
	return stats
}

// Cleanup removes old rate limiters
func (rlm *RateLimitManager) Cleanup() {
	rlm.mutex.Lock()
	defer rlm.mutex.Unlock()
	
	// Cleanup global and burst limiters
	rlm.globalLimiter.Cleanup()
	rlm.burstLimiter.Cleanup()
	
	// Cleanup IP limiters
	for ip, limiter := range rlm.ipLimiters {
		limiter.Cleanup()
		if len(limiter.requests) == 0 {
			delete(rlm.ipLimiters, ip)
		}
	}
	
	// Cleanup user limiters
	for userID, limiter := range rlm.userLimiters {
		limiter.Cleanup()
		if len(limiter.requests) == 0 {
			delete(rlm.userLimiters, userID)
		}
	}
}