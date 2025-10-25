package monitoring

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

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
	
	// Statistics
	stats *AlertStats
}

// AlertStats holds alert statistics
type AlertStats struct {
	TotalAlerts     int64 `json:"total_alerts"`
	ActiveAlerts    int   `json:"active_alerts"`
	ResolvedAlerts  int64 `json:"resolved_alerts"`
	CriticalAlerts  int64 `json:"critical_alerts"`
	WarningAlerts   int64 `json:"warning_alerts"`
	AlertsLastHour  int64 `json:"alerts_last_hour"`
	AlertsLastDay   int64 `json:"alerts_last_day"`
}

// NewAlertSystem creates a new alert system
func NewAlertSystem(cooldown time.Duration, maxPerMinute int) *AlertSystem {
	as := &AlertSystem{
		alerts:      make([]Alert, 0),
		cooldown:    cooldown,
		maxPerMinute: maxPerMinute,
		notifiers:   make([]Notifier, 0),
		stats:       &AlertStats{},
	}
	
	// Add default notifiers
	as.AddNotifier(&LogNotifier{})
	as.AddNotifier(&WebhookNotifier{})
	
	return as
}

// RecordAlert records an alert
func (as *AlertSystem) RecordAlert(alert *Alert) {
	as.mutex.Lock()
	defer as.mutex.Unlock()
	
	// Check cooldown
	if as.isInCooldown(alert.Type, alert.Labels) {
		return
	}
	
	// Check rate limit
	if as.isRateLimited() {
		return
	}
	
	// Add alert
	as.alerts = append(as.alerts, *alert)
	as.updateStats(alert)
	
	// Send notifications
	as.sendNotifications(alert)
}

// GetAlerts returns alerts since a given time
func (as *AlertSystem) GetAlerts(since time.Time) []Alert {
	as.mutex.RLock()
	defer as.mutex.RUnlock()
	
	var result []Alert
	for _, alert := range as.alerts {
		if alert.Timestamp.After(since) {
			result = append(result, alert)
		}
	}
	
	return result
}

// GetActiveAlerts returns active alerts
func (as *AlertSystem) GetActiveAlerts() []Alert {
	as.mutex.RLock()
	defer as.mutex.RUnlock()
	
	var result []Alert
	for _, alert := range as.alerts {
		if !alert.Resolved {
			result = append(result, alert)
		}
	}
	
	return result
}

// ResolveAlert resolves an alert by ID
func (as *AlertSystem) ResolveAlert(id string) bool {
	as.mutex.Lock()
	defer as.mutex.Unlock()
	
	for i, alert := range as.alerts {
		if alert.ID == id && !alert.Resolved {
			now := time.Now()
			as.alerts[i].Resolved = true
			as.alerts[i].ResolvedAt = &now
			as.stats.ResolvedAlerts++
			as.stats.ActiveAlerts--
			return true
		}
	}
	
	return false
}

// GetStats returns alert statistics
func (as *AlertSystem) GetStats() map[string]interface{} {
	as.mutex.RLock()
	defer as.mutex.RUnlock()
	
	// Update time-based stats
	now := time.Now()
	lastHour := now.Add(-1 * time.Hour)
	lastDay := now.Add(-24 * time.Hour)
	
	alertsLastHour := 0
	alertsLastDay := 0
	
	for _, alert := range as.alerts {
		if alert.Timestamp.After(lastHour) {
			alertsLastHour++
		}
		if alert.Timestamp.After(lastDay) {
			alertsLastDay++
		}
	}
	
	return map[string]interface{}{
		"total_alerts":     as.stats.TotalAlerts,
		"active_alerts":    as.stats.ActiveAlerts,
		"resolved_alerts":  as.stats.ResolvedAlerts,
		"critical_alerts":  as.stats.CriticalAlerts,
		"warning_alerts":   as.stats.WarningAlerts,
		"alerts_last_hour": alertsLastHour,
		"alerts_last_day":  alertsLastDay,
	}
}

