package security

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// SecurityConfig holds security configuration
type SecurityConfig struct {
	// Rate limiting
	RateLimitEnabled    bool          `json:"rate_limit_enabled"`
	RateLimitRPS        int           `json:"rate_limit_rps"`
	RateLimitBurst      int           `json:"rate_limit_burst"`
	RateLimitWindow     time.Duration `json:"rate_limit_window"`
	
	// IP blocking
	IPBlockingEnabled   bool          `json:"ip_blocking_enabled"`
	MaxFailedAttempts   int           `json:"max_failed_attempts"`
	BlockDuration       time.Duration `json:"block_duration"`
	
	// Security headers
	SecurityHeadersEnabled bool `json:"security_headers_enabled"`
	
	// CORS
	CORSEnabled         bool     `json:"cors_enabled"`
	AllowedOrigins      []string `json:"allowed_origins"`
	AllowedMethods      []string `json:"allowed_methods"`
	AllowedHeaders      []string `json:"allowed_headers"`
	
	// Request validation
	MaxRequestSize      int64    `json:"max_request_size"`
	ValidateUserAgent   bool     `json:"validate_user_agent"`
	BlockSuspiciousUA   bool     `json:"block_suspicious_ua"`
	
	// DDoS protection
	DDoSProtectionEnabled bool   `json:"ddos_protection_enabled"`
	MaxConcurrentConns   int     `json:"max_concurrent_conns"`
	ConnectionTimeout    time.Duration `json:"connection_timeout"`
}

// DefaultSecurityConfig returns default security configuration
func DefaultSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimitEnabled:      true,
		RateLimitRPS:          100,
		RateLimitBurst:        200,
		RateLimitWindow:       1 * time.Minute,
		
		IPBlockingEnabled:     true,
		MaxFailedAttempts:     5,
		BlockDuration:         15 * time.Minute,
		
		SecurityHeadersEnabled: true,
		
		CORSEnabled:           true,
		AllowedOrigins:        []string{"https://spark-rat-dashboard.vercel.app"},
		AllowedMethods:        []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:        []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		
		MaxRequestSize:        10 * 1024 * 1024, // 10MB
		ValidateUserAgent:     true,
		BlockSuspiciousUA:     true,
		
		DDoSProtectionEnabled: true,
		MaxConcurrentConns:    1000,
		ConnectionTimeout:     30 * time.Second,
	}
}

// SecurityManager manages security features
type SecurityManager struct {
	config        *SecurityConfig
	rateLimiters  map[string]*rate.Limiter
	blockedIPs    map[string]time.Time
	failedAttempts map[string]int
	lastCleanup   time.Time
}

// NewSecurityManager creates a new security manager
func NewSecurityManager(config *SecurityConfig) *SecurityManager {
	sm := &SecurityManager{
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

// SecurityMiddleware returns the main security middleware
func (sm *SecurityManager) SecurityMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get client IP
		clientIP := sm.getClientIP(c)
		
		// Check if IP is blocked
		if sm.isIPBlocked(clientIP) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "IP address is blocked",
				"code":  "IP_BLOCKED",
			})
			return
		}
		
		// Apply security headers
		if sm.config.SecurityHeadersEnabled {
			sm.setSecurityHeaders(c)
		}
		
		// Handle CORS
		if sm.config.CORSEnabled {
			sm.handleCORS(c)
		}
		
		// Validate request size
		if c.Request.ContentLength > sm.config.MaxRequestSize {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request too large",
				"code":  "REQUEST_TOO_LARGE",
			})
			return
		}
		
		// Validate User-Agent
		if sm.config.ValidateUserAgent {
			if !sm.validateUserAgent(c) {
				sm.recordFailedAttempt(clientIP)
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
					"error": "Invalid User-Agent",
					"code":  "INVALID_USER_AGENT",
				})
				return
			}
		}
		
		// Apply rate limiting
		if sm.config.RateLimitEnabled {
			if !sm.allowRequest(clientIP) {
				sm.recordFailedAttempt(clientIP)
				c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
					"error": "Rate limit exceeded",
					"code":  "RATE_LIMIT_EXCEEDED",
				})
				return
			}
		}
		
		// Continue to next handler
		c.Next()
	})
}

