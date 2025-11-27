package optimizations

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// PerformanceOptimizer provides performance optimization functionality
type PerformanceOptimizer struct {
	// Configuration
	config *PerformanceConfig
	
	// Monitoring
	metrics *PerformanceMetrics
	
	// Caching
	cache *CacheManager
	
	// Connection pooling
	connectionPool *ConnectionPool
	
	// Resource monitoring
	resourceMonitor *ResourceMonitor
	
	// Mutex for thread safety
	mutex sync.RWMutex
}

// PerformanceConfig holds performance optimization configuration
type PerformanceConfig struct {
	// Caching
	CacheEnabled     bool          `json:"cache_enabled"`
	CacheSize        int           `json:"cache_size"`
	CacheTTL         time.Duration `json:"cache_ttl"`
	CacheCleanup     time.Duration `json:"cache_cleanup"`
	
	// Connection pooling
	PoolEnabled      bool          `json:"pool_enabled"`
	MaxConnections   int           `json:"max_connections"`
	MinConnections   int           `json:"min_connections"`
	IdleTimeout      time.Duration `json:"idle_timeout"`
	MaxLifetime      time.Duration `json:"max_lifetime"`
	
	// Memory management
	MemoryLimit      int64         `json:"memory_limit"`
	GCThreshold      int64         `json:"gc_threshold"`
	GCInterval       time.Duration `json:"gc_interval"`
	
	// Request optimization
	RequestTimeout   time.Duration `json:"request_timeout"`
	MaxRequestSize   int64         `json:"max_request_size"`
	CompressionLevel int           `json:"compression_level"`
	
	// Monitoring
	MonitoringEnabled bool         `json:"monitoring_enabled"`
	MetricsInterval   time.Duration `json:"metrics_interval"`
	AlertThresholds   AlertThresholds `json:"alert_thresholds"`
}

// PerformanceMetrics holds performance metrics
type PerformanceMetrics struct {
	// Request metrics
	TotalRequests     int64   `json:"total_requests"`
	SuccessfulRequests int64  `json:"successful_requests"`
	FailedRequests    int64   `json:"failed_requests"`
	AverageResponseTime float64 `json:"average_response_time"`
	
	// Memory metrics
	MemoryAlloc      uint64  `json:"memory_alloc"`
	MemorySys        uint64  `json:"memory_sys"`
	MemoryHeap       uint64  `json:"memory_heap"`
	MemoryStack      uint64  `json:"memory_stack"`
	GCCount          int32   `json:"gc_count"`
	GCPauseTotal     time.Duration `json:"gc_pause_total"`
	
	// Cache metrics
	CacheHits        int64   `json:"cache_hits"`
	CacheMisses      int64   `json:"cache_misses"`
	CacheSize        int     `json:"cache_size"`
	
	// Connection metrics
	ActiveConnections int    `json:"active_connections"`
	TotalConnections  int64  `json:"total_connections"`
	ConnectionErrors  int64  `json:"connection_errors"`
	
	// System metrics
	CPUUsage         float64 `json:"cpu_usage"`
	LoadAverage      float64 `json:"load_average"`
	Uptime           time.Duration `json:"uptime"`
	
	// Timestamps
	LastUpdate       time.Time `json:"last_update"`
	StartTime        time.Time `json:"start_time"`
}

// AlertThresholds holds alert thresholds
type AlertThresholds struct {
	MemoryUsage      float64 `json:"memory_usage"`
	CPUUsage         float64 `json:"cpu_usage"`
	ResponseTime     float64 `json:"response_time"`
	ErrorRate        float64 `json:"error_rate"`
	ConnectionCount  int     `json:"connection_count"`
}

// DefaultPerformanceConfig returns default performance configuration
func DefaultPerformanceConfig() *PerformanceConfig {
	return &PerformanceConfig{
		CacheEnabled:     true,
		CacheSize:        1000,
		CacheTTL:         5 * time.Minute,
		CacheCleanup:     1 * time.Minute,
		
		PoolEnabled:      true,
		MaxConnections:   100,
		MinConnections:   10,
		IdleTimeout:      5 * time.Minute,
		MaxLifetime:      1 * time.Hour,
		
		MemoryLimit:      512 * 1024 * 1024, // 512MB
		GCThreshold:      256 * 1024 * 1024, // 256MB
		GCInterval:       30 * time.Second,
		
		RequestTimeout:   30 * time.Second,
		MaxRequestSize:   10 * 1024 * 1024, // 10MB
		CompressionLevel: 6,
		
		MonitoringEnabled: true,
		MetricsInterval:   10 * time.Second,
		AlertThresholds: AlertThresholds{
			MemoryUsage:     80.0,
			CPUUsage:        80.0,
			ResponseTime:    1000.0, // 1 second
			ErrorRate:       5.0,
			ConnectionCount: 800,
		},
	}
}

