package security

import (
	"crypto/sha256"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
)

// SecurityHeadersConfig holds security headers configuration
type SecurityHeadersConfig struct {
	// HSTS (HTTP Strict Transport Security)
	HSTSEnabled     bool   `json:"hsts_enabled"`
	HSTSMaxAge      int    `json:"hsts_max_age"`
	HSTSIncludeSubdomains bool `json:"hsts_include_subdomains"`
	HSTSPreload     bool   `json:"hsts_preload"`
	
	// X-Frame-Options
	FrameOptionsEnabled bool   `json:"frame_options_enabled"`
	FrameOptionsValue   string `json:"frame_options_value"`
	
	// X-Content-Type-Options
	ContentTypeOptionsEnabled bool `json:"content_type_options_enabled"`
	
	// X-XSS-Protection
	XSSProtectionEnabled bool   `json:"xss_protection_enabled"`
	XSSProtectionValue   string `json:"xss_protection_value"`
	
	// Referrer-Policy
	ReferrerPolicyEnabled bool   `json:"referrer_policy_enabled"`
	ReferrerPolicyValue   string `json:"referrer_policy_value"`
	
	// Content-Security-Policy
	CSPEnabled bool   `json:"csp_enabled"`
	CSPValue   string `json:"csp_value"`
	
	// Permissions-Policy
	PermissionsPolicyEnabled bool   `json:"permissions_policy_enabled"`
	PermissionsPolicyValue   string `json:"permissions_policy_value"`
	
	// Additional headers
	XDNSPrefetchControl bool `json:"x_dns_prefetch_control"`
	XDownloadOptions    bool `json:"x_download_options"`
	XPoweredBy          bool `json:"x_powered_by"`
	
	// Custom headers
	CustomHeaders map[string]string `json:"custom_headers"`
}

// DefaultSecurityHeadersConfig returns default security headers configuration
func DefaultSecurityHeadersConfig() *SecurityHeadersConfig {
	return &SecurityHeadersConfig{
		HSTSEnabled:           true,
		HSTSMaxAge:            31536000, // 1 year
		HSTSIncludeSubdomains: true,
		HSTSPreload:           true,
		
		FrameOptionsEnabled: true,
		FrameOptionsValue:   "DENY",
		
		ContentTypeOptionsEnabled: true,
		
		XSSProtectionEnabled: true,
		XSSProtectionValue:   "1; mode=block",
		
		ReferrerPolicyEnabled: true,
		ReferrerPolicyValue:   "strict-origin-when-cross-origin",
		
		CSPEnabled: true,
		CSPValue:   "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
		
		PermissionsPolicyEnabled: true,
		PermissionsPolicyValue:   "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
		
		XDNSPrefetchControl: true,
		XDownloadOptions:    true,
		XPoweredBy:          false,
		
		CustomHeaders: map[string]string{
			"X-Permitted-Cross-Domain-Policies": "none",
			"X-Content-Type-Options":            "nosniff",
		},
	}
}

// ProductionSecurityHeadersConfig returns production security headers configuration
func ProductionSecurityHeadersConfig() *SecurityHeadersConfig {
	return &SecurityHeadersConfig{
		HSTSEnabled:           true,
		HSTSMaxAge:            31536000, // 1 year
		HSTSIncludeSubdomains: true,
		HSTSPreload:           true,
		
		FrameOptionsEnabled: true,
		FrameOptionsValue:   "DENY",
		
		ContentTypeOptionsEnabled: true,
		
		XSSProtectionEnabled: true,
		XSSProtectionValue:   "1; mode=block",
		
		ReferrerPolicyEnabled: true,
		ReferrerPolicyValue:   "strict-origin-when-cross-origin",
		
		CSPEnabled: true,
		CSPValue:   "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' wss: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';",
		
		PermissionsPolicyEnabled: true,
		PermissionsPolicyValue:   "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
		
		XDNSPrefetchControl: true,
		XDownloadOptions:    true,
		XPoweredBy:          false,
		
		CustomHeaders: map[string]string{
			"X-Permitted-Cross-Domain-Policies": "none",
			"X-Content-Type-Options":            "nosniff",
			"Cross-Origin-Embedder-Policy":      "require-corp",
			"Cross-Origin-Opener-Policy":        "same-origin",
			"Cross-Origin-Resource-Policy":      "same-origin",
		},
	}
}

