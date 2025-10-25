package monitoring

import (
	"sort"
	"sync"
	"time"
)

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

// NewMetricsStore creates a new metrics store
func NewMetricsStore(retentionPeriod time.Duration, maxPoints int) *MetricsStore {
	ms := &MetricsStore{
		metrics:        make(map[string][]MetricPoint),
		retentionPeriod: retentionPeriod,
		maxPoints:       maxPoints,
	}
	
	// Start cleanup goroutine
	go ms.cleanup()
	
	return ms
}

// RecordMetric records a metric
func (ms *MetricsStore) RecordMetric(name string, value float64, labels map[string]string) {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()
	
	point := MetricPoint{
		Timestamp: time.Now(),
		Value:     value,
		Labels:    labels,
	}
	
	ms.metrics[name] = append(ms.metrics[name], point)
	
	// Limit the number of points per metric
	if len(ms.metrics[name]) > ms.maxPoints {
		ms.metrics[name] = ms.metrics[name][len(ms.metrics[name])-ms.maxPoints:]
	}
}

// GetMetrics returns metrics for a given name
func (ms *MetricsStore) GetMetrics(name string, since time.Time) []MetricPoint {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	points, exists := ms.metrics[name]
	if !exists {
		return []MetricPoint{}
	}
	
	var result []MetricPoint
	for _, point := range points {
		if point.Timestamp.After(since) {
			result = append(result, point)
		}
	}
	
	// Sort by timestamp
	sort.Slice(result, func(i, j int) bool {
		return result[i].Timestamp.Before(result[j].Timestamp)
	})
	
	return result
}

// GetLatestMetric returns the latest metric value
func (ms *MetricsStore) GetLatestMetric(name string) (float64, bool) {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	points, exists := ms.metrics[name]
	if !exists || len(points) == 0 {
		return 0, false
	}
	
	// Get the latest point
	latest := points[len(points)-1]
	return latest.Value, true
}

// GetMetricStats returns statistics for a metric
func (ms *MetricsStore) GetMetricStats(name string, since time.Time) map[string]interface{} {
	points := ms.GetMetrics(name, since)
	
	if len(points) == 0 {
		return map[string]interface{}{
			"count": 0,
			"min":   0,
			"max":   0,
			"avg":   0,
		}
	}
	
	var sum float64
	min := points[0].Value
	max := points[0].Value
	
	for _, point := range points {
		sum += point.Value
		if point.Value < min {
			min = point.Value
		}
		if point.Value > max {
			max = point.Value
		}
	}
	
	avg := sum / float64(len(points))
	
	return map[string]interface{}{
		"count": len(points),
		"min":   min,
		"max":   max,
		"avg":   avg,
		"sum":   sum,
	}
}

// GetMetricNames returns all metric names
func (ms *MetricsStore) GetMetricNames() []string {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	var names []string
	for name := range ms.metrics {
		names = append(names, name)
	}
	
	return names
}

// GetMetricCount returns the number of metrics
func (ms *MetricsStore) GetMetricCount() int {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	return len(ms.metrics)
}

// GetTotalPoints returns the total number of data points
func (ms *MetricsStore) GetTotalPoints() int {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	total := 0
	for _, points := range ms.metrics {
		total += len(points)
	}
	
	return total
}

// cleanup removes old metrics
func (ms *MetricsStore) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		ms.mutex.Lock()
		
		cutoff := time.Now().Add(-ms.retentionPeriod)
		
		for name, points := range ms.metrics {
			var filtered []MetricPoint
			for _, point := range points {
				if point.Timestamp.After(cutoff) {
					filtered = append(filtered, point)
				}
			}
			ms.metrics[name] = filtered
		}
		
		ms.mutex.Unlock()
	}
}

// Clear clears all metrics
func (ms *MetricsStore) Clear() {
	ms.mutex.Lock()
	defer ms.mutex.Unlock()
	
	ms.metrics = make(map[string][]MetricPoint)
}

// GetMetricsSummary returns a summary of all metrics
func (ms *MetricsStore) GetMetricsSummary() map[string]interface{} {
	ms.mutex.RLock()
	defer ms.mutex.RUnlock()
	
	summary := make(map[string]interface{})
	
	for name, points := range ms.metrics {
		if len(points) == 0 {
			continue
		}
		
		var sum float64
		min := points[0].Value
		max := points[0].Value
		
		for _, point := range points {
			sum += point.Value
			if point.Value < min {
				min = point.Value
			}
			if point.Value > max {
				max = point.Value
			}
		}
		
		avg := sum / float64(len(points))
		latest := points[len(points)-1]
		
		summary[name] = map[string]interface{}{
			"count":   len(points),
			"min":     min,
			"max":     max,
			"avg":     avg,
			"sum":     sum,
			"latest":  latest.Value,
			"latest_timestamp": latest.Timestamp,
		}
	}
	
	return summary
}