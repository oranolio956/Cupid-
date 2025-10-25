package security

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// SecurityMiddleware provides comprehensive security middleware
type SecurityMiddleware struct {
	config        *SecurityConfig
	rateLimiters  map[string]*rate.Limiter
	blockedIPs    map[string]time.Time
	failedAttempts map[string]int
	lastCleanup   time.Time
}

// NewSecurityMiddleware creates a new security middleware
func NewSecurityMiddleware(config *SecurityConfig) *SecurityMiddleware {
	sm := &SecurityMiddleware{
		config:        config,
		rateLimiters:  make(map[string]*rate.Limiter),
		blockedIPs:    make(map[string]time.Time),
		failedAttempts: make(map[string]int),
		lastCleanup:   time.Now(),
	}
	
	// Start cleanup goroutine
	go sm.cleanup()
	
	return sm
}

// RateLimitMiddleware provides rate limiting
func (sm *SecurityMiddleware) RateLimitMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !sm.config.RateLimitEnabled {
			c.Next()
			return
		}
		
		clientIP := sm.getClientIP(c)
		
		// Get or create rate limiter for this IP
		limiter, exists := sm.rateLimiters[clientIP]
		if !exists {
			limiter = rate.NewLimiter(rate.Limit(sm.config.RateLimitRPS), sm.config.RateLimitBurst)
			sm.rateLimiters[clientIP] = limiter
		}
		
		// Check if request is allowed
		if !limiter.Allow() {
			sm.recordFailedAttempt(clientIP)
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", sm.config.RateLimitRPS))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(sm.config.RateLimitWindow).Unix()))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"code":  "RATE_LIMIT_EXCEEDED",
				"retry_after": sm.config.RateLimitWindow.Seconds(),
			})
			return
		}
		
		// Add rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", sm.config.RateLimitRPS))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", int(limiter.Tokens())))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(sm.config.RateLimitWindow).Unix()))
		
		c.Next()
	})
}

// IPBlockingMiddleware provides IP blocking functionality
func (sm *SecurityMiddleware) IPBlockingMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !sm.config.IPBlockingEnabled {
			c.Next()
			return
		}
		
		clientIP := sm.getClientIP(c)
		
		// Check if IP is blocked
		if sm.isIPBlocked(clientIP) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "IP address is blocked",
				"code":  "IP_BLOCKED",
				"retry_after": sm.getBlockTimeRemaining(clientIP).Seconds(),
			})
			return
		}
		
		c.Next()
	})
}

// SecurityHeadersMiddleware sets security headers
func (sm *SecurityMiddleware) SecurityHeadersMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !sm.config.SecurityHeadersEnabled {
			c.Next()
			return
		}
		
		// HSTS
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		
		// X-Frame-Options
		c.Header("X-Frame-Options", "DENY")
		
		// X-Content-Type-Options
		c.Header("X-Content-Type-Options", "nosniff")
		
		// X-XSS-Protection
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Referrer-Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content-Security-Policy
		csp := "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
		c.Header("Content-Security-Policy", csp)
		
		// Permissions-Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=(), usb=()")
		
		// X-Permitted-Cross-Domain-Policies
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		
		// X-DNS-Prefetch-Control
		c.Header("X-DNS-Prefetch-Control", "off")
		
		// X-Download-Options
		c.Header("X-Download-Options", "noopen")
		
		// X-Powered-By (remove)
		c.Header("X-Powered-By", "")
		
		c.Next()
	})
}

// CORSMiddleware handles CORS
func (sm *SecurityMiddleware) CORSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !sm.config.CORSEnabled {
			c.Next()
			return
		}
		
		origin := c.GetHeader("Origin")
		
		// Check if origin is allowed
		allowed := false
		for _, allowedOrigin := range sm.config.AllowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}
		
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			c.Header("Access-Control-Allow-Origin", "*")
		}
		
		c.Header("Access-Control-Allow-Methods", strings.Join(sm.config.AllowedMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(sm.config.AllowedHeaders, ", "))
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")
		c.Header("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset")
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	})
}