// AddNotifier adds a notification channel
func (as *AlertSystem) AddNotifier(notifier Notifier) {
	as.mutex.Lock()
	defer as.mutex.Unlock()
	
	as.notifiers = append(as.notifiers, notifier)
}

// isInCooldown checks if an alert type is in cooldown
func (as *AlertSystem) isInCooldown(alertType string, labels map[string]string) bool {
	cutoff := time.Now().Add(-as.cooldown)
	
	for _, alert := range as.alerts {
		if alert.Type == alertType && alert.Timestamp.After(cutoff) {
			// Check if labels match (simplified)
			if as.labelsMatch(alert.Labels, labels) {
				return true
			}
		}
	}
	
	return false
}

// isRateLimited checks if rate limit is exceeded
func (as *AlertSystem) isRateLimited() bool {
	cutoff := time.Now().Add(-1 * time.Minute)
	count := 0
	
	for _, alert := range as.alerts {
		if alert.Timestamp.After(cutoff) {
			count++
		}
	}
	
	return count >= as.maxPerMinute
}

// labelsMatch checks if labels match (simplified)
func (as *AlertSystem) labelsMatch(labels1, labels2 map[string]string) bool {
	if len(labels1) != len(labels2) {
		return false
	}
	
	for k, v := range labels1 {
		if labels2[k] != v {
			return false
		}
	}
	
	return true
}

// updateStats updates alert statistics
func (as *AlertSystem) updateStats(alert *Alert) {
	as.stats.TotalAlerts++
	as.stats.ActiveAlerts++
	
	if alert.Severity == "critical" {
		as.stats.CriticalAlerts++
	} else if alert.Severity == "warning" {
		as.stats.WarningAlerts++
	}
}

// sendNotifications sends notifications for an alert
func (as *AlertSystem) sendNotifications(alert *Alert) {
	for _, notifier := range as.notifiers {
		go func(n Notifier) {
			if err := n.SendAlert(alert); err != nil {
				log.Printf("Failed to send alert notification: %v", err)
			}
		}(notifier)
	}
}

// LogNotifier provides log-based notifications
type LogNotifier struct{}

// SendAlert sends an alert to logs
func (ln *LogNotifier) SendAlert(alert *Alert) error {
	log.Printf("ALERT [%s] %s: %s (Value: %.2f, Threshold: %.2f)",
		alert.Severity, alert.Type, alert.Message, alert.Value, alert.Threshold)
	return nil
}

// WebhookNotifier provides webhook-based notifications
type WebhookNotifier struct {
	URL string
}

// SendAlert sends an alert via webhook
func (wn *WebhookNotifier) SendAlert(alert *Alert) error {
	if wn.URL == "" {
		return nil
	}
	
	payload, err := json.Marshal(alert)
	if err != nil {
		return err
	}
	
	resp, err := http.Post(wn.URL, "application/json", strings.NewReader(string(payload)))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		return fmt.Errorf("webhook returned status %d", resp.StatusCode)
	}
	
	return nil
}

// EmailNotifier provides email-based notifications
type EmailNotifier struct {
	SMTPHost string
	SMTPPort int
	Username string
	Password string
	From     string
	To       []string
}

// SendAlert sends an alert via email
func (en *EmailNotifier) SendAlert(alert *Alert) error {
	// This would implement actual email sending
	// For now, just log
	log.Printf("EMAIL ALERT [%s] %s: %s", alert.Severity, alert.Type, alert.Message)
	return nil
}

// SlackNotifier provides Slack-based notifications
type SlackNotifier struct {
	WebhookURL string
	Channel    string
	Username   string
}

// SendAlert sends an alert via Slack
func (sn *SlackNotifier) SendAlert(alert *Alert) error {
	if sn.WebhookURL == "" {
		return nil
	}
	
	// This would implement actual Slack webhook sending
	// For now, just log
	log.Printf("SLACK ALERT [%s] %s: %s", alert.Severity, alert.Type, alert.Message)
	return nil
}