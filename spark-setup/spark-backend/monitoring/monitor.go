package monitoring

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Monitor provides comprehensive monitoring functionality
type Monitor struct {
	// Configuration
	config *MonitorConfig
	
	// Metrics storage
	metrics *MetricsStore
	
	// Alert system
	alertSystem *AlertSystem
	
	// Health checks
	healthChecks map[string]HealthCheck
	
	// Mutex for thread safety
	mutex sync.RWMutex
	
	// Context for cancellation
	ctx    context.Context
	cancel context.CancelFunc
}

// MonitorConfig holds monitoring configuration
type MonitorConfig struct {
	// Monitoring settings
	Enabled           bool          `json:"enabled"`
	MetricsInterval   time.Duration `json:"metrics_interval"`
	HealthCheckInterval time.Duration `json:"health_check_interval"`
	RetentionPeriod   time.Duration `json:"retention_period"`
	
	// Alert settings
	AlertEnabled      bool          `json:"alert_enabled"`
	AlertCooldown     time.Duration `json:"alert_cooldown"`
	MaxAlertsPerMinute int          `json:"max_alerts_per_minute"`
	
	// Notification settings
	EmailEnabled      bool          `json:"email_enabled"`
	WebhookEnabled    bool          `json:"webhook_enabled"`
	SlackEnabled      bool          `json:"slack_enabled"`
	
	// Thresholds
	Thresholds        AlertThresholds `json:"thresholds"`
}

// MetricsStore stores and manages metrics
type MetricsStore struct {
	// Metrics storage
	metrics map[string][]MetricPoint
	
	// Configuration
	retentionPeriod time.Duration
	maxPoints       int
	
	// Mutex for thread safety
	mutex sync.RWMutex
}

// MetricPoint represents a single metric data point
type MetricPoint struct {
	Timestamp time.Time   `json:"timestamp"`
	Value     float64     `json:"value"`
	Labels    map[string]string `json:"labels"`
}

// HealthCheck represents a health check
type HealthCheck struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CheckFunc   func() (bool, string, error) `json:"-"`
	Interval    time.Duration `json:"interval"`
	LastCheck   time.Time `json:"last_check"`
	LastResult  bool      `json:"last_result"`
	LastMessage string    `json:"last_message"`
	LastError   error     `json:"last_error"`
}

// AlertSystem manages alerts
type AlertSystem struct {
	// Alert storage
	alerts []Alert
	
	// Configuration
	cooldown     time.Duration
	maxPerMinute int
	
	// Notification channels
	notifiers []Notifier
	
	// Mutex for thread safety
	mutex sync.RWMutex
}