// DevelopmentSecurityHeadersConfig returns development security headers configuration
func DevelopmentSecurityHeadersConfig() *SecurityHeadersConfig {
	return &SecurityHeadersConfig{
		HSTSEnabled:           false,
		HSTSMaxAge:            0,
		HSTSIncludeSubdomains: false,
		HSTSPreload:           false,
		
		FrameOptionsEnabled: true,
		FrameOptionsValue:   "SAMEORIGIN",
		
		ContentTypeOptionsEnabled: true,
		
		XSSProtectionEnabled: false,
		XSSProtectionValue:   "",
		
		ReferrerPolicyEnabled: true,
		ReferrerPolicyValue:   "no-referrer-when-downgrade",
		
		CSPEnabled: false,
		CSPValue:   "",
		
		PermissionsPolicyEnabled: false,
		PermissionsPolicyValue:   "",
		
		XDNSPrefetchControl: false,
		XDownloadOptions:    false,
		XPoweredBy:          true,
		
		CustomHeaders: map[string]string{},
	}
}

// SecurityHeadersMiddleware creates a security headers middleware
func SecurityHeadersMiddleware(config *SecurityHeadersConfig) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// HSTS
		if config.HSTSEnabled {
			hstsValue := fmt.Sprintf("max-age=%d", config.HSTSMaxAge)
			if config.HSTSIncludeSubdomains {
				hstsValue += "; includeSubDomains"
			}
			if config.HSTSPreload {
				hstsValue += "; preload"
			}
			c.Header("Strict-Transport-Security", hstsValue)
		}
		
		// X-Frame-Options
		if config.FrameOptionsEnabled {
			c.Header("X-Frame-Options", config.FrameOptionsValue)
		}
		
		// X-Content-Type-Options
		if config.ContentTypeOptionsEnabled {
			c.Header("X-Content-Type-Options", "nosniff")
		}
		
		// X-XSS-Protection
		if config.XSSProtectionEnabled && config.XSSProtectionValue != "" {
			c.Header("X-XSS-Protection", config.XSSProtectionValue)
		}
		
		// Referrer-Policy
		if config.ReferrerPolicyEnabled {
			c.Header("Referrer-Policy", config.ReferrerPolicyValue)
		}
		
		// Content-Security-Policy
		if config.CSPEnabled && config.CSPValue != "" {
			c.Header("Content-Security-Policy", config.CSPValue)
		}
		
		// Permissions-Policy
		if config.PermissionsPolicyEnabled && config.PermissionsPolicyValue != "" {
			c.Header("Permissions-Policy", config.PermissionsPolicyValue)
		}
		
		// X-DNS-Prefetch-Control
		if config.XDNSPrefetchControl {
			c.Header("X-DNS-Prefetch-Control", "off")
		}
		
		// X-Download-Options
		if config.XDownloadOptions {
			c.Header("X-Download-Options", "noopen")
		}
		
		// X-Powered-By
		if !config.XPoweredBy {
			c.Header("X-Powered-By", "")
		}
		
		// Custom headers
		for key, value := range config.CustomHeaders {
			c.Header(key, value)
		}
		
		// Generate nonce for CSP if needed
		if config.CSPEnabled && strings.Contains(config.CSPValue, "'nonce-") {
			nonce := generateNonce()
			c.Header("X-CSP-Nonce", nonce)
			c.Set("csp_nonce", nonce)
		}
		
		c.Next()
	})
}

// generateNonce generates a CSP nonce
func generateNonce() string {
	// This is a simplified nonce generation
	// In production, use a cryptographically secure random generator
	return fmt.Sprintf("%x", sha256.Sum256([]byte(fmt.Sprintf("%d", gin.H{}))))
}

// GetSecurityHeadersConfigForEnvironment returns security headers configuration for environment
func GetSecurityHeadersConfigForEnvironment(env string) *SecurityHeadersConfig {
	switch env {
	case "production":
		return ProductionSecurityHeadersConfig()
	case "development":
		return DevelopmentSecurityHeadersConfig()
	default:
		return DefaultSecurityHeadersConfig()
	}
}