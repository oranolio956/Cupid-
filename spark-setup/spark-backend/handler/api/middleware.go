package api

import (
	"time"

	"github.com/gin-gonic/gin"
)

// RequestTrackingMiddleware tracks API requests
func RequestTrackingMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		
		// Increment request count
		IncrementRequestCount()
		
		// Process request
		c.Next()
		
		// Track success/failure
		if c.Writer.Status() >= 200 && c.Writer.Status() < 400 {
			IncrementSuccessCount()
		} else {
			IncrementFailCount()
		}
		
		// Log request (optional)
		duration := time.Since(start)
		if duration > 1*time.Second {
			// Log slow requests
			// This could be integrated with the logging system
		}
	})
}

// APIVersionMiddleware adds API version headers
func APIVersionMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Header("X-API-Version", "2.0.0")
		c.Header("X-API-Server", "Spark RAT")
		c.Next()
	})
}

// ResponseTimeMiddleware adds response time headers
func ResponseTimeMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		
		c.Next()
		
		duration := time.Since(start)
		c.Header("X-Response-Time", duration.String())
		c.Header("X-Response-Time-MS", fmt.Sprintf("%.2f", float64(duration.Nanoseconds())/1000000.0))
	})
}

// RequestIDMiddleware adds request ID to responses
func RequestIDMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	})
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	return fmt.Sprintf("req_%d_%d", time.Now().UnixNano(), time.Now().Unix())
}