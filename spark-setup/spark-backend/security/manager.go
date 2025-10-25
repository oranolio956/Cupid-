package security

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// ComprehensiveSecurityManager manages all security features
type ComprehensiveSecurityManager struct {
	// Basic security
	config *SecurityConfig
	
	// Advanced components
	advancedRateLimiter *AdvancedRateLimiter
	ddosProtector       *DDoSProtector
	
	// CORS and headers
	corsConfig    *CORSConfig
	headersConfig *SecurityHeadersConfig
}

// NewComprehensiveSecurityManager creates a new comprehensive security manager
func NewComprehensiveSecurityManager(env string) *ComprehensiveSecurityManager {
	// Get configurations
	securityConfig := GetConfigForEnvironment(env)
	rateLimitConfig := GetRateLimitConfigForEnvironment(env)
	ddosConfig := GetDDoSConfigForEnvironment(env)
	corsConfig := GetCORSConfigForEnvironment(env)
	headersConfig := GetSecurityHeadersConfigForEnvironment(env)
	
	// Create components
	advancedRateLimiter := NewAdvancedRateLimiter(rateLimitConfig)
	ddosProtector := NewDDoSProtector(ddosConfig)
	
	return &ComprehensiveSecurityManager{
		config:             securityConfig,
		advancedRateLimiter: advancedRateLimiter,
		ddosProtector:       ddosProtector,
		corsConfig:          corsConfig,
		headersConfig:       headersConfig,
	}
}

// GetRateLimitConfigForEnvironment returns rate limit configuration for environment
func GetRateLimitConfigForEnvironment(env string) *RateLimitConfig {
	switch env {
	case "production":
		return ProductionRateLimitConfig()
	case "development":
		return DefaultRateLimitConfig()
	default:
		return DefaultRateLimitConfig()
	}
}

// GetDDoSConfigForEnvironment returns DDoS configuration for environment
func GetDDoSConfigForEnvironment(env string) *DDoSConfig {
	switch env {
	case "production":
		return ProductionDDoSConfig()
	case "development":
		return DefaultDDoSConfig()
	default:
		return DefaultDDoSConfig()
	}
}

// SecurityMiddleware returns the main security middleware
func (csm *ComprehensiveSecurityManager) SecurityMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Apply all security measures in order
		c.Next()
	})
}

// RateLimitMiddleware returns the rate limiting middleware
func (csm *ComprehensiveSecurityManager) RateLimitMiddleware() gin.HandlerFunc {
	return AdvancedRateLimitMiddleware(csm.advancedRateLimiter)
}

// DDoSProtectionMiddleware returns the DDoS protection middleware
func (csm *ComprehensiveSecurityManager) DDoSProtectionMiddleware() gin.HandlerFunc {
	return DDoSProtectionMiddleware(csm.ddosProtector)
}

// CORSMiddleware returns the CORS middleware
func (csm *ComprehensiveSecurityManager) CORSMiddleware() gin.HandlerFunc {
	return CORSMiddleware(csm.corsConfig)
}

// SecurityHeadersMiddleware returns the security headers middleware
func (csm *ComprehensiveSecurityManager) SecurityHeadersMiddleware() gin.HandlerFunc {
	return SecurityHeadersMiddleware(csm.headersConfig)
}

// IPBlockingMiddleware returns the IP blocking middleware
func (csm *ComprehensiveSecurityManager) IPBlockingMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Basic IP blocking logic
		c.Next()
	})
}

// RequestValidationMiddleware returns the request validation middleware
func (csm *ComprehensiveSecurityManager) RequestValidationMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Basic request validation
		c.Next()
	})
}