// Alert represents an alert
type Alert struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`
	Message     string    `json:"message"`
	Value       float64   `json:"value"`
	Threshold   float64   `json:"threshold"`
	Timestamp   time.Time `json:"timestamp"`
	Resolved    bool      `json:"resolved"`
	ResolvedAt  *time.Time `json:"resolved_at"`
	Labels      map[string]string `json:"labels"`
}

// Notifier interface for alert notifications
type Notifier interface {
	SendAlert(alert *Alert) error
}

// DefaultMonitorConfig returns default monitoring configuration
func DefaultMonitorConfig() *MonitorConfig {
	return &MonitorConfig{
		Enabled:           true,
		MetricsInterval:   10 * time.Second,
		HealthCheckInterval: 30 * time.Second,
		RetentionPeriod:   24 * time.Hour,
		
		AlertEnabled:      true,
		AlertCooldown:     5 * time.Minute,
		MaxAlertsPerMinute: 10,
		
		EmailEnabled:      false,
		WebhookEnabled:    true,
		SlackEnabled:      false,
		
		Thresholds: AlertThresholds{
			MemoryUsage:     80.0,
			CPUUsage:        80.0,
			ResponseTime:    1000.0,
			ErrorRate:       5.0,
			ConnectionCount: 800,
		},
	}
}

// ProductionMonitorConfig returns production monitoring configuration
func ProductionMonitorConfig() *MonitorConfig {
	return &MonitorConfig{
		Enabled:           true,
		MetricsInterval:   5 * time.Second,
		HealthCheckInterval: 15 * time.Second,
		RetentionPeriod:   7 * 24 * time.Hour,
		
		AlertEnabled:      true,
		AlertCooldown:     2 * time.Minute,
		MaxAlertsPerMinute: 20,
		
		EmailEnabled:      true,
		WebhookEnabled:    true,
		SlackEnabled:      true,
		
		Thresholds: AlertThresholds{
			MemoryUsage:     85.0,
			CPUUsage:        85.0,
			ResponseTime:    500.0,
			ErrorRate:       2.0,
			ConnectionCount: 400,
		},
	}
}

// NewMonitor creates a new monitor
func NewMonitor(config *MonitorConfig) *Monitor {
	ctx, cancel := context.WithCancel(context.Background())
	
	monitor := &Monitor{
		config:       config,
		metrics:      NewMetricsStore(config.RetentionPeriod, 1000),
		alertSystem:  NewAlertSystem(config.AlertCooldown, config.MaxAlertsPerMinute),
		healthChecks: make(map[string]HealthCheck),
		ctx:          ctx,
		cancel:       cancel,
	}
	
	// Add default health checks
	monitor.addDefaultHealthChecks()
	
	// Start monitoring
	if config.Enabled {
		go monitor.startMonitoring()
	}
	
	return monitor
}

// AddHealthCheck adds a health check
func (m *Monitor) AddHealthCheck(name, description string, checkFunc func() (bool, string, error), interval time.Duration) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	m.healthChecks[name] = HealthCheck{
		Name:        name,
		Description: description,
		CheckFunc:   checkFunc,
		Interval:    interval,
		LastCheck:   time.Now(),
		LastResult:  true,
		LastMessage: "Not checked yet",
	}
}

// RecordMetric records a metric
func (m *Monitor) RecordMetric(name string, value float64, labels map[string]string) {
	m.metrics.RecordMetric(name, value, labels)
}

// RecordAlert records an alert
func (m *Monitor) RecordAlert(alertType, severity, message string, value, threshold float64, labels map[string]string) {
	alert := &Alert{
		ID:        generateAlertID(),
		Type:      alertType,
		Severity:  severity,
		Message:   message,
		Value:     value,
		Threshold: threshold,
		Timestamp: time.Now(),
		Resolved:  false,
		Labels:    labels,
	}
	
	m.alertSystem.RecordAlert(alert)
}

// GetMetrics returns metrics for a given name
func (m *Monitor) GetMetrics(name string, since time.Time) []MetricPoint {
	return m.metrics.GetMetrics(name, since)
}

// GetHealthStatus returns the health status
func (m *Monitor) GetHealthStatus() map[string]interface{} {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	
	healthChecks := make(map[string]interface{})
	overallHealth := "healthy"
	
	for name, check := range m.healthChecks {
		healthChecks[name] = map[string]interface{}{
			"name":        check.Name,
			"description": check.Description,
			"last_check":  check.LastCheck,
			"last_result": check.LastResult,
			"last_message": check.LastMessage,
			"last_error":  check.LastError,
		}
		
		if !check.LastResult {
			overallHealth = "unhealthy"
		}
	}
	
	return map[string]interface{}{
		"overall_health": overallHealth,
		"health_checks":  healthChecks,
		"timestamp":      time.Now().Unix(),
	}
}

// GetAlerts returns recent alerts
func (m *Monitor) GetAlerts(since time.Time) []Alert {
	return m.alertSystem.GetAlerts(since)
}

// GetAlertStats returns alert statistics
func (m *Monitor) GetAlertStats() map[string]interface{} {
	return m.alertSystem.GetStats()
}

// startMonitoring starts the monitoring loop
func (m *Monitor) startMonitoring() {
	metricsTicker := time.NewTicker(m.config.MetricsInterval)
	healthTicker := time.NewTicker(m.config.HealthCheckInterval)
	
	defer metricsTicker.Stop()
	defer healthTicker.Stop()
	
	for {
		select {
		case <-metricsTicker.C:
			m.collectMetrics()
			
		case <-healthTicker.C:
			m.runHealthChecks()
			
		case <-m.ctx.Done():
			return
		}
	}
}

// collectMetrics collects system metrics
func (m *Monitor) collectMetrics() {
	// Collect system metrics
	m.collectSystemMetrics()
	
	// Collect application metrics
	m.collectApplicationMetrics()
	
	// Check for alerts
	m.checkAlerts()
}

// collectSystemMetrics collects system-level metrics
func (m *Monitor) collectSystemMetrics() {
	// This would collect actual system metrics
	// For now, we'll use placeholder values
	
	m.RecordMetric("system.memory.alloc", 100.0, map[string]string{"type": "bytes"})
	m.RecordMetric("system.memory.sys", 200.0, map[string]string{"type": "bytes"})
	m.RecordMetric("system.cpu.usage", 50.0, map[string]string{"type": "percent"})
	m.RecordMetric("system.load.average", 1.5, map[string]string{"type": "load"})
}

// collectApplicationMetrics collects application-level metrics
func (m *Monitor) collectApplicationMetrics() {
	// This would collect actual application metrics
	// For now, we'll use placeholder values
	
	m.RecordMetric("app.requests.total", 1000.0, map[string]string{"method": "GET"})
	m.RecordMetric("app.requests.success", 950.0, map[string]string{"method": "GET"})
	m.RecordMetric("app.requests.error", 50.0, map[string]string{"method": "GET"})
	m.RecordMetric("app.response.time", 150.0, map[string]string{"endpoint": "/api/info"})
}

// runHealthChecks runs all health checks
func (m *Monitor) runHealthChecks() {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	
	for name, check := range m.healthChecks {
		if time.Since(check.LastCheck) >= check.Interval {
			result, message, err := check.CheckFunc()
			
			check.LastCheck = time.Now()
			check.LastResult = result
			check.LastMessage = message
			check.LastError = err
			
			m.healthChecks[name] = check
			
			// Record health check metric
			value := 1.0
			if !result {
				value = 0.0
			}
			m.RecordMetric("health.check", value, map[string]string{"name": name})
		}
	}
}

// checkAlerts checks for alert conditions
func (m *Monitor) checkAlerts() {
	// This would check actual alert conditions
	// For now, we'll use placeholder logic
	
	// Check memory usage
	memoryUsage := 75.0 // This would be actual memory usage
	if memoryUsage > m.config.Thresholds.MemoryUsage {
		m.RecordAlert("memory_usage", "warning", "High memory usage detected", 
			memoryUsage, m.config.Thresholds.MemoryUsage, map[string]string{"component": "system"})
	}
	
	// Check CPU usage
	cpuUsage := 60.0 // This would be actual CPU usage
	if cpuUsage > m.config.Thresholds.CPUUsage {
		m.RecordAlert("cpu_usage", "warning", "High CPU usage detected", 
			cpuUsage, m.config.Thresholds.CPUUsage, map[string]string{"component": "system"})
	}
}

// addDefaultHealthChecks adds default health checks
func (m *Monitor) addDefaultHealthChecks() {
	// Database health check
	m.AddHealthCheck("database", "Database connectivity", func() (bool, string, error) {
		// This would check actual database connectivity
		return true, "Database is healthy", nil
	}, 30*time.Second)
	
	// API health check
	m.AddHealthCheck("api", "API endpoints", func() (bool, string, error) {
		// This would check actual API endpoints
		return true, "API is healthy", nil
	}, 15*time.Second)
	
	// External services health check
	m.AddHealthCheck("external", "External services", func() (bool, string, error) {
		// This would check actual external services
		return true, "External services are healthy", nil
	}, 60*time.Second)
}

// Stop stops the monitor
func (m *Monitor) Stop() {
	m.cancel()
}

// generateAlertID generates a unique alert ID
func generateAlertID() string {
	return fmt.Sprintf("alert_%d", time.Now().UnixNano())
}