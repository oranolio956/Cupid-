package optimizations

import (
	"log"
	"runtime"
	"time"
)

// ResourceMonitor provides resource monitoring functionality
type ResourceMonitor struct {
	// Configuration
	interval        time.Duration
	alertThresholds AlertThresholds
	
	// Monitoring state
	isRunning bool
	stopChan  chan bool
	
	// Alert handlers
	alertHandlers []AlertHandler
}

// AlertHandler handles alert events
type AlertHandler interface {
	HandleAlert(alert *Alert)
}

// Alert represents an alert event
type Alert struct {
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`
	Message     string    `json:"message"`
	Value       float64   `json:"value"`
	Threshold   float64   `json:"threshold"`
	Timestamp   time.Time `json:"timestamp"`
	Metrics     *PerformanceMetrics `json:"metrics"`
}

// DefaultAlertHandler provides default alert handling
type DefaultAlertHandler struct{}

// HandleAlert handles alert events
func (h *DefaultAlertHandler) HandleAlert(alert *Alert) {
	log.Printf("ALERT [%s] %s: %s (Value: %.2f, Threshold: %.2f)",
		alert.Severity, alert.Type, alert.Message, alert.Value, alert.Threshold)
}

// NewResourceMonitor creates a new resource monitor
func NewResourceMonitor(interval time.Duration, thresholds AlertThresholds) *ResourceMonitor {
	rm := &ResourceMonitor{
		interval:        interval,
		alertThresholds: thresholds,
		stopChan:        make(chan bool),
		alertHandlers:   []AlertHandler{&DefaultAlertHandler{}},
	}
	
	return rm
}

// Start starts the resource monitor
func (rm *ResourceMonitor) Start() {
	if rm.isRunning {
		return
	}
	
	rm.isRunning = true
	go rm.monitor()
}

// Stop stops the resource monitor
func (rm *ResourceMonitor) Stop() {
	if !rm.isRunning {
		return
	}
	
	rm.isRunning = false
	rm.stopChan <- true
}

// AddAlertHandler adds an alert handler
func (rm *ResourceMonitor) AddAlertHandler(handler AlertHandler) {
	rm.alertHandlers = append(rm.alertHandlers, handler)
}

// CheckAlerts checks for alert conditions
func (rm *ResourceMonitor) CheckAlerts(metrics *PerformanceMetrics) {
	alerts := rm.checkMemoryAlerts(metrics)
	alerts = append(alerts, rm.checkCPUAlerts(metrics)...)
	alerts = append(alerts, rm.checkResponseTimeAlerts(metrics)...)
	alerts = append(alerts, rm.checkErrorRateAlerts(metrics)...)
	alerts = append(alerts, rm.checkConnectionAlerts(metrics)...)
	
	// Send alerts
	for _, alert := range alerts {
		rm.sendAlert(alert)
	}
}

// checkMemoryAlerts checks for memory-related alerts
func (rm *ResourceMonitor) checkMemoryAlerts(metrics *PerformanceMetrics) []*Alert {
	var alerts []*Alert
	
	// Calculate memory usage percentage (simplified)
	memoryUsage := float64(metrics.MemoryAlloc) / (1024 * 1024 * 1024) * 100 // Convert to GB
	
	if memoryUsage > rm.alertThresholds.MemoryUsage {
		severity := "warning"
		if memoryUsage > 95 {
			severity = "critical"
		}
		
		alerts = append(alerts, &Alert{
			Type:      "memory_usage",
			Severity:  severity,
			Message:   "High memory usage detected",
			Value:     memoryUsage,
			Threshold: rm.alertThresholds.MemoryUsage,
			Timestamp: time.Now(),
			Metrics:   metrics,
		})
	}
	
	return alerts
}

// checkCPUAlerts checks for CPU-related alerts
func (rm *ResourceMonitor) checkCPUAlerts(metrics *PerformanceMetrics) []*Alert {
	var alerts []*Alert
	
	if metrics.CPUUsage > rm.alertThresholds.CPUUsage {
		severity := "warning"
		if metrics.CPUUsage > 95 {
			severity = "critical"
		}
		
		alerts = append(alerts, &Alert{
			Type:      "cpu_usage",
			Severity:  severity,
			Message:   "High CPU usage detected",
			Value:     metrics.CPUUsage,
			Threshold: rm.alertThresholds.CPUUsage,
			Timestamp: time.Now(),
			Metrics:   metrics,
		})
	}
	
	return alerts
}

// checkResponseTimeAlerts checks for response time alerts
func (rm *ResourceMonitor) checkResponseTimeAlerts(metrics *PerformanceMetrics) []*Alert {
	var alerts []*Alert
	
	if metrics.AverageResponseTime > rm.alertThresholds.ResponseTime {
		severity := "warning"
		if metrics.AverageResponseTime > rm.alertThresholds.ResponseTime*2 {
			severity = "critical"
		}
		
		alerts = append(alerts, &Alert{
			Type:      "response_time",
			Severity:  severity,
			Message:   "High response time detected",
			Value:     metrics.AverageResponseTime,
			Threshold: rm.alertThresholds.ResponseTime,
			Timestamp: time.Now(),
			Metrics:   metrics,
		})
	}
	
	return alerts
}

// checkErrorRateAlerts checks for error rate alerts
func (rm *ResourceMonitor) checkErrorRateAlerts(metrics *PerformanceMetrics) []*Alert {
	var alerts []*Alert
	
	if metrics.TotalRequests > 0 {
		errorRate := float64(metrics.FailedRequests) / float64(metrics.TotalRequests) * 100
		
		if errorRate > rm.alertThresholds.ErrorRate {
			severity := "warning"
			if errorRate > rm.alertThresholds.ErrorRate*2 {
				severity = "critical"
			}
			
			alerts = append(alerts, &Alert{
				Type:      "error_rate",
				Severity:  severity,
				Message:   "High error rate detected",
				Value:     errorRate,
				Threshold: rm.alertThresholds.ErrorRate,
				Timestamp: time.Now(),
				Metrics:   metrics,
			})
		}
	}
	
	return alerts
}

// checkConnectionAlerts checks for connection-related alerts
func (rm *ResourceMonitor) checkConnectionAlerts(metrics *PerformanceMetrics) []*Alert {
	var alerts []*Alert
	
	if metrics.ActiveConnections > rm.alertThresholds.ConnectionCount {
		severity := "warning"
		if metrics.ActiveConnections > rm.alertThresholds.ConnectionCount*2 {
			severity = "critical"
		}
		
		alerts = append(alerts, &Alert{
			Type:      "connection_count",
			Severity:  severity,
			Message:   "High connection count detected",
			Value:     float64(metrics.ActiveConnections),
			Threshold: float64(rm.alertThresholds.ConnectionCount),
			Timestamp: time.Now(),
			Metrics:   metrics,
		})
	}
	
	return alerts
}

// sendAlert sends an alert to all handlers
func (rm *ResourceMonitor) sendAlert(alert *Alert) {
	for _, handler := range rm.alertHandlers {
		go handler.HandleAlert(alert)
	}
}

// monitor runs the monitoring loop
func (rm *ResourceMonitor) monitor() {
	ticker := time.NewTicker(rm.interval)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			// Monitor system resources
			rm.monitorSystemResources()
			
		case <-rm.stopChan:
			return
		}
	}
}

// monitorSystemResources monitors system resources
func (rm *ResourceMonitor) monitorSystemResources() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	// Log memory statistics
	log.Printf("Memory: Alloc=%d KB, Sys=%d KB, Heap=%d KB, Stack=%d KB, GC=%d",
		m.Alloc/1024, m.Sys/1024, m.HeapAlloc/1024, m.StackInuse/1024, m.NumGC)
	
	// Force GC if memory usage is high
	if m.Alloc > 100*1024*1024 { // 100MB
		runtime.GC()
		log.Println("Forced garbage collection due to high memory usage")
	}
}