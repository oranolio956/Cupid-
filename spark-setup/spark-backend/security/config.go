package security

import (
	"encoding/json"
	"os"
	"time"
)

// SecurityConfig holds comprehensive security configuration
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
	
	// Authentication
	AuthEnabled         bool     `json:"auth_enabled"`
	SessionTimeout      time.Duration `json:"session_timeout"`
	MaxSessions         int     `json:"max_sessions"`
	
	// Encryption
	EncryptionEnabled   bool     `json:"encryption_enabled"`
	KeyRotationInterval time.Duration `json:"key_rotation_interval"`
	
	// Logging
	SecurityLoggingEnabled bool `json:"security_logging_enabled"`
	LogLevel             string `json:"log_level"`
	
	// Monitoring
	MonitoringEnabled   bool     `json:"monitoring_enabled"`
	AlertThresholds     AlertThresholds `json:"alert_thresholds"`
}

// AlertThresholds defines alert thresholds
type AlertThresholds struct {
	MaxFailedAttempts   int `json:"max_failed_attempts"`
	MaxBlockedIPs       int `json:"max_blocked_ips"`
	MaxRateLimitHits    int `json:"max_rate_limit_hits"`
	MaxConcurrentConns  int `json:"max_concurrent_conns"`
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
		AllowedOrigins:        []string{
			"https://spark-rat-dashboard.vercel.app",
			"https://spark-backend-fixed-v2.onrender.com",
		},
		AllowedMethods:        []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"},
		AllowedHeaders:        []string{
			"Origin", "Content-Type", "Accept", "Authorization", 
			"X-Requested-With", "X-API-Key", "X-CSRF-Token",
		},
		
		MaxRequestSize:        10 * 1024 * 1024, // 10MB
		ValidateUserAgent:     true,
		BlockSuspiciousUA:     true,
		
		DDoSProtectionEnabled: true,
		MaxConcurrentConns:    1000,
		ConnectionTimeout:     30 * time.Second,
		
		AuthEnabled:           true,
		SessionTimeout:        30 * time.Minute,
		MaxSessions:           1000,
		
		EncryptionEnabled:     true,
		KeyRotationInterval:   24 * time.Hour,
		
		SecurityLoggingEnabled: true,
		LogLevel:             "info",
		
		MonitoringEnabled:     true,
		AlertThresholds: AlertThresholds{
			MaxFailedAttempts:   100,
			MaxBlockedIPs:       50,
			MaxRateLimitHits:    1000,
			MaxConcurrentConns:  800,
		},
	}
}

// ProductionSecurityConfig returns production security configuration
func ProductionSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimitEnabled:      true,
		RateLimitRPS:          200,
		RateLimitBurst:        400,
		RateLimitWindow:       1 * time.Minute,
		
		IPBlockingEnabled:     true,
		MaxFailedAttempts:     3,
		BlockDuration:         30 * time.Minute,
		
		SecurityHeadersEnabled: true,
		
		CORSEnabled:           true,
		AllowedOrigins:        []string{
			"https://spark-rat-dashboard.vercel.app",
		},
		AllowedMethods:        []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:        []string{
			"Origin", "Content-Type", "Accept", "Authorization", 
			"X-Requested-With", "X-CSRF-Token",
		},
		
		MaxRequestSize:        5 * 1024 * 1024, // 5MB
		ValidateUserAgent:     true,
		BlockSuspiciousUA:     true,
		
		DDoSProtectionEnabled: true,
		MaxConcurrentConns:    500,
		ConnectionTimeout:     15 * time.Second,
		
		AuthEnabled:           true,
		SessionTimeout:        15 * time.Minute,
		MaxSessions:           500,
		
		EncryptionEnabled:     true,
		KeyRotationInterval:   12 * time.Hour,
		
		SecurityLoggingEnabled: true,
		LogLevel:             "warn",
		
		MonitoringEnabled:     true,
		AlertThresholds: AlertThresholds{
			MaxFailedAttempts:   50,
			MaxBlockedIPs:       25,
			MaxRateLimitHits:    500,
			MaxConcurrentConns:  400,
		},
	}
}

// DevelopmentSecurityConfig returns development security configuration
func DevelopmentSecurityConfig() *SecurityConfig {
	return &SecurityConfig{
		RateLimitEnabled:      false,
		RateLimitRPS:          1000,
		RateLimitBurst:        2000,
		RateLimitWindow:       1 * time.Minute,
		
		IPBlockingEnabled:     false,
		MaxFailedAttempts:     10,
		BlockDuration:         5 * time.Minute,
		
		SecurityHeadersEnabled: true,
		
		CORSEnabled:           true,
		AllowedOrigins:        []string{"*"},
		AllowedMethods:        []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"},
		AllowedHeaders:        []string{"*"},
		
		MaxRequestSize:        50 * 1024 * 1024, // 50MB
		ValidateUserAgent:     false,
		BlockSuspiciousUA:     false,
		
		DDoSProtectionEnabled: false,
		MaxConcurrentConns:    10000,
		ConnectionTimeout:     60 * time.Second,
		
		AuthEnabled:           false,
		SessionTimeout:        24 * time.Hour,
		MaxSessions:           10000,
		
		EncryptionEnabled:     false,
		KeyRotationInterval:   7 * 24 * time.Hour,
		
		SecurityLoggingEnabled: true,
		LogLevel:             "debug",
		
		MonitoringEnabled:     false,
		AlertThresholds: AlertThresholds{
			MaxFailedAttempts:   1000,
			MaxBlockedIPs:       100,
			MaxRateLimitHits:    10000,
			MaxConcurrentConns:  5000,
		},
	}
}

// LoadSecurityConfig loads security configuration from file
func LoadSecurityConfig(filename string) (*SecurityConfig, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	
	var config SecurityConfig
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		return nil, err
	}
	
	return &config, nil
}

// SaveSecurityConfig saves security configuration to file
func (config *SecurityConfig) SaveSecurityConfig(filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()
	
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(config)
}

// ValidateConfig validates security configuration
func (config *SecurityConfig) ValidateConfig() error {
	if config.RateLimitRPS <= 0 {
		return fmt.Errorf("rate_limit_rps must be positive")
	}
	
	if config.RateLimitBurst <= 0 {
		return fmt.Errorf("rate_limit_burst must be positive")
	}
	
	if config.MaxFailedAttempts <= 0 {
		return fmt.Errorf("max_failed_attempts must be positive")
	}
	
	if config.MaxRequestSize <= 0 {
		return fmt.Errorf("max_request_size must be positive")
	}
	
	if config.MaxConcurrentConns <= 0 {
		return fmt.Errorf("max_concurrent_conns must be positive")
	}
	
	if config.MaxSessions <= 0 {
		return fmt.Errorf("max_sessions must be positive")
	}
	
	if len(config.AllowedOrigins) == 0 && config.CORSEnabled {
		return fmt.Errorf("allowed_origins cannot be empty when CORS is enabled")
	}
	
	if len(config.AllowedMethods) == 0 {
		return fmt.Errorf("allowed_methods cannot be empty")
	}
	
	if len(config.AllowedHeaders) == 0 {
		return fmt.Errorf("allowed_headers cannot be empty")
	}
	
	return nil
}

// GetConfigForEnvironment returns configuration for specific environment
func GetConfigForEnvironment(env string) *SecurityConfig {
	switch env {
	case "production":
		return ProductionSecurityConfig()
	case "development":
		return DevelopmentSecurityConfig()
	default:
		return DefaultSecurityConfig()
	}
}