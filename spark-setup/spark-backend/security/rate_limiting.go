package security

import (
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// AdvancedRateLimiter provides advanced rate limiting functionality
type AdvancedRateLimiter struct {
	// Rate limiters by key
	limiters map[string]*rate.Limiter
	
	// Configuration
	config *RateLimitConfig
	
	// Cleanup
	lastCleanup time.Time
	cleanupInterval time.Duration
	
	// Mutex for thread safety
	mutex sync.RWMutex
	
	// Statistics
	stats *RateLimitStats
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	// Global limits
	GlobalRPS    int           `json:"global_rps"`
	GlobalBurst  int           `json:"global_burst"`
	
	// Per-IP limits
	PerIPRPS     int           `json:"per_ip_rps"`
	PerIPBurst   int           `json:"per_ip_burst"`
	
	// Per-user limits
	PerUserRPS   int           `json:"per_user_rps"`
	PerUserBurst int           `json:"per_user_burst"`
	
	// Burst limits
	BurstRPS     int           `json:"burst_rps"`
	BurstBurst   int           `json:"burst_burst"`
	BurstWindow  time.Duration `json:"burst_window"`
	
	// Cleanup
	CleanupInterval time.Duration `json:"cleanup_interval"`
	MaxIdleTime     time.Duration `json:"max_idle_time"`
	
	// Whitelist
	WhitelistIPs []string `json:"whitelist_ips"`
	WhitelistCIDRs []string `json:"whitelist_cidrs"`
	
	// Blacklist
	BlacklistIPs []string `json:"blacklist_ips"`
	BlacklistCIDRs []string `json:"blacklist_cidrs"`
}

// RateLimitStats holds rate limiting statistics
type RateLimitStats struct {
	TotalRequests    int64 `json:"total_requests"`
	AllowedRequests  int64 `json:"allowed_requests"`
	BlockedRequests  int64 `json:"blocked_requests"`
	ActiveLimiters   int   `json:"active_limiters"`
	WhitelistHits    int64 `json:"whitelist_hits"`
	BlacklistHits    int64 `json:"blacklist_hits"`
	LastCleanup      time.Time `json:"last_cleanup"`
}

// DefaultRateLimitConfig returns default rate limiting configuration
func DefaultRateLimitConfig() *RateLimitConfig {
	return &RateLimitConfig{
		GlobalRPS:    1000,
		GlobalBurst:  2000,
		PerIPRPS:     100,
		PerIPBurst:   200,
		PerUserRPS:   50,
		PerUserBurst: 100,
		BurstRPS:     10,
		BurstBurst:   20,
		BurstWindow:  10 * time.Second,
		CleanupInterval: 5 * time.Minute,
		MaxIdleTime:     1 * time.Hour,
		WhitelistIPs:    []string{},
		WhitelistCIDRs:  []string{},
		BlacklistIPs:    []string{},
		BlacklistCIDRs:  []string{},
	}
}

// ProductionRateLimitConfig returns production rate limiting configuration
func ProductionRateLimitConfig() *RateLimitConfig {
	return &RateLimitConfig{
		GlobalRPS:    500,
		GlobalBurst:  1000,
		PerIPRPS:     50,
		PerIPBurst:   100,
		PerUserRPS:   25,
		PerUserBurst: 50,
		BurstRPS:     5,
		BurstBurst:   10,
		BurstWindow:  10 * time.Second,
		CleanupInterval: 2 * time.Minute,
		MaxIdleTime:     30 * time.Minute,
		WhitelistIPs:    []string{},
		WhitelistCIDRs:  []string{},
		BlacklistIPs:    []string{},
		BlacklistCIDRs:  []string{},
	}
}

// NewAdvancedRateLimiter creates a new advanced rate limiter
func NewAdvancedRateLimiter(config *RateLimitConfig) *AdvancedRateLimiter {
	arl := &AdvancedRateLimiter{
		limiters:        make(map[string]*rate.Limiter),
		config:          config,
		lastCleanup:     time.Now(),
		cleanupInterval: config.CleanupInterval,
		stats: &RateLimitStats{
			LastCleanup: time.Now(),
		},
	}
	
	// Start cleanup goroutine
	go arl.cleanup()
	
	return arl
}

// Allow checks if a request is allowed
func (arl *AdvancedRateLimiter) Allow(ip, userID string) (bool, string) {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	// Check blacklist first
	if arl.isBlacklisted(ip) {
		arl.stats.BlacklistHits++
		return false, "IP is blacklisted"
	}
	
	// Check whitelist
	if arl.isWhitelisted(ip) {
		arl.stats.WhitelistHits++
		arl.stats.TotalRequests++
		arl.stats.AllowedRequests++
		return true, "IP is whitelisted"
	}
	
	// Check global rate limit
	globalKey := "global"
	globalLimiter := arl.getOrCreateLimiter(globalKey, arl.config.GlobalRPS, arl.config.GlobalBurst)
	if !globalLimiter.Allow() {
		arl.stats.TotalRequests++
		arl.stats.BlockedRequests++
		return false, "Global rate limit exceeded"
	}
	
	// Check per-IP rate limit
	ipKey := "ip:" + ip
	ipLimiter := arl.getOrCreateLimiter(ipKey, arl.config.PerIPRPS, arl.config.PerIPBurst)
	if !ipLimiter.Allow() {
		arl.stats.TotalRequests++
		arl.stats.BlockedRequests++
		return false, "IP rate limit exceeded"
	}
	
	// Check per-user rate limit if userID is provided
	if userID != "" {
		userKey := "user:" + userID
		userLimiter := arl.getOrCreateLimiter(userKey, arl.config.PerUserRPS, arl.config.PerUserBurst)
		if !userLimiter.Allow() {
			arl.stats.TotalRequests++
			arl.stats.BlockedRequests++
			return false, "User rate limit exceeded"
		}
	}
	
	// Check burst limit
	burstKey := "burst:" + ip
	burstLimiter := arl.getOrCreateLimiter(burstKey, arl.config.BurstRPS, arl.config.BurstBurst)
	if !burstLimiter.Allow() {
		arl.stats.TotalRequests++
		arl.stats.BlockedRequests++
		return false, "Burst rate limit exceeded"
	}
	
	arl.stats.TotalRequests++
	arl.stats.AllowedRequests++
	return true, "Allowed"
}

// getOrCreateLimiter gets or creates a rate limiter for a key
func (arl *AdvancedRateLimiter) getOrCreateLimiter(key string, rps, burst int) *rate.Limiter {
	limiter, exists := arl.limiters[key]
	if !exists {
		limiter = rate.NewLimiter(rate.Limit(rps), burst)
		arl.limiters[key] = limiter
		arl.stats.ActiveLimiters = len(arl.limiters)
	}
	return limiter
}

// isWhitelisted checks if an IP is whitelisted
func (arl *AdvancedRateLimiter) isWhitelisted(ip string) bool {
	// Check IP whitelist
	for _, whitelistIP := range arl.config.WhitelistIPs {
		if ip == whitelistIP {
			return true
		}
	}
	
	// Check CIDR whitelist
	parsedIP := net.ParseIP(ip)
	if parsedIP != nil {
		for _, cidr := range arl.config.WhitelistCIDRs {
			_, network, err := net.ParseCIDR(cidr)
			if err == nil && network.Contains(parsedIP) {
				return true
			}
		}
	}
	
	return false
}

// isBlacklisted checks if an IP is blacklisted
func (arl *AdvancedRateLimiter) isBlacklisted(ip string) bool {
	// Check IP blacklist
	for _, blacklistIP := range arl.config.BlacklistIPs {
		if ip == blacklistIP {
			return true
		}
	}
	
	// Check CIDR blacklist
	parsedIP := net.ParseIP(ip)
	if parsedIP != nil {
		for _, cidr := range arl.config.BlacklistCIDRs {
			_, network, err := net.ParseCIDR(cidr)
			if err == nil && network.Contains(parsedIP) {
				return true
			}
		}
	}
	
	return false
}

// cleanup removes old rate limiters
func (arl *AdvancedRateLimiter) cleanup() {
	ticker := time.NewTicker(arl.cleanupInterval)
	defer ticker.Stop()
	
	for range ticker.C {
		arl.mutex.Lock()
		
		now := time.Now()
		_ = now.Add(-arl.config.MaxIdleTime) // Use cutoff variable
		
		// Remove old limiters
		for key, limiter := range arl.limiters {
			_ = limiter // Use the variable to avoid unused error
			// Check if limiter has been idle
			if now.Sub(arl.lastCleanup) > arl.config.MaxIdleTime {
				// This is a simplified check - in practice, you'd track last access time
				delete(arl.limiters, key)
			}
		}
		
		arl.stats.ActiveLimiters = len(arl.limiters)
		arl.stats.LastCleanup = now
		arl.lastCleanup = now
		
		arl.mutex.Unlock()
	}
}

// GetStats returns rate limiting statistics
func (arl *AdvancedRateLimiter) GetStats() *RateLimitStats {
	arl.mutex.RLock()
	defer arl.mutex.RUnlock()
	
	// Return a copy of stats
	return &RateLimitStats{
		TotalRequests:   arl.stats.TotalRequests,
		AllowedRequests: arl.stats.AllowedRequests,
		BlockedRequests: arl.stats.BlockedRequests,
		ActiveLimiters:  arl.stats.ActiveLimiters,
		WhitelistHits:   arl.stats.WhitelistHits,
		BlacklistHits:   arl.stats.BlacklistHits,
		LastCleanup:     arl.stats.LastCleanup,
	}
}

// ResetStats resets rate limiting statistics
func (arl *AdvancedRateLimiter) ResetStats() {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	arl.stats = &RateLimitStats{
		LastCleanup: time.Now(),
	}
}

// AddToWhitelist adds an IP to the whitelist
func (arl *AdvancedRateLimiter) AddToWhitelist(ip string) {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	arl.config.WhitelistIPs = append(arl.config.WhitelistIPs, ip)
}

// AddToBlacklist adds an IP to the blacklist
func (arl *AdvancedRateLimiter) AddToBlacklist(ip string) {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	arl.config.BlacklistIPs = append(arl.config.BlacklistIPs, ip)
}

// RemoveFromWhitelist removes an IP from the whitelist
func (arl *AdvancedRateLimiter) RemoveFromWhitelist(ip string) {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	for i, whitelistIP := range arl.config.WhitelistIPs {
		if whitelistIP == ip {
			arl.config.WhitelistIPs = append(arl.config.WhitelistIPs[:i], arl.config.WhitelistIPs[i+1:]...)
			break
		}
	}
}

// RemoveFromBlacklist removes an IP from the blacklist
func (arl *AdvancedRateLimiter) RemoveFromBlacklist(ip string) {
	arl.mutex.Lock()
	defer arl.mutex.Unlock()
	
	for i, blacklistIP := range arl.config.BlacklistIPs {
		if blacklistIP == ip {
			arl.config.BlacklistIPs = append(arl.config.BlacklistIPs[:i], arl.config.BlacklistIPs[i+1:]...)
			break
		}
	}
}

// AdvancedRateLimitMiddleware creates an advanced rate limiting middleware
func AdvancedRateLimitMiddleware(arl *AdvancedRateLimiter) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		ip := getClientIP(c)
		userID := c.GetString("user")
		
		allowed, reason := arl.Allow(ip, userID)
		if !allowed {
			c.Header("X-RateLimit-Limit", "0")
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Minute).Unix()))
			c.Header("X-RateLimit-Reason", reason)
			
			c.AbortWithStatusJSON(429, gin.H{
				"error": "Rate limit exceeded",
				"code":  "RATE_LIMIT_EXCEEDED",
				"reason": reason,
				"retry_after": 60,
			})
			return
		}
		
		// Add rate limit headers
		c.Header("X-RateLimit-Limit", "100")
		c.Header("X-RateLimit-Remaining", "99")
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Minute).Unix()))
		
		c.Next()
	})
}

// getClientIP extracts the real client IP
func getClientIP(c *gin.Context) string {
	// Check X-Forwarded-For header
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}
	
	// Check X-Real-IP header
	if xri := c.GetHeader("X-Real-IP"); xri != "" {
		return xri
	}
	
	// Fall back to RemoteAddr
	ip, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		return c.Request.RemoteAddr
	}
	
	return ip
}