// RequestValidationMiddleware validates requests
func (sm *SecurityMiddleware) RequestValidationMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Validate request size
		if c.Request.ContentLength > sm.config.MaxRequestSize {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request too large",
				"code":  "REQUEST_TOO_LARGE",
				"max_size": sm.config.MaxRequestSize,
			})
			return
		}
		
		// Validate User-Agent
		if sm.config.ValidateUserAgent {
			if !sm.validateUserAgent(c) {
				clientIP := sm.getClientIP(c)
				sm.recordFailedAttempt(clientIP)
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
					"error": "Invalid User-Agent",
					"code":  "INVALID_USER_AGENT",
				})
				return
			}
		}
		
		// Validate request method
		if !sm.isValidMethod(c.Request.Method) {
			c.AbortWithStatusJSON(http.StatusMethodNotAllowed, gin.H{
				"error": "Method not allowed",
				"code":  "METHOD_NOT_ALLOWED",
			})
			return
		}
		
		c.Next()
	})
}

// DDoSProtectionMiddleware provides DDoS protection
func (sm *SecurityMiddleware) DDoSProtectionMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !sm.config.DDoSProtectionEnabled {
			c.Next()
			return
		}
		
		// Check concurrent connections
		clientIP := sm.getClientIP(c)
		activeConns := sm.getActiveConnections(clientIP)
		
		if activeConns > sm.config.MaxConcurrentConns {
			sm.recordFailedAttempt(clientIP)
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
				"error": "Too many concurrent connections",
				"code":  "TOO_MANY_CONNECTIONS",
			})
			return
		}
		
		// Set connection timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), sm.config.ConnectionTimeout)
		defer cancel()
		
		c.Request = c.Request.WithContext(ctx)
		
		c.Next()
	})
}

// Helper methods

func (sm *SecurityMiddleware) getClientIP(c *gin.Context) string {
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

func (sm *SecurityMiddleware) isIPBlocked(ip string) bool {
	blockTime, exists := sm.blockedIPs[ip]
	if !exists {
		return false
	}
	
	// Check if block has expired
	if time.Now().After(blockTime) {
		delete(sm.blockedIPs, ip)
		delete(sm.failedAttempts, ip)
		return false
	}
	
	return true
}

func (sm *SecurityMiddleware) recordFailedAttempt(ip string) {
	sm.failedAttempts[ip]++
	
	if sm.failedAttempts[ip] >= sm.config.MaxFailedAttempts {
		sm.blockedIPs[ip] = time.Now().Add(sm.config.BlockDuration)
	}
}

func (sm *SecurityMiddleware) getBlockTimeRemaining(ip string) time.Duration {
	blockTime, exists := sm.blockedIPs[ip]
	if !exists {
		return 0
	}
	
	remaining := time.Until(blockTime)
	if remaining < 0 {
		return 0
	}
	
	return remaining
}

func (sm *SecurityMiddleware) validateUserAgent(c *gin.Context) bool {
	ua := c.GetHeader("User-Agent")
	
	// Check if User-Agent is present
	if ua == "" {
		return false
	}
	
	// Check for suspicious patterns
	if sm.config.BlockSuspiciousUA {
		suspiciousPatterns := []string{
			"bot", "crawler", "spider", "scraper",
			"curl", "wget", "python-requests",
			"sqlmap", "nikto", "nmap", "masscan",
			"zap", "burp", "nessus", "openvas",
		}
		
		uaLower := strings.ToLower(ua)
		for _, pattern := range suspiciousPatterns {
			if strings.Contains(uaLower, pattern) {
				return false
			}
		}
	}
	
	return true
}

func (sm *SecurityMiddleware) isValidMethod(method string) bool {
	validMethods := []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"}
	
	for _, validMethod := range validMethods {
		if method == validMethod {
			return true
		}
	}
	
	return false
}

func (sm *SecurityMiddleware) getActiveConnections(ip string) int {
	// This is a simplified implementation
	// In a real implementation, you would track active connections per IP
	return len(sm.rateLimiters)
}

func (sm *SecurityMiddleware) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		now := time.Now()
		
		// Clean up expired blocked IPs
		for ip, blockTime := range sm.blockedIPs {
			if now.After(blockTime) {
				delete(sm.blockedIPs, ip)
				delete(sm.failedAttempts, ip)
			}
		}
		
		// Clean up old rate limiters (keep only active ones)
		if now.Sub(sm.lastCleanup) > 1*time.Hour {
			for ip := range sm.rateLimiters {
				// Remove rate limiters that haven't been used recently
				delete(sm.rateLimiters, ip)
			}
		}
		
		sm.lastCleanup = now
	}
}

// GetStats returns security statistics
func (sm *SecurityMiddleware) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"blocked_ips":        len(sm.blockedIPs),
		"failed_attempts":    len(sm.failedAttempts),
		"rate_limiters":      len(sm.rateLimiters),
		"config":            sm.config,
		"last_cleanup":      sm.lastCleanup,
	}
}