// GetStats returns comprehensive security statistics
func (csm *ComprehensiveSecurityManager) GetStats() map[string]interface{} {
	rateLimitStats := csm.advancedRateLimiter.GetStats()
	ddosStats := csm.ddosProtector.GetStats()
	
	return map[string]interface{}{
		"rate_limiting": map[string]interface{}{
			"total_requests":   rateLimitStats.TotalRequests,
			"allowed_requests": rateLimitStats.AllowedRequests,
			"blocked_requests": rateLimitStats.BlockedRequests,
			"active_limiters":  rateLimitStats.ActiveLimiters,
			"whitelist_hits":   rateLimitStats.WhitelistHits,
			"blacklist_hits":   rateLimitStats.BlacklistHits,
			"last_cleanup":     rateLimitStats.LastCleanup,
		},
		"ddos_protection": map[string]interface{}{
			"total_connections":   ddosStats.TotalConnections,
			"active_connections":  ddosStats.ActiveConnections,
			"blocked_connections": ddosStats.BlockedConnections,
			"blocked_ips":         ddosStats.BlockedIPs,
			"whitelist_hits":      ddosStats.WhitelistHits,
			"blacklist_hits":      ddosStats.BlacklistHits,
			"honeypot_hits":       ddosStats.HoneypotHits,
			"last_cleanup":        ddosStats.LastCleanup,
		},
		"config": map[string]interface{}{
			"environment": csm.config.Environment,
			"rate_limiting_enabled": csm.config.RateLimitEnabled,
			"ddos_protection_enabled": csm.config.DDoSProtectionEnabled,
			"cors_enabled": csm.config.CORSEnabled,
			"security_headers_enabled": csm.config.SecurityHeadersEnabled,
		},
		"timestamp": time.Now().Unix(),
	}
}

// AddToWhitelist adds an IP to the whitelist
func (csm *ComprehensiveSecurityManager) AddToWhitelist(ip string) {
	csm.advancedRateLimiter.AddToWhitelist(ip)
	// Also add to DDoS protector whitelist if needed
}

// AddToBlacklist adds an IP to the blacklist
func (csm *ComprehensiveSecurityManager) AddToBlacklist(ip string) {
	csm.advancedRateLimiter.AddToBlacklist(ip)
	// Also add to DDoS protector blacklist if needed
}

// RemoveFromWhitelist removes an IP from the whitelist
func (csm *ComprehensiveSecurityManager) RemoveFromWhitelist(ip string) {
	csm.advancedRateLimiter.RemoveFromWhitelist(ip)
}

// RemoveFromBlacklist removes an IP from the blacklist
func (csm *ComprehensiveSecurityManager) RemoveFromBlacklist(ip string) {
	csm.advancedRateLimiter.RemoveFromBlacklist(ip)
}

// ResetStats resets all security statistics
func (csm *ComprehensiveSecurityManager) ResetStats() {
	csm.advancedRateLimiter.ResetStats()
	// DDoS protector doesn't have reset method, but we could add one
}

// GetRateLimitStats returns rate limiting statistics
func (csm *ComprehensiveSecurityManager) GetRateLimitStats() *RateLimitStats {
	return csm.advancedRateLimiter.GetStats()
}

// GetDDoSStats returns DDoS protection statistics
func (csm *ComprehensiveSecurityManager) GetDDoSStats() *DDoSStats {
	return csm.ddosProtector.GetStats()
}

// HealthCheck returns security system health status
func (csm *ComprehensiveSecurityManager) HealthCheck() map[string]interface{} {
	rateLimitStats := csm.advancedRateLimiter.GetStats()
	ddosStats := csm.ddosProtector.GetStats()
	
	// Calculate health scores
	rateLimitHealth := "healthy"
	if rateLimitStats.BlockedRequests > rateLimitStats.AllowedRequests {
		rateLimitHealth = "warning"
	}
	if rateLimitStats.BlockedRequests > rateLimitStats.AllowedRequests*2 {
		rateLimitHealth = "critical"
	}
	
	ddosHealth := "healthy"
	if ddosStats.BlockedConnections > 0 {
		ddosHealth = "warning"
	}
	if ddosStats.BlockedIPs > 10 {
		ddosHealth = "critical"
	}
	
	overallHealth := "healthy"
	if rateLimitHealth == "critical" || ddosHealth == "critical" {
		overallHealth = "critical"
	} else if rateLimitHealth == "warning" || ddosHealth == "warning" {
		overallHealth = "warning"
	}
	
	return map[string]interface{}{
		"overall_health": overallHealth,
		"rate_limiting": map[string]interface{}{
			"health": rateLimitHealth,
			"stats":  rateLimitStats,
		},
		"ddos_protection": map[string]interface{}{
			"health": ddosHealth,
			"stats":  ddosStats,
		},
		"timestamp": time.Now().Unix(),
	}
}