// getClientIP extracts the real client IP
func (sm *SecurityManager) getClientIP(c *gin.Context) string {
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

// isIPBlocked checks if an IP is blocked
func (sm *SecurityManager) isIPBlocked(ip string) bool {
	if !sm.config.IPBlockingEnabled {
		return false
	}
	
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

// recordFailedAttempt records a failed attempt
func (sm *SecurityManager) recordFailedAttempt(ip string) {
	if !sm.config.IPBlockingEnabled {
		return
	}
	
	sm.failedAttempts[ip]++
	
	if sm.failedAttempts[ip] >= sm.config.MaxFailedAttempts {
		sm.blockedIPs[ip] = time.Now().Add(sm.config.BlockDuration)
	}
}

// allowRequest checks if a request is allowed based on rate limiting
func (sm *SecurityManager) allowRequest(ip string) bool {
	limiter, exists := sm.rateLimiters[ip]
	if !exists {
		limiter = rate.NewLimiter(rate.Limit(sm.config.RateLimitRPS), sm.config.RateLimitBurst)
		sm.rateLimiters[ip] = limiter
	}
	
	return limiter.Allow()
}

// setSecurityHeaders sets security headers
func (sm *SecurityManager) setSecurityHeaders(c *gin.Context) {
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
	csp := "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' wss:; frame-ancestors 'none';"
	c.Header("Content-Security-Policy", csp)
	
	// Permissions-Policy
	c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
	
	// X-Permitted-Cross-Domain-Policies
	c.Header("X-Permitted-Cross-Domain-Policies", "none")
}

// handleCORS handles CORS headers
func (sm *SecurityManager) handleCORS(c *gin.Context) {
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
	
	// Handle preflight requests
	if c.Request.Method == "OPTIONS" {
		c.AbortWithStatus(http.StatusNoContent)
		return
	}
}

// validateUserAgent validates the User-Agent header
func (sm *SecurityManager) validateUserAgent(c *gin.Context) bool {
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
			"sqlmap", "nikto", "nmap",
		}
		
		uaLower := strings.ToLower(ua)
		for _, pattern := range suspiciousPatterns {
			if strings.Contains(uaLower, pattern) {
				return false
			}
		}
	}
	
	// Check for valid User-Agent patterns
	validPatterns := []string{
		"Mozilla", "Chrome", "Firefox", "Safari", "Edge",
		"Spark", "SparkClient",
	}
	
	uaLower := strings.ToLower(ua)
	for _, pattern := range validPatterns {
		if strings.Contains(uaLower, strings.ToLower(pattern)) {
			return true
		}
	}
	
	return true // Allow by default if no patterns match
}

// cleanup removes old entries
func (sm *SecurityManager) cleanup() {
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
		for ip, limiter := range sm.rateLimiters {
			// If limiter hasn't been used recently, remove it
			if now.Sub(sm.lastCleanup) > 1*time.Hour {
				delete(sm.rateLimiters, ip)
			}
		}
		
		sm.lastCleanup = now
	}
}

// GetStats returns security statistics
func (sm *SecurityManager) GetStats() map[string]interface{} {
	return map[string]interface{}{
		"blocked_ips":        len(sm.blockedIPs),
		"failed_attempts":    len(sm.failedAttempts),
		"rate_limiters":      len(sm.rateLimiters),
		"config":            sm.config,
	}
}

// GenerateSecureToken generates a secure random token
func GenerateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// HashPassword hashes a password using SHA-256
func HashPassword(password, salt string) string {
	hash := sha256.Sum256([]byte(password + salt))
	return hex.EncodeToString(hash[:])
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}
	
	if len(password) > 128 {
		return fmt.Errorf("password must be less than 128 characters long")
	}
	
	// Check for at least one uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUpper {
		return fmt.Errorf("password must contain at least one uppercase letter")
	}
	
	// Check for at least one lowercase letter
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	if !hasLower {
		return fmt.Errorf("password must contain at least one lowercase letter")
	}
	
	// Check for at least one digit
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasDigit {
		return fmt.Errorf("password must contain at least one digit")
	}
	
	// Check for at least one special character
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	if !hasSpecial {
		return fmt.Errorf("password must contain at least one special character")
	}
	
	return nil
}

// SanitizeInput sanitizes user input
func SanitizeInput(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")
	
	// Remove control characters except newlines and tabs
	input = regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]`).ReplaceAllString(input, "")
	
	// Trim whitespace
	input = strings.TrimSpace(input)
	
	return input
}

// ValidateIP validates an IP address
func ValidateIP(ip string) bool {
	return net.ParseIP(ip) != nil
}

// IsPrivateIP checks if an IP is private
func IsPrivateIP(ip string) bool {
	parsedIP := net.ParseIP(ip)
	if parsedIP == nil {
		return false
	}
	
	privateRanges := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
		"127.0.0.0/8",
		"::1/128",
		"fc00::/7",
	}
	
	for _, cidr := range privateRanges {
		_, network, err := net.ParseCIDR(cidr)
		if err != nil {
			continue
		}
		if network.Contains(parsedIP) {
			return true
		}
	}
	
	return false
}