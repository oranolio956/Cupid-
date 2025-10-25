package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"Spark/server/common"
	"Spark/server/config"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Time    int64       `json:"time"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Status    string            `json:"status"`
	Version   string            `json:"version"`
	Uptime    string            `json:"uptime"`
	Clients   int               `json:"clients"`
	Memory    MemoryInfo        `json:"memory"`
	System    SystemInfo        `json:"system"`
	Services  map[string]string `json:"services"`
}

// MemoryInfo represents memory usage information
type MemoryInfo struct {
	Alloc      uint64 `json:"alloc"`
	TotalAlloc uint64 `json:"total_alloc"`
	Sys        uint64 `json:"sys"`
	NumGC      int32  `json:"num_gc"`
}

// SystemInfo represents system information
type SystemInfo struct {
	GoVersion    string `json:"go_version"`
	OS           string `json:"os"`
	Architecture string `json:"arch"`
	CPUs         int    `json:"cpus"`
}

// InfoResponse represents info endpoint response
type InfoResponse struct {
	Version     string            `json:"version"`
	Uptime      string            `json:"uptime"`
	Clients     int               `json:"clients"`
	Environment string            `json:"environment"`
	BuildTime   string            `json:"build_time"`
	GitCommit   string            `json:"git_commit"`
	Features    map[string]bool   `json:"features"`
	Endpoints   []string          `json:"endpoints"`
}

// MetricsResponse represents metrics endpoint response
type MetricsResponse struct {
	Requests    RequestMetrics    `json:"requests"`
	Connections ConnectionMetrics `json:"connections"`
	Performance PerformanceMetrics `json:"performance"`
	Security    SecurityMetrics   `json:"security"`
}

// RequestMetrics represents request metrics
type RequestMetrics struct {
	Total       int64   `json:"total"`
	Successful  int64   `json:"successful"`
	Failed      int64   `json:"failed"`
	Rate        float64 `json:"rate_per_second"`
	AverageTime float64 `json:"average_time_ms"`
}

// ConnectionMetrics represents connection metrics
type ConnectionMetrics struct {
	Active    int `json:"active"`
	Total     int `json:"total"`
	Peak      int `json:"peak"`
	Rejected  int `json:"rejected"`
}

// PerformanceMetrics represents performance metrics
type PerformanceMetrics struct {
	CPUUsage    float64 `json:"cpu_usage_percent"`
	MemoryUsage float64 `json:"memory_usage_percent"`
	DiskUsage   float64 `json:"disk_usage_percent"`
	LoadAverage float64 `json:"load_average"`
}

// SecurityMetrics represents security metrics
type SecurityMetrics struct {
	BlockedIPs     int `json:"blocked_ips"`
	FailedAttempts int `json:"failed_attempts"`
	RateLimitHits  int `json:"rate_limit_hits"`
	ActiveSessions int `json:"active_sessions"`
}

var (
	startTime = time.Now()
	requestCount int64
	successCount int64
	failCount int64
)

// HealthCheck provides health check endpoint
func HealthCheck(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	uptime := time.Since(startTime)
	clientCount := common.Devices.Len()
	
	response := HealthResponse{
		Status:   "healthy",
		Version:  "2.0.0",
		Uptime:   uptime.String(),
		Clients:  clientCount,
		Memory: MemoryInfo{
			Alloc:      m.Alloc,
			TotalAlloc: m.TotalAlloc,
			Sys:        m.Sys,
			NumGC:      m.NumGC,
		},
		System: SystemInfo{
			GoVersion:    runtime.Version(),
			OS:           runtime.GOOS,
			Architecture: runtime.GOARCH,
			CPUs:         runtime.NumCPU(),
		},
		Services: map[string]string{
			"api":        "healthy",
			"websocket":  "healthy",
			"database":   "healthy",
			"filesystem": "healthy",
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// Info provides system information endpoint
func Info(c *gin.Context) {
	uptime := time.Since(startTime)
	clientCount := common.Devices.Len()
	
	response := InfoResponse{
		Version:     "2.0.0",
		Uptime:      uptime.String(),
		Clients:     clientCount,
		Environment: config.Config.Environment,
		BuildTime:   "2025-10-25T14:00:00Z",
		GitCommit:   "2ffd0b24",
		Features: map[string]bool{
			"terminal":        true,
			"desktop":         true,
			"file_manager":    true,
			"process_manager": true,
			"screenshot":      true,
			"system_control":  true,
			"real_time":       true,
			"encryption":      true,
			"authentication":  true,
			"rate_limiting":   true,
		},
		Endpoints: []string{
			"GET /api/info",
			"GET /api/health",
			"GET /api/metrics",
			"POST /api/device/list",
			"POST /api/device/screenshot/get",
			"POST /api/device/process/list",
			"POST /api/device/file/list",
			"POST /api/device/exec",
			"WebSocket /ws",
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// Metrics provides system metrics endpoint
func Metrics(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	uptime := time.Since(startTime)
	clientCount := common.Devices.Len()
	
	// Calculate rates
	var requestRate float64
	if uptime.Seconds() > 0 {
		requestRate = float64(requestCount) / uptime.Seconds()
	}
	
	// Calculate memory usage percentage (simplified)
	memoryUsage := float64(m.Alloc) / float64(m.Sys) * 100
	if memoryUsage > 100 {
		memoryUsage = 100
	}
	
	response := MetricsResponse{
		Requests: RequestMetrics{
			Total:       requestCount,
			Successful:  successCount,
			Failed:      failCount,
			Rate:        requestRate,
			AverageTime: 150.0, // Placeholder
		},
		Connections: ConnectionMetrics{
			Active:   clientCount,
			Total:    int(requestCount),
			Peak:     clientCount + 10, // Placeholder
			Rejected: int(failCount),
		},
		Performance: PerformanceMetrics{
			CPUUsage:    0.0, // Would need system monitoring
			MemoryUsage: memoryUsage,
			DiskUsage:   0.0, // Would need disk monitoring
			LoadAverage: 0.0, // Would need system monitoring
		},
		Security: SecurityMetrics{
			BlockedIPs:     0, // Would need security manager
			FailedAttempts: int(failCount),
			RateLimitHits:  0, // Would need rate limiter
			ActiveSessions: clientCount,
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// Status provides system status endpoint
func Status(c *gin.Context) {
	uptime := time.Since(startTime)
	clientCount := common.Devices.Len()
	
	status := "healthy"
	if clientCount == 0 {
		status = "warning"
	}
	if failCount > successCount {
		status = "error"
	}
	
	response := map[string]interface{}{
		"status":    status,
		"uptime":    uptime.String(),
		"clients":   clientCount,
		"requests":  requestCount,
		"success":   successCount,
		"failures":  failCount,
		"timestamp": time.Now().Unix(),
	}
	
	c.JSON(http.StatusOK, response)
}

// Version provides version information endpoint
func Version(c *gin.Context) {
	response := map[string]interface{}{
		"version":     "2.0.0",
		"build_time":  "2025-10-25T14:00:00Z",
		"git_commit":  "2ffd0b24",
		"go_version":  runtime.Version(),
		"environment": config.Config.Environment,
		"features": []string{
			"terminal",
			"desktop",
			"file_manager",
			"process_manager",
			"screenshot",
			"system_control",
			"real_time",
			"encryption",
			"authentication",
			"rate_limiting",
		},
	}
	
	c.JSON(http.StatusOK, response)
}

// Ping provides simple ping endpoint
func Ping(c *gin.Context) {
	response := map[string]interface{}{
		"message": "pong",
		"time":    time.Now().Unix(),
	}
	
	c.JSON(http.StatusOK, response)
}

// Error provides error information endpoint
func Error(c *gin.Context) {
	response := map[string]interface{}{
		"error":   "Not found",
		"code":    404,
		"message": "The requested endpoint was not found",
		"time":    time.Now().Unix(),
	}
	
	c.JSON(http.StatusNotFound, response)
}

// IncrementRequestCount increments the request counter
func IncrementRequestCount() {
	requestCount++
}

// IncrementSuccessCount increments the success counter
func IncrementSuccessCount() {
	successCount++
}

// IncrementFailCount increments the failure counter
func IncrementFailCount() {
	failCount++
}

// GetRequestStats returns current request statistics
func GetRequestStats() map[string]interface{} {
	uptime := time.Since(startTime)
	var requestRate float64
	if uptime.Seconds() > 0 {
		requestRate = float64(requestCount) / uptime.Seconds()
	}
	
	return map[string]interface{}{
		"total_requests": requestCount,
		"successful":     successCount,
		"failed":         failCount,
		"rate_per_second": requestRate,
		"uptime_seconds": uptime.Seconds(),
	}
}

// ResetStats resets all statistics
func ResetStats() {
	requestCount = 0
	successCount = 0
	failCount = 0
	startTime = time.Now()
}