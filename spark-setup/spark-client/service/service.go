package service

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// ServiceManager handles service installation and management
type ServiceManager struct {
	serviceName string
	execPath    string
}

// NewServiceManager creates a new service manager
func NewServiceManager(serviceName, execPath string) *ServiceManager {
	return &ServiceManager{
		serviceName: serviceName,
		execPath:    execPath,
	}
}

// Install installs the client as a service
func (sm *ServiceManager) Install() error {
	switch runtime.GOOS {
	case "windows":
		return sm.installWindows()
	case "linux":
		return sm.installLinux()
	case "darwin":
		return sm.installDarwin()
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
}

// Uninstall removes the service
func (sm *ServiceManager) Uninstall() error {
	switch runtime.GOOS {
	case "windows":
		return sm.uninstallWindows()
	case "linux":
		return sm.uninstallLinux()
	case "darwin":
		return sm.uninstallDarwin()
	default:
		return fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
}

// installWindows installs as Windows service
func (sm *ServiceManager) installWindows() error {
	// Check if running as administrator
	if !sm.isAdmin() {
		return fmt.Errorf("must run as administrator to install service")
	}

	// Create service using sc command
	cmd := exec.Command("sc", "create", sm.serviceName,
		fmt.Sprintf("binPath= \"%s\"", sm.execPath),
		"DisplayName= \"Spark Monitoring Client\"",
		"Description= \"Remote monitoring and administration client\"",
		"start= auto")

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to create service: %v, output: %s", err, string(output))
	}

	// Start the service
	startCmd := exec.Command("sc", "start", sm.serviceName)
	startOutput, err := startCmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to start service: %v, output: %s", err, string(startOutput))
	}

	return nil
}

// uninstallWindows removes Windows service
func (sm *ServiceManager) uninstallWindows() error {
	// Stop service first
	stopCmd := exec.Command("sc", "stop", sm.serviceName)
	stopCmd.Run() // Ignore error if service not running

	// Delete service
	cmd := exec.Command("sc", "delete", sm.serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to delete service: %v, output: %s", err, string(output))
	}

	return nil
}

// installLinux installs as systemd service
func (sm *ServiceManager) installLinux() error {
	// Check if running as root
	if os.Geteuid() != 0 {
		return fmt.Errorf("must run as root to install service")
	}

	// Create systemd service file
	serviceContent := fmt.Sprintf(`[Unit]
Description=Spark Monitoring Client
After=network.target

[Service]
Type=simple
User=root
ExecStart=%s
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
`, sm.execPath)

	servicePath := fmt.Sprintf("/etc/systemd/system/%s.service", sm.serviceName)
	err := os.WriteFile(servicePath, []byte(serviceContent), 0644)
	if err != nil {
		return fmt.Errorf("failed to create service file: %v", err)
	}

	// Reload systemd
	reloadCmd := exec.Command("systemctl", "daemon-reload")
	if err := reloadCmd.Run(); err != nil {
		return fmt.Errorf("failed to reload systemd: %v", err)
	}

	// Enable service
	enableCmd := exec.Command("systemctl", "enable", sm.serviceName)
	if err := enableCmd.Run(); err != nil {
		return fmt.Errorf("failed to enable service: %v", err)
	}

	// Start service
	startCmd := exec.Command("systemctl", "start", sm.serviceName)
	if err := startCmd.Run(); err != nil {
		return fmt.Errorf("failed to start service: %v", err)
	}

	return nil
}

// uninstallLinux removes systemd service
func (sm *ServiceManager) uninstallLinux() error {
	// Stop service
	stopCmd := exec.Command("systemctl", "stop", sm.serviceName)
	stopCmd.Run() // Ignore error if service not running

	// Disable service
	disableCmd := exec.Command("systemctl", "disable", sm.serviceName)
	disableCmd.Run() // Ignore error if service not enabled

	// Remove service file
	servicePath := fmt.Sprintf("/etc/systemd/system/%s.service", sm.serviceName)
	os.Remove(servicePath)

	// Reload systemd
	reloadCmd := exec.Command("systemctl", "daemon-reload")
	reloadCmd.Run() // Ignore error

	return nil
}

// installDarwin installs as LaunchDaemon
func (sm *ServiceManager) installDarwin() error {
	// Check if running as root
	if os.Geteuid() != 0 {
		return fmt.Errorf("must run as root to install service")
	}

	// Create LaunchDaemon plist
	plistContent := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>%s</string>
    <key>ProgramArguments</key>
    <array>
        <string>%s</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
`, sm.serviceName, sm.execPath)

	plistPath := fmt.Sprintf("/Library/LaunchDaemons/%s.plist", sm.serviceName)
	err := os.WriteFile(plistPath, []byte(plistContent), 0644)
	if err != nil {
		return fmt.Errorf("failed to create plist file: %v", err)
	}

	// Load the daemon
	loadCmd := exec.Command("launchctl", "load", plistPath)
	if err := loadCmd.Run(); err != nil {
		return fmt.Errorf("failed to load daemon: %v", err)
	}

	return nil
}

// uninstallDarwin removes LaunchDaemon
func (sm *ServiceManager) uninstallDarwin() error {
	plistPath := fmt.Sprintf("/Library/LaunchDaemons/%s.plist", sm.serviceName)

	// Unload the daemon
	unloadCmd := exec.Command("launchctl", "unload", plistPath)
	unloadCmd.Run() // Ignore error if not loaded

	// Remove plist file
	os.Remove(plistPath)

	return nil
}

// isAdmin checks if running as administrator (Windows)
func (sm *ServiceManager) isAdmin() bool {
	if runtime.GOOS != "windows" {
		return os.Geteuid() == 0
	}

	// Windows admin check
	cmd := exec.Command("net", "session")
	err := cmd.Run()
	return err == nil
}

// GetServiceStatus returns the status of the service
func (sm *ServiceManager) GetServiceStatus() (string, error) {
	switch runtime.GOOS {
	case "windows":
		return sm.getWindowsServiceStatus()
	case "linux":
		return sm.getLinuxServiceStatus()
	case "darwin":
		return sm.getDarwinServiceStatus()
	default:
		return "unknown", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
}

// getWindowsServiceStatus gets Windows service status
func (sm *ServiceManager) getWindowsServiceStatus() (string, error) {
	cmd := exec.Command("sc", "query", sm.serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "not_found", err
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "STATE") {
			parts := strings.Split(line, ":")
			if len(parts) > 1 {
				return strings.TrimSpace(parts[1]), nil
			}
		}
	}

	return "unknown", nil
}

// getLinuxServiceStatus gets systemd service status
func (sm *ServiceManager) getLinuxServiceStatus() (string, error) {
	cmd := exec.Command("systemctl", "is-active", sm.serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "inactive", err
	}

	return strings.TrimSpace(string(output)), nil
}

// getDarwinServiceStatus gets LaunchDaemon status
func (sm *ServiceManager) getDarwinServiceStatus() (string, error) {
	cmd := exec.Command("launchctl", "list", sm.serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "not_loaded", err
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, sm.serviceName) {
			return "loaded", nil
		}
	}

	return "not_loaded", nil
}