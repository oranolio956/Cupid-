package monitoring

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MonitoringAPI provides monitoring API endpoints
type MonitoringAPI struct {
	monitor *Monitor
}

// NewMonitoringAPI creates a new monitoring API
func NewMonitoringAPI(monitor *Monitor) *MonitoringAPI {
	return &MonitoringAPI{
		monitor: monitor,
	}
}

// RegisterRoutes registers monitoring API routes
func (api *MonitoringAPI) RegisterRoutes(router *gin.RouterGroup) {
	// Metrics endpoints
	router.GET("/metrics", api.GetMetrics)
	router.GET("/metrics/:name", api.GetMetric)
	router.GET("/metrics/:name/stats", api.GetMetricStats)
	
	// Health endpoints
	router.GET("/health", api.GetHealth)
	router.GET("/health/:name", api.GetHealthCheck)
	
	// Alert endpoints
	router.GET("/alerts", api.GetAlerts)
	router.GET("/alerts/active", api.GetActiveAlerts)
	router.POST("/alerts/:id/resolve", api.ResolveAlert)
	router.GET("/alerts/stats", api.GetAlertStats)
	
	// Dashboard endpoints
	router.GET("/dashboard", api.GetDashboard)
	router.GET("/dashboard/metrics", api.GetDashboardMetrics)
	router.GET("/dashboard/health", api.GetDashboardHealth)
	router.GET("/dashboard/alerts", api.GetDashboardAlerts)
}

// GetMetrics returns all metrics
func (api *MonitoringAPI) GetMetrics(c *gin.Context) {
	sinceStr := c.Query("since")
	since := time.Now().Add(-24 * time.Hour) // Default to last 24 hours
	
	if sinceStr != "" {
		if parsed, err := time.Parse(time.RFC3339, sinceStr); err == nil {
			since = parsed
		}
	}
	
	metrics := make(map[string][]MetricPoint)
	for _, name := range api.monitor.metrics.GetMetricNames() {
		metrics[name] = api.monitor.GetMetrics(name, since)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"metrics":  metrics,
		"since":    since,
		"count":    len(metrics),
		"timestamp": time.Now().Unix(),
	})
}

// GetMetric returns a specific metric
func (api *MonitoringAPI) GetMetric(c *gin.Context) {
	name := c.Param("name")
	sinceStr := c.Query("since")
	since := time.Now().Add(-24 * time.Hour) // Default to last 24 hours
	
	if sinceStr != "" {
		if parsed, err := time.Parse(time.RFC3339, sinceStr); err == nil {
			since = parsed
		}
	}
	
	metrics := api.monitor.GetMetrics(name, since)
	
	c.JSON(http.StatusOK, gin.H{
		"name":     name,
		"metrics":  metrics,
		"since":    since,
		"count":    len(metrics),
		"timestamp": time.Now().Unix(),
	})
}

// GetMetricStats returns statistics for a metric
func (api *MonitoringAPI) GetMetricStats(c *gin.Context) {
	name := c.Param("name")
	sinceStr := c.Query("since")
	since := time.Now().Add(-24 * time.Hour) // Default to last 24 hours
	
	if sinceStr != "" {
		if parsed, err := time.Parse(time.RFC3339, sinceStr); err == nil {
			since = parsed
		}
	}
	
	stats := api.monitor.metrics.GetMetricStats(name, since)
	
	c.JSON(http.StatusOK, gin.H{
		"name":     name,
		"stats":    stats,
		"since":    since,
		"timestamp": time.Now().Unix(),
	})
}

// GetHealth returns health status
func (api *MonitoringAPI) GetHealth(c *gin.Context) {
	health := api.monitor.GetHealthStatus()
	
	c.JSON(http.StatusOK, health)
}

// GetHealthCheck returns a specific health check
func (api *MonitoringAPI) GetHealthCheck(c *gin.Context) {
	name := c.Param("name")
	
	api.monitor.mutex.RLock()
	check, exists := api.monitor.healthChecks[name]
	api.monitor.mutex.RUnlock()
	
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Health check not found",
			"name":  name,
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"name":        check.Name,
		"description": check.Description,
		"last_check":  check.LastCheck,
		"last_result": check.LastResult,
		"last_message": check.LastMessage,
		"last_error":  check.LastError,
		"timestamp":   time.Now().Unix(),
	})
}

