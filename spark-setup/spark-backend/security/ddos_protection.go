package security

import (
	"context"
	"net"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// DDoSProtector provides DDoS protection functionality
type DDoSProtector struct {
	// Connection tracking
	connections map[string]*ConnectionInfo
	
	// Configuration
	config *DDoSConfig
	
	// Statistics
	stats *DDoSStats
	
	// Mutex for thread safety
	mutex sync.RWMutex
	
	// Cleanup
	lastCleanup time.Time
	cleanupInterval time.Duration
}

// ConnectionInfo holds information about a connection
type ConnectionInfo struct {
	IP            string
	LastSeen      time.Time
	RequestCount  int
	FirstSeen     time.Time
	IsBlocked     bool
	BlockReason   string
	BlockUntil    time.Time
}

// DDoSConfig holds DDoS protection configuration
type DDoSConfig struct {
	// Connection limits
	MaxConcurrentConns    int           `json:"max_concurrent_conns"`
	MaxConnsPerIP         int           `json:"max_conns_per_ip"`
	MaxRequestsPerMinute  int           `json:"max_requests_per_minute"`
	MaxRequestsPerSecond  int           `json:"max_requests_per_second"`
	
	// Timeouts
	ConnectionTimeout     time.Duration `json:"connection_timeout"`
	IdleTimeout          time.Duration `json:"idle_timeout"`
	BlockDuration        time.Duration `json:"block_duration"`
	
	// Detection thresholds
	SuspiciousThreshold  int           `json:"suspicious_threshold"`
	AttackThreshold      int           `json:"attack_threshold"`
	
	// Cleanup
	CleanupInterval      time.Duration `json:"cleanup_interval"`
	MaxIdleTime          time.Duration `json:"max_idle_time"`
	
	// Whitelist/Blacklist
	WhitelistIPs         []string      `json:"whitelist_ips"`
	WhitelistCIDRs       []string      `json:"whitelist_cidrs"`
	BlacklistIPs         []string      `json:"blacklist_ips"`
	BlacklistCIDRs       []string      `json:"blacklist_cidrs"`
	
	// Advanced protection
	EnableGeoBlocking     bool          `json:"enable_geo_blocking"`
	BlockedCountries      []string      `json:"blocked_countries"`
	EnableHoneypot        bool          `json:"enable_honeypot"`
	HoneypotPaths         []string      `json:"honeypot_paths"`
}

// DDoSStats holds DDoS protection statistics
type DDoSStats struct {
	TotalConnections     int64     `json:"total_connections"`
	ActiveConnections    int       `json:"active_connections"`
	BlockedConnections   int64     `json:"blocked_connections"`
	BlockedIPs           int       `json:"blocked_ips"`
	WhitelistHits        int64     `json:"whitelist_hits"`
	BlacklistHits        int64     `json:"blacklist_hits"`
	HoneypotHits         int64     `json:"honeypot_hits"`
	LastCleanup          time.Time `json:"last_cleanup"`
}

// DefaultDDoSConfig returns default DDoS protection configuration
func DefaultDDoSConfig() *DDoSConfig {
	return &DDoSConfig{
		MaxConcurrentConns:    1000,
		MaxConnsPerIP:         10,
		MaxRequestsPerMinute:  1000,
		MaxRequestsPerSecond:  50,
		ConnectionTimeout:     30 * time.Second,
		IdleTimeout:           5 * time.Minute,
		BlockDuration:         15 * time.Minute,
		SuspiciousThreshold:   100,
		AttackThreshold:       500,
		CleanupInterval:       1 * time.Minute,
		MaxIdleTime:           10 * time.Minute,
		WhitelistIPs:          []string{},
		WhitelistCIDRs:        []string{},
		BlacklistIPs:          []string{},
		BlacklistCIDRs:        []string{},
		EnableGeoBlocking:     false,
		BlockedCountries:      []string{},
		EnableHoneypot:        true,
		HoneypotPaths:         []string{"/admin", "/wp-admin", "/phpmyadmin", "/.env"},
	}
}

// ProductionDDoSConfig returns production DDoS protection configuration
func ProductionDDoSConfig() *DDoSConfig {
	return &DDoSConfig{
		MaxConcurrentConns:    500,
		MaxConnsPerIP:         5,
		MaxRequestsPerMinute:  500,
		MaxRequestsPerSecond:  25,
		ConnectionTimeout:     15 * time.Second,
		IdleTimeout:           2 * time.Minute,
		BlockDuration:         30 * time.Minute,
		SuspiciousThreshold:   50,
		AttackThreshold:       200,
		CleanupInterval:       30 * time.Second,
		MaxIdleTime:           5 * time.Minute,
		WhitelistIPs:          []string{},
		WhitelistCIDRs:        []string{},
		BlacklistIPs:          []string{},
		BlacklistCIDRs:        []string{},
		EnableGeoBlocking:     true,
		BlockedCountries:      []string{"CN", "RU", "KP"},
		EnableHoneypot:        true,
		HoneypotPaths:         []string{"/admin", "/wp-admin", "/phpmyadmin", "/.env", "/.git", "/backup"},
	}
}

// NewDDoSProtector creates a new DDoS protector
func NewDDoSProtector(config *DDoSConfig) *DDoSProtector {
	protector := &DDoSProtector{
		connections:     make(map[string]*ConnectionInfo),
		config:          config,
		stats: &DDoSStats{
			LastCleanup: time.Now(),
		},
		lastCleanup:     time.Now(),
		cleanupInterval: config.CleanupInterval,
	}
	
	// Start cleanup goroutine
	go protector.cleanup()
	
	return protector
}

// CheckConnection checks if a connection is allowed
func (ddp *DDoSProtector) CheckConnection(ip string, path string) (bool, string) {
	ddp.mutex.Lock()
	defer ddp.mutex.Unlock()
	
	// Check whitelist
	if ddp.isWhitelisted(ip) {
		ddp.stats.WhitelistHits++
		return true, "IP is whitelisted"
	}
	
	// Check blacklist
	if ddp.isBlacklisted(ip) {
		ddp.stats.BlacklistHits++
		return false, "IP is blacklisted"
	}
	
	// Check honeypot
	if ddp.isHoneypotPath(path) {
		ddp.stats.HoneypotHits++
		ddp.blockIP(ip, "Honeypot access detected")
		return false, "Honeypot access detected"
	}
	
	// Get or create connection info
	connInfo, exists := ddp.connections[ip]
	if !exists {
		connInfo = &ConnectionInfo{
			IP:       ip,
			LastSeen: time.Now(),
			FirstSeen: time.Now(),
		}
		ddp.connections[ip] = connInfo
		ddp.stats.TotalConnections++
	}
	
	// Update connection info
	connInfo.LastSeen = time.Now()
	connInfo.RequestCount++
	
	// Check if IP is currently blocked
	if connInfo.IsBlocked {
		if time.Now().Before(connInfo.BlockUntil) {
			ddp.stats.BlockedConnections++
			return false, connInfo.BlockReason
		} else {
			// Unblock IP
			connInfo.IsBlocked = false
			connInfo.BlockReason = ""
		}
	}
	
	// Check connection limits
	if ddp.stats.ActiveConnections >= ddp.config.MaxConcurrentConns {
		ddp.blockIP(ip, "Maximum concurrent connections exceeded")
		return false, "Maximum concurrent connections exceeded"
	}
	
	// Check per-IP connection limit
	ipConnections := ddp.getIPConnectionCount(ip)
	if ipConnections >= ddp.config.MaxConnsPerIP {
		ddp.blockIP(ip, "Maximum connections per IP exceeded")
		return false, "Maximum connections per IP exceeded"
	}
	
	// Check request rate limits
	if ddp.isRequestRateExceeded(connInfo) {
		ddp.blockIP(ip, "Request rate limit exceeded")
		return false, "Request rate limit exceeded"
	}
	
	// Check for suspicious activity
	if ddp.isSuspiciousActivity(connInfo) {
		ddp.blockIP(ip, "Suspicious activity detected")
		return false, "Suspicious activity detected"
	}
	
	ddp.stats.ActiveConnections = len(ddp.connections)
	return true, "Allowed"
}

// isWhitelisted checks if an IP is whitelisted
func (ddp *DDoSProtector) isWhitelisted(ip string) bool {
	// Check IP whitelist
	for _, whitelistIP := range ddp.config.WhitelistIPs {
		if ip == whitelistIP {
			return true
		}
	}
	
	// Check CIDR whitelist
	parsedIP := net.ParseIP(ip)
	if parsedIP != nil {
		for _, cidr := range ddp.config.WhitelistCIDRs {
			_, network, err := net.ParseCIDR(cidr)
			if err == nil && network.Contains(parsedIP) {
				return true
			}
		}
	}
	
	return false
}

// isBlacklisted checks if an IP is blacklisted
func (ddp *DDoSProtector) isBlacklisted(ip string) bool {
	// Check IP blacklist
	for _, blacklistIP := range ddp.config.BlacklistIPs {
		if ip == blacklistIP {
			return true
		}
	}
	
	// Check CIDR blacklist
	parsedIP := net.ParseIP(ip)
	if parsedIP != nil {
		for _, cidr := range ddp.config.BlacklistCIDRs {
			_, network, err := net.ParseCIDR(cidr)
			if err == nil && network.Contains(parsedIP) {
				return true
			}
		}
	}
	
	return false
}

// isHoneypotPath checks if a path is a honeypot
func (ddp *DDoSProtector) isHoneypotPath(path string) bool {
	if !ddp.config.EnableHoneypot {
		return false
	}
	
	for _, honeypotPath := range ddp.config.HoneypotPaths {
		if path == honeypotPath {
			return true
		}
	}
	
	return false
}

// getIPConnectionCount returns the number of connections for an IP
func (ddp *DDoSProtector) getIPConnectionCount(ip string) int {
	count := 0
	for _, connInfo := range ddp.connections {
		if connInfo.IP == ip {
			count++
		}
	}
	return count
}

// isRequestRateExceeded checks if request rate is exceeded
func (ddp *DDoSProtector) isRequestRateExceeded(connInfo *ConnectionInfo) bool {
	now := time.Now()
	
	// Check requests per minute
	if now.Sub(connInfo.FirstSeen) < time.Minute {
		return connInfo.RequestCount > ddp.config.MaxRequestsPerMinute
	}
	
	// Check requests per second (simplified)
	if now.Sub(connInfo.LastSeen) < time.Second {
		return connInfo.RequestCount > ddp.config.MaxRequestsPerSecond
	}
	
	return false
}

// isSuspiciousActivity checks for suspicious activity patterns
func (ddp *DDoSProtector) isSuspiciousActivity(connInfo *ConnectionInfo) bool {
	// Check if request count exceeds suspicious threshold
	if connInfo.RequestCount > ddp.config.SuspiciousThreshold {
		return true
	}
	
	// Check for rapid requests
	now := time.Now()
	if now.Sub(connInfo.FirstSeen) < time.Minute && connInfo.RequestCount > ddp.config.AttackThreshold {
		return true
	}
	
	return false
}

// blockIP blocks an IP address
func (ddp *DDoSProtector) blockIP(ip, reason string) {
	connInfo, exists := ddp.connections[ip]
	if !exists {
		connInfo = &ConnectionInfo{
			IP:       ip,
			LastSeen: time.Now(),
			FirstSeen: time.Now(),
		}
		ddp.connections[ip] = connInfo
	}
	
	connInfo.IsBlocked = true
	connInfo.BlockReason = reason
	connInfo.BlockUntil = time.Now().Add(ddp.config.BlockDuration)
	
	ddp.stats.BlockedConnections++
	ddp.stats.BlockedIPs = ddp.getBlockedIPCount()
}

// getBlockedIPCount returns the number of blocked IPs
func (ddp *DDoSProtector) getBlockedIPCount() int {
	count := 0
	for _, connInfo := range ddp.connections {
		if connInfo.IsBlocked {
			count++
		}
	}
	return count
}

// cleanup removes old connections
func (ddp *DDoSProtector) cleanup() {
	ticker := time.NewTicker(ddp.cleanupInterval)
	defer ticker.Stop()
	
	for range ticker.C {
		ddp.mutex.Lock()
		
		now := time.Now()
		cutoff := now.Add(-ddp.config.MaxIdleTime)
		
		// Remove old connections
		for ip, connInfo := range ddp.connections {
			if connInfo.LastSeen.Before(cutoff) {
				delete(ddp.connections, ip)
			}
		}
		
		ddp.stats.ActiveConnections = len(ddp.connections)
		ddp.stats.BlockedIPs = ddp.getBlockedIPCount()
		ddp.stats.LastCleanup = now
		ddp.lastCleanup = now
		
		ddp.mutex.Unlock()
	}
}

// GetStats returns DDoS protection statistics
func (ddp *DDoSProtector) GetStats() *DDoSStats {
	ddp.mutex.RLock()
	defer ddp.mutex.RUnlock()
	
	return &DDoSStats{
		TotalConnections:   ddp.stats.TotalConnections,
		ActiveConnections:  ddp.stats.ActiveConnections,
		BlockedConnections: ddp.stats.BlockedConnections,
		BlockedIPs:         ddp.stats.BlockedIPs,
		WhitelistHits:      ddp.stats.WhitelistHits,
		BlacklistHits:      ddp.stats.BlacklistHits,
		HoneypotHits:       ddp.stats.HoneypotHits,
		LastCleanup:        ddp.stats.LastCleanup,
	}
}

// DDoSProtectionMiddleware creates a DDoS protection middleware
func DDoSProtectionMiddleware(protector *DDoSProtector) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		ip := getClientIP(c)
		path := c.Request.URL.Path
		
		allowed, reason := protector.CheckConnection(ip, path)
		if !allowed {
			c.Header("X-DDoS-Protection", "active")
			c.Header("X-DDoS-Reason", reason)
			
			c.AbortWithStatusJSON(429, gin.H{
				"error": "DDoS protection triggered",
				"code":  "DDOS_PROTECTION",
				"reason": reason,
				"retry_after": 900, // 15 minutes
			})
			return
		}
		
		// Add DDoS protection headers
		c.Header("X-DDoS-Protection", "active")
		
		// Set connection timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), protector.config.ConnectionTimeout)
		defer cancel()
		
		c.Request = c.Request.WithContext(ctx)
		
		c.Next()
	})
}