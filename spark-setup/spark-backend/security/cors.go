package security

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSConfig holds CORS configuration
type CORSConfig struct {
	AllowedOrigins      []string `json:"allowed_origins"`
	AllowedMethods      []string `json:"allowed_methods"`
	AllowedHeaders      []string `json:"allowed_headers"`
	ExposedHeaders      []string `json:"exposed_headers"`
	AllowCredentials    bool     `json:"allow_credentials"`
	MaxAge              int      `json:"max_age"`
	AllowWildcard       bool     `json:"allow_wildcard"`
	AllowPrivateNetwork bool     `json:"allow_private_network"`
}

// DefaultCORSConfig returns default CORS configuration
func DefaultCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{
			"https://spark-rat-dashboard.vercel.app",
			"https://spark-backend-fixed-v2.onrender.com",
		},
		AllowedMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH",
		},
		AllowedHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-API-Key",
			"X-CSRF-Token",
			"X-Request-ID",
			"UUID",
			"Key",
		},
		ExposedHeaders: []string{
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
			"X-Response-Time",
			"X-Response-Time-MS",
			"X-Request-ID",
			"X-API-Version",
			"X-API-Server",
		},
		AllowCredentials:    true,
		MaxAge:              86400, // 24 hours
		AllowWildcard:       false,
		AllowPrivateNetwork: true,
	}
}

// ProductionCORSConfig returns production CORS configuration
func ProductionCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{
			"https://spark-rat-dashboard.vercel.app",
		},
		AllowedMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS",
		},
		AllowedHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-CSRF-Token",
			"UUID",
			"Key",
		},
		ExposedHeaders: []string{
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
			"X-Response-Time",
			"X-Request-ID",
		},
		AllowCredentials:    true,
		MaxAge:              3600, // 1 hour
		AllowWildcard:       false,
		AllowPrivateNetwork: false,
	}
}

// DevelopmentCORSConfig returns development CORS configuration
func DevelopmentCORSConfig() *CORSConfig {
	return &CORSConfig{
		AllowedOrigins: []string{
			"*",
		},
		AllowedMethods: []string{
			"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH",
		},
		AllowedHeaders: []string{
			"*",
		},
		ExposedHeaders: []string{
			"*",
		},
		AllowCredentials:    false,
		MaxAge:              86400,
		AllowWildcard:       true,
		AllowPrivateNetwork: true,
	}
}

// CORSMiddleware creates a CORS middleware
func CORSMiddleware(config *CORSConfig) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			handlePreflightRequest(c, config, origin)
			return
		}
		
		// Set CORS headers for actual requests
		setCORSHeaders(c, config, origin)
		c.Next()
	})
}

// handlePreflightRequest handles OPTIONS preflight requests
func handlePreflightRequest(c *gin.Context, config *CORSConfig, origin string) {
	// Check if origin is allowed
	if !isOriginAllowed(origin, config) {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}
	
	// Set CORS headers
	setCORSHeaders(c, config, origin)
	
	// Set allowed methods
	c.Header("Access-Control-Allow-Methods", strings.Join(config.AllowedMethods, ", "))
	
	// Set allowed headers
	c.Header("Access-Control-Allow-Headers", strings.Join(config.AllowedHeaders, ", "))
	
	// Set max age
	c.Header("Access-Control-Max-Age", string(rune(config.MaxAge)))
	
	// Handle private network requests
	if config.AllowPrivateNetwork {
		c.Header("Access-Control-Allow-Private-Network", "true")
	}
	
	c.AbortWithStatus(http.StatusNoContent)
}

// setCORSHeaders sets CORS headers for requests
func setCORSHeaders(c *gin.Context, config *CORSConfig, origin string) {
	// Set allowed origin
	if isOriginAllowed(origin, config) {
		c.Header("Access-Control-Allow-Origin", origin)
	} else if config.AllowWildcard {
		c.Header("Access-Control-Allow-Origin", "*")
	}
	
	// Set exposed headers
	if len(config.ExposedHeaders) > 0 {
		c.Header("Access-Control-Expose-Headers", strings.Join(config.ExposedHeaders, ", "))
	}
	
	// Set credentials
	if config.AllowCredentials {
		c.Header("Access-Control-Allow-Credentials", "true")
	}
	
	// Set vary header
	c.Header("Vary", "Origin")
}

// isOriginAllowed checks if an origin is allowed
func isOriginAllowed(origin string, config *CORSConfig) bool {
	if origin == "" {
		return false
	}
	
	// Check wildcard
	if config.AllowWildcard {
		return true
	}
	
	// Check specific origins
	for _, allowedOrigin := range config.AllowedOrigins {
		if allowedOrigin == "*" {
			return true
		}
		if allowedOrigin == origin {
			return true
		}
		// Check for subdomain wildcards
		if strings.HasPrefix(allowedOrigin, "*.") {
			domain := strings.TrimPrefix(allowedOrigin, "*.")
			if strings.HasSuffix(origin, domain) {
				return true
			}
		}
	}
	
	return false
}

// GetCORSConfigForEnvironment returns CORS configuration for environment
func GetCORSConfigForEnvironment(env string) *CORSConfig {
	switch env {
	case "production":
		return ProductionCORSConfig()
	case "development":
		return DevelopmentCORSConfig()
	default:
		return DefaultCORSConfig()
	}
}