// GetAlerts returns alerts
func (api *MonitoringAPI) GetAlerts(c *gin.Context) {
	sinceStr := c.Query("since")
	since := time.Now().Add(-24 * time.Hour) // Default to last 24 hours
	
	if sinceStr != "" {
		if parsed, err := time.Parse(time.RFC3339, sinceStr); err == nil {
			since = parsed
		}
	}
	
	alerts := api.monitor.GetAlerts(since)
	
	c.JSON(http.StatusOK, gin.H{
		"alerts":    alerts,
		"since":     since,
		"count":     len(alerts),
		"timestamp": time.Now().Unix(),
	})
}

// GetActiveAlerts returns active alerts
func (api *MonitoringAPI) GetActiveAlerts(c *gin.Context) {
	alerts := api.monitor.alertSystem.GetActiveAlerts()
	
	c.JSON(http.StatusOK, gin.H{
		"alerts":    alerts,
		"count":     len(alerts),
		"timestamp": time.Now().Unix(),
	})
}

// ResolveAlert resolves an alert
func (api *MonitoringAPI) ResolveAlert(c *gin.Context) {
	id := c.Param("id")
	
	success := api.monitor.alertSystem.ResolveAlert(id)
	
	if success {
		c.JSON(http.StatusOK, gin.H{
			"message": "Alert resolved successfully",
			"id":      id,
			"timestamp": time.Now().Unix(),
		})
	} else {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Alert not found or already resolved",
			"id":    id,
		})
	}
}

// GetAlertStats returns alert statistics
func (api *MonitoringAPI) GetAlertStats(c *gin.Context) {
	stats := api.monitor.GetAlertStats()
	
	c.JSON(http.StatusOK, stats)
}

// GetDashboard returns dashboard data
func (api *MonitoringAPI) GetDashboard(c *gin.Context) {
	// Get metrics summary
	metricsSummary := api.monitor.metrics.GetMetricsSummary()
	
	// Get health status
	health := api.monitor.GetHealthStatus()
	
	// Get active alerts
	activeAlerts := api.monitor.alertSystem.GetActiveAlerts()
	
	// Get alert stats
	alertStats := api.monitor.GetAlertStats()
	
	c.JSON(http.StatusOK, gin.H{
		"metrics":      metricsSummary,
		"health":       health,
		"active_alerts": activeAlerts,
		"alert_stats":  alertStats,
		"timestamp":    time.Now().Unix(),
	})
}

// GetDashboardMetrics returns dashboard metrics
func (api *MonitoringAPI) GetDashboardMetrics(c *gin.Context) {
	// Get last hour of metrics
	since := time.Now().Add(-1 * time.Hour)
	
	metrics := make(map[string][]MetricPoint)
	for _, name := range api.monitor.metrics.GetMetricNames() {
		metrics[name] = api.monitor.GetMetrics(name, since)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"metrics":   metrics,
		"since":     since,
		"count":     len(metrics),
		"timestamp": time.Now().Unix(),
	})
}

// GetDashboardHealth returns dashboard health
func (api *MonitoringAPI) GetDashboardHealth(c *gin.Context) {
	health := api.monitor.GetHealthStatus()
	
	c.JSON(http.StatusOK, health)
}

// GetDashboardAlerts returns dashboard alerts
func (api *MonitoringAPI) GetDashboardAlerts(c *gin.Context) {
	// Get last 24 hours of alerts
	since := time.Now().Add(-24 * time.Hour)
	alerts := api.monitor.GetAlerts(since)
	
	// Get active alerts
	activeAlerts := api.monitor.alertSystem.GetActiveAlerts()
	
	// Get alert stats
	alertStats := api.monitor.GetAlertStats()
	
	c.JSON(http.StatusOK, gin.H{
		"alerts":        alerts,
		"active_alerts": activeAlerts,
		"alert_stats":   alertStats,
		"since":         since,
		"timestamp":     time.Now().Unix(),
	})
}