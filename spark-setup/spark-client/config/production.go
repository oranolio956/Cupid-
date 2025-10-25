package config

import (
	"encoding/json"
	"os"
	"time"
)

// ProductionConfig holds the production server configuration
type ProductionConfig struct {
	Host   string `json:"host"`
	Port   int    `json:"port"`
	Path   string `json:"path"`
	Secure bool   `json:"secure"`
	Salt   string `json:"salt"`
}

// LoadProductionConfig loads configuration from environment variables or defaults
func LoadProductionConfig() {
	// Default production values for Render deployment
	prodConfig := ProductionConfig{
		Host:   "spark-backend-fixed-v2.onrender.com",
		Port:   443, // Render uses HTTPS, so port 443
		Path:   "/api",
		Secure: true, // Render only supports HTTPS
		Salt:   "a2dac101827c8d47f00831f2d6c078b2", // Same as server config.json
	}

	// Override with environment variables if set
	if host := os.Getenv("SPARK_SERVER_HOST"); host != "" {
		prodConfig.Host = host
	}
	if port := os.Getenv("SPARK_SERVER_PORT"); port != "" {
		// Parse port from string
		if port == "443" {
			prodConfig.Port = 443
		} else if port == "80" {
			prodConfig.Port = 80
		}
	}
	if salt := os.Getenv("SPARK_SALT"); salt != "" {
		prodConfig.Salt = salt
	}

	// Set the global Config
	Config.Host = prodConfig.Host
	Config.Port = prodConfig.Port
	Config.Path = prodConfig.Path
	Config.Secure = prodConfig.Secure
	Config.Key = prodConfig.Salt
	Config.UUID = generateDeviceUUID()
}

// generateDeviceUUID creates a unique device identifier
func generateDeviceUUID() string {
	// Simple UUID generation - in production this should be more sophisticated
	hostname, _ := os.Hostname()
	return "device-" + hostname + "-" + generateRandomString(8)
}

// generateRandomString creates a random string of specified length
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}