// ProductionPerformanceConfig returns production performance configuration
func ProductionPerformanceConfig() *PerformanceConfig {
	return &PerformanceConfig{
		CacheEnabled:     true,
		CacheSize:        5000,
		CacheTTL:         10 * time.Minute,
		CacheCleanup:     30 * time.Second,
		
		PoolEnabled:      true,
		MaxConnections:   500,
		MinConnections:   50,
		IdleTimeout:      2 * time.Minute,
		MaxLifetime:      30 * time.Minute,
		
		MemoryLimit:      2 * 1024 * 1024 * 1024, // 2GB
		GCThreshold:      1 * 1024 * 1024 * 1024, // 1GB
		GCInterval:       15 * time.Second,
		
		RequestTimeout:   15 * time.Second,
		MaxRequestSize:   5 * 1024 * 1024, // 5MB
		CompressionLevel: 9,
		
		MonitoringEnabled: true,
		MetricsInterval:   5 * time.Second,
		AlertThresholds: AlertThresholds{
			MemoryUsage:     85.0,
			CPUUsage:        85.0,
			ResponseTime:    500.0, // 500ms
			ErrorRate:       2.0,
			ConnectionCount: 400,
		},
	}
}

// NewPerformanceOptimizer creates a new performance optimizer
func NewPerformanceOptimizer(config *PerformanceConfig) *PerformanceOptimizer {
	po := &PerformanceOptimizer{
		config: config,
		metrics: &PerformanceMetrics{
			StartTime: time.Now(),
		},
	}
	
	// Initialize components
	if config.CacheEnabled {
		po.cache = NewCacheManager(config.CacheSize, config.CacheTTL, config.CacheCleanup)
	}
	
	if config.PoolEnabled {
		po.connectionPool = NewConnectionPool(config.MaxConnections, config.MinConnections, config.IdleTimeout, config.MaxLifetime)
	}
	
	if config.MonitoringEnabled {
		po.resourceMonitor = NewResourceMonitor(config.MetricsInterval, config.AlertThresholds)
		go po.resourceMonitor.Start()
	}
	
	// Start metrics collection
	go po.collectMetrics()
	
	return po
}

// PerformanceMiddleware returns the performance optimization middleware
func (po *PerformanceOptimizer) PerformanceMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		
		// Set request timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), po.config.RequestTimeout)
		defer cancel()
		c.Request = c.Request.WithContext(ctx)
		
		// Check memory usage
		if po.isMemoryThresholdExceeded() {
			po.forceGC()
		}
		
		// Process request
		c.Next()
		
		// Update metrics
		duration := time.Since(start)
		po.updateMetrics(duration, c.Writer.Status())
	})
}

// isMemoryThresholdExceeded checks if memory usage exceeds threshold
func (po *PerformanceOptimizer) isMemoryThresholdExceeded() bool {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	threshold := uint64(po.config.GCThreshold)
	return m.Alloc > threshold
}

// forceGC forces garbage collection
func (po *PerformanceOptimizer) forceGC() {
	runtime.GC()
}

// updateMetrics updates performance metrics
func (po *PerformanceOptimizer) updateMetrics(duration time.Duration, statusCode int) {
	po.mutex.Lock()
	defer po.mutex.Unlock()
	
	po.metrics.TotalRequests++
	
	if statusCode >= 200 && statusCode < 400 {
		po.metrics.SuccessfulRequests++
	} else {
		po.metrics.FailedRequests++
	}
	
	// Update average response time
	if po.metrics.TotalRequests == 1 {
		po.metrics.AverageResponseTime = float64(duration.Nanoseconds()) / 1000000.0
	} else {
		// Exponential moving average
		alpha := 0.1
		po.metrics.AverageResponseTime = alpha*float64(duration.Nanoseconds())/1000000.0 + (1-alpha)*po.metrics.AverageResponseTime
	}
}

// collectMetrics collects performance metrics
func (po *PerformanceOptimizer) collectMetrics() {
	ticker := time.NewTicker(po.config.MetricsInterval)
	defer ticker.Stop()
	
	for range ticker.C {
		po.mutex.Lock()
		
		// Update memory metrics
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		
		po.metrics.MemoryAlloc = m.Alloc
		po.metrics.MemorySys = m.Sys
		po.metrics.MemoryHeap = m.HeapAlloc
		po.metrics.MemoryStack = m.StackInuse
		po.metrics.GCCount = m.NumGC
		po.metrics.GCPauseTotal = time.Duration(m.PauseTotalNs)
		
		// Update cache metrics
		if po.cache != nil {
			po.metrics.CacheHits = po.cache.GetHits()
			po.metrics.CacheMisses = po.cache.GetMisses()
			po.metrics.CacheSize = po.cache.GetSize()
		}
		
		// Update connection metrics
		if po.connectionPool != nil {
			po.metrics.ActiveConnections = po.connectionPool.GetActiveConnections()
			po.metrics.TotalConnections = po.connectionPool.GetTotalConnections()
			po.metrics.ConnectionErrors = po.connectionPool.GetErrors()
		}
		
		// Update system metrics
		po.metrics.CPUUsage = po.getCPUUsage()
		po.metrics.LoadAverage = po.getLoadAverage()
		po.metrics.Uptime = time.Since(po.metrics.StartTime)
		po.metrics.LastUpdate = time.Now()
		
		po.mutex.Unlock()
		
		// Check for alerts
		if po.resourceMonitor != nil {
			po.resourceMonitor.CheckAlerts(po.metrics)
		}
	}
}

// getCPUUsage returns current CPU usage (simplified)
func (po *PerformanceOptimizer) getCPUUsage() float64 {
	// This is a simplified implementation
	// In production, use a proper CPU monitoring library
	return 0.0
}

// getLoadAverage returns current load average (simplified)
func (po *PerformanceOptimizer) getLoadAverage() float64 {
	// This is a simplified implementation
	// In production, use a proper load monitoring library
	return 0.0
}

// GetMetrics returns current performance metrics
func (po *PerformanceOptimizer) GetMetrics() *PerformanceMetrics {
	po.mutex.RLock()
	defer po.mutex.RUnlock()
	
	// Return a copy of metrics
	return &PerformanceMetrics{
		TotalRequests:      po.metrics.TotalRequests,
		SuccessfulRequests: po.metrics.SuccessfulRequests,
		FailedRequests:     po.metrics.FailedRequests,
		AverageResponseTime: po.metrics.AverageResponseTime,
		MemoryAlloc:        po.metrics.MemoryAlloc,
		MemorySys:          po.metrics.MemorySys,
		MemoryHeap:         po.metrics.MemoryHeap,
		MemoryStack:        po.metrics.MemoryStack,
		GCCount:            po.metrics.GCCount,
		GCPauseTotal:       po.metrics.GCPauseTotal,
		CacheHits:          po.metrics.CacheHits,
		CacheMisses:        po.metrics.CacheMisses,
		CacheSize:          po.metrics.CacheSize,
		ActiveConnections:  po.metrics.ActiveConnections,
		TotalConnections:   po.metrics.TotalConnections,
		ConnectionErrors:   po.metrics.ConnectionErrors,
		CPUUsage:           po.metrics.CPUUsage,
		LoadAverage:        po.metrics.LoadAverage,
		Uptime:             po.metrics.Uptime,
		LastUpdate:         po.metrics.LastUpdate,
		StartTime:          po.metrics.StartTime,
	}
}

// ResetMetrics resets performance metrics
func (po *PerformanceOptimizer) ResetMetrics() {
	po.mutex.Lock()
	defer po.mutex.Unlock()
	
	po.metrics = &PerformanceMetrics{
		StartTime: time.Now(),
	}
}

// GetHealthStatus returns system health status
func (po *PerformanceOptimizer) GetHealthStatus() map[string]interface{} {
	metrics := po.GetMetrics()
	config := po.config
	
	// Calculate health scores
	memoryUsage := float64(metrics.MemoryAlloc) / float64(config.MemoryLimit) * 100
	errorRate := float64(metrics.FailedRequests) / float64(metrics.TotalRequests) * 100
	
	health := "healthy"
	if memoryUsage > config.AlertThresholds.MemoryUsage || 
	   metrics.CPUUsage > config.AlertThresholds.CPUUsage ||
	   metrics.AverageResponseTime > config.AlertThresholds.ResponseTime ||
	   errorRate > config.AlertThresholds.ErrorRate ||
	   metrics.ActiveConnections > config.AlertThresholds.ConnectionCount {
		health = "warning"
	}
	
	if memoryUsage > 95 || errorRate > 10 || metrics.ActiveConnections > config.MaxConnections {
		health = "critical"
	}
	
	return map[string]interface{}{
		"health": health,
		"metrics": metrics,
		"thresholds": config.AlertThresholds,
		"memory_usage_percent": memoryUsage,
		"error_rate_percent": errorRate,
		"timestamp": time.Now().Unix(),
	}
}

// GetPerformanceOptimizerForEnvironment returns performance optimizer for environment
func GetPerformanceOptimizerForEnvironment(env string) *PerformanceOptimizer {
	var config *PerformanceConfig
	
	switch env {
	case "production":
		config = ProductionPerformanceConfig()
	case "development":
		config = DefaultPerformanceConfig()
	default:
		config = DefaultPerformanceConfig()
	}
	
	return NewPerformanceOptimizer(config)
}