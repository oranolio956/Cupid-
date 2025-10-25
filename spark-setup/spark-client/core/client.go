package core

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"

	"../config"
	"../common"
)

// Message types
const (
	MsgTypeAuth     = "auth"
	MsgTypePing     = "ping"
	MsgTypePong     = "pong"
	MsgTypeTerminal = "terminal"
	MsgTypeDesktop  = "desktop"
	MsgTypeFile     = "file"
	MsgTypeProcess  = "process"
	MsgTypeScreenshot = "screenshot"
	MsgTypeSystem   = "system"
	MsgTypeMetrics  = "metrics"
)

// Message represents a WebSocket message
type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	RequestID string      `json:"request_id,omitempty"`
}

// Client represents the Spark client
type Client struct {
	config     *config.Config
	conn       *websocket.Conn
	connected  bool
	mu         sync.RWMutex
	ctx        context.Context
	cancel     context.CancelFunc
	deviceID   string
}

// NewClient creates a new Spark client
func NewClient(cfg *config.Config) *Client {
	ctx, cancel := context.WithCancel(context.Background())
	return &Client{
		config: cfg,
		ctx:    ctx,
		cancel: cancel,
	}
}

// Connect establishes connection to the server
func (c *Client) Connect() error {
	// Generate device ID
	c.deviceID = c.config.GenerateDeviceID()
	
	// Register device first
	if err := c.registerDevice(); err != nil {
		return fmt.Errorf("failed to register device: %v", err)
	}

	// Connect via WebSocket
	url := c.config.GetServerURL()
	log.Printf("Connecting to %s", url)

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return fmt.Errorf("failed to connect: %v", err)
	}

	c.conn = conn
	c.connected = true

	// Send authentication
	authMsg := Message{
		Type: MsgTypeAuth,
		Data: map[string]string{
			"device_id": c.deviceID,
			"hostname":  c.config.Hostname,
			"username":  c.config.Username,
			"os":        c.config.OS,
			"arch":      c.config.Arch,
		},
	}

	if err := c.sendMessage(authMsg); err != nil {
		return fmt.Errorf("failed to authenticate: %v", err)
	}

	// Start message handler
	go c.handleMessages()

	// Start metrics sender
	go c.sendMetrics()

	// Start ping handler
	go c.pingHandler()

	log.Printf("Connected successfully as device: %s", c.deviceID)
	return nil
}

// Disconnect closes the connection
func (c *Client) Disconnect() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.connected {
		c.connected = false
		c.cancel()
		if c.conn != nil {
			return c.conn.Close()
		}
	}
	return nil
}

// IsConnected returns connection status
func (c *Client) IsConnected() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.connected
}

// sendMessage sends a message to the server
func (c *Client) sendMessage(msg Message) error {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if !c.connected || c.conn == nil {
		return fmt.Errorf("not connected")
	}

	// Serialize message
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	// Encrypt data
	encrypted, err := common.EncryptData(data, c.config.Salt)
	if err != nil {
		return err
	}

	return c.conn.WriteMessage(websocket.BinaryMessage, encrypted)
}

// handleMessages handles incoming messages from server
func (c *Client) handleMessages() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Message handler panic: %v", r)
		}
	}()

	for {
		select {
		case <-c.ctx.Done():
			return
		default:
			_, data, err := c.conn.ReadMessage()
			if err != nil {
				log.Printf("Failed to read message: %v", err)
				c.reconnect()
				return
			}

			// Decrypt data
			decrypted, err := common.DecryptData(data, c.config.Salt)
			if err != nil {
				log.Printf("Failed to decrypt message: %v", err)
				continue
			}

			// Parse message
			var msg Message
			if err := json.Unmarshal(decrypted, &msg); err != nil {
				log.Printf("Failed to parse message: %v", err)
				continue
			}

			// Handle message
			c.handleMessage(msg)
		}
	}
}

// handleMessage processes a specific message
func (c *Client) handleMessage(msg Message) {
	switch msg.Type {
	case MsgTypePing:
		c.handlePing(msg)
	case MsgTypeTerminal:
		c.handleTerminal(msg)
	case MsgTypeDesktop:
		c.handleDesktop(msg)
	case MsgTypeFile:
		c.handleFile(msg)
	case MsgTypeProcess:
		c.handleProcess(msg)
	case MsgTypeScreenshot:
		c.handleScreenshot(msg)
	case MsgTypeSystem:
		c.handleSystem(msg)
	default:
		log.Printf("Unknown message type: %s", msg.Type)
	}
}

// handlePing responds to ping messages
func (c *Client) handlePing(msg Message) {
	response := Message{
		Type:      MsgTypePong,
		Data:      map[string]interface{}{"timestamp": time.Now().Unix()},
		RequestID: msg.RequestID,
	}
	c.sendMessage(response)
}

// handleTerminal handles terminal commands
func (c *Client) handleTerminal(msg Message) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	command, ok := data["command"].(string)
	if !ok {
		return
	}

	// Execute command
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/c", command)
	} else {
		cmd = exec.Command("sh", "-c", command)
	}

	output, err := cmd.CombinedOutput()
	
	response := Message{
		Type: MsgTypeTerminal,
		Data: map[string]interface{}{
			"output": string(output),
			"error":  err != nil,
		},
		RequestID: msg.RequestID,
	}

	c.sendMessage(response)
}

// handleDesktop handles desktop streaming requests
func (c *Client) handleDesktop(msg Message) {
	// Desktop streaming implementation would go here
	// This is a placeholder for the actual desktop capture functionality
	response := Message{
		Type: MsgTypeDesktop,
		Data: map[string]interface{}{
			"status": "not_implemented",
		},
		RequestID: msg.RequestID,
	}
	c.sendMessage(response)
}

// handleFile handles file operations
func (c *Client) handleFile(msg Message) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	action, ok := data["action"].(string)
	if !ok {
		return
	}

	var response Message
	response.Type = MsgTypeFile
	response.RequestID = msg.RequestID

	switch action {
	case "list":
		path, _ := data["path"].(string)
		if path == "" {
			path = "."
		}
		entries, err := os.ReadDir(path)
		if err != nil {
			response.Data = map[string]interface{}{
				"error": err.Error(),
			}
		} else {
			files := make([]map[string]interface{}, 0)
			for _, entry := range entries {
				info, _ := entry.Info()
				files = append(files, map[string]interface{}{
					"name":    entry.Name(),
					"is_dir":  entry.IsDir(),
					"size":    info.Size(),
					"mod_time": info.ModTime().Unix(),
				})
			}
			response.Data = map[string]interface{}{
				"files": files,
				"path":  path,
			}
		}
	case "download":
		// File download implementation
		response.Data = map[string]interface{}{
			"status": "not_implemented",
		}
	case "upload":
		// File upload implementation
		response.Data = map[string]interface{}{
			"status": "not_implemented",
		}
	}

	c.sendMessage(response)
}

// handleProcess handles process management
func (c *Client) handleProcess(msg Message) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	action, ok := data["action"].(string)
	if !ok {
		return
	}

	var response Message
	response.Type = MsgTypeProcess
	response.RequestID = msg.RequestID

	switch action {
	case "list":
		processes, err := process.Processes()
		if err != nil {
			response.Data = map[string]interface{}{
				"error": err.Error(),
			}
		} else {
			procList := make([]map[string]interface{}, 0)
			for _, p := range processes {
				name, _ := p.Name()
				pid := p.Pid
				status, _ := p.Status()
				memInfo, _ := p.MemoryInfo()
				cpuPercent, _ := p.CPUPercent()

				procList = append(procList, map[string]interface{}{
					"pid":     pid,
					"name":    name,
					"status":  status,
					"memory":  memInfo.RSS,
					"cpu":     cpuPercent,
				})
			}
			response.Data = map[string]interface{}{
				"processes": procList,
			}
		}
	case "kill":
		pidStr, ok := data["pid"].(string)
		if !ok {
			response.Data = map[string]interface{}{
				"error": "invalid pid",
			}
		} else {
			pid, err := strconv.Atoi(pidStr)
			if err != nil {
				response.Data = map[string]interface{}{
					"error": "invalid pid format",
				}
			} else {
				proc, err := os.FindProcess(pid)
				if err != nil {
					response.Data = map[string]interface{}{
						"error": err.Error(),
					}
				} else {
					err = proc.Kill()
					response.Data = map[string]interface{}{
						"success": err == nil,
						"error":   err,
					}
				}
			}
		}
	}

	c.sendMessage(response)
}

// handleScreenshot handles screenshot requests
func (c *Client) handleScreenshot(msg Message) {
	// Screenshot implementation would go here
	response := Message{
		Type: MsgTypeScreenshot,
		Data: map[string]interface{}{
			"status": "not_implemented",
		},
		RequestID: msg.RequestID,
	}
	c.sendMessage(response)
}

// handleSystem handles system control commands
func (c *Client) handleSystem(msg Message) {
	data, ok := msg.Data.(map[string]interface{})
	if !ok {
		return
	}

	action, ok := data["action"].(string)
	if !ok {
		return
	}

	var response Message
	response.Type = MsgTypeSystem
	response.RequestID = msg.RequestID

	switch action {
	case "shutdown":
		var cmd *exec.Cmd
		if runtime.GOOS == "windows" {
			cmd = exec.Command("shutdown", "/s", "/t", "0")
		} else {
			cmd = exec.Command("shutdown", "-h", "now")
		}
		err := cmd.Run()
		response.Data = map[string]interface{}{
			"success": err == nil,
			"error":   err,
		}
	case "restart":
		var cmd *exec.Cmd
		if runtime.GOOS == "windows" {
			cmd = exec.Command("shutdown", "/r", "/t", "0")
		} else {
			cmd = exec.Command("shutdown", "-r", "now")
		}
		err := cmd.Run()
		response.Data = map[string]interface{}{
			"success": err == nil,
			"error":   err,
		}
	case "lock":
		var cmd *exec.Cmd
		if runtime.GOOS == "windows" {
			cmd = exec.Command("rundll32", "user32.dll,LockWorkStation")
		} else {
			cmd = exec.Command("gnome-screensaver-command", "-l")
		}
		err := cmd.Run()
		response.Data = map[string]interface{}{
			"success": err == nil,
			"error":   err,
		}
	}

	c.sendMessage(response)
}

// sendMetrics sends system metrics to server
func (c *Client) sendMetrics() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			if !c.IsConnected() {
				continue
			}

			metrics, err := c.getSystemMetrics()
			if err != nil {
				log.Printf("Failed to get metrics: %v", err)
				continue
			}

			msg := Message{
				Type: MsgTypeMetrics,
				Data: metrics,
			}

			if err := c.sendMessage(msg); err != nil {
				log.Printf("Failed to send metrics: %v", err)
			}
		}
	}
}

// getSystemMetrics collects system metrics
func (c *Client) getSystemMetrics() (map[string]interface{}, error) {
	metrics := make(map[string]interface{})

	// CPU info
	cpuInfo, err := cpu.Info()
	if err == nil && len(cpuInfo) > 0 {
		metrics["cpu_model"] = cpuInfo[0].ModelName
		metrics["cpu_cores"] = cpuInfo[0].Cores
	}

	cpuUsage, err := cpu.Percent(time.Second, false)
	if err == nil && len(cpuUsage) > 0 {
		metrics["cpu_usage"] = cpuUsage[0]
	}

	// Memory info
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		metrics["memory_total"] = memInfo.Total
		metrics["memory_used"] = memInfo.Used
		metrics["memory_percent"] = memInfo.UsedPercent
	}

	// Disk info
	diskInfo, err := disk.Usage("/")
	if err == nil {
		metrics["disk_total"] = diskInfo.Total
		metrics["disk_used"] = diskInfo.Used
		metrics["disk_percent"] = diskInfo.UsedPercent
	}

	// Network info
	netStats, err := net.IOCounters(false)
	if err == nil && len(netStats) > 0 {
		metrics["net_sent"] = netStats[0].BytesSent
		metrics["net_recv"] = netStats[0].BytesRecv
	}

	// Host info
	hostInfo, err := host.Info()
	if err == nil {
		metrics["hostname"] = hostInfo.Hostname
		metrics["os"] = hostInfo.Platform
		metrics["arch"] = hostInfo.KernelArch
		metrics["uptime"] = hostInfo.Uptime
	}

	metrics["timestamp"] = time.Now().Unix()
	metrics["device_id"] = c.deviceID

	return metrics, nil
}

// pingHandler sends periodic ping messages
func (c *Client) pingHandler() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.ctx.Done():
			return
		case <-ticker.C:
			if !c.IsConnected() {
				continue
			}

			msg := Message{
				Type: MsgTypePing,
				Data: map[string]interface{}{
					"timestamp": time.Now().Unix(),
				},
			}

			if err := c.sendMessage(msg); err != nil {
				log.Printf("Failed to send ping: %v", err)
			}
		}
	}
}

// reconnect attempts to reconnect to the server
func (c *Client) reconnect() {
	log.Printf("Attempting to reconnect...")
	
	for {
		select {
		case <-c.ctx.Done():
			return
		default:
			time.Sleep(5 * time.Second)
			
			if err := c.Connect(); err != nil {
				log.Printf("Reconnection failed: %v", err)
				continue
			}
			
			log.Printf("Reconnected successfully")
			return
		}
	}
}

// registerDevice registers the device with the server
func (c *Client) registerDevice() error {
	deviceData := map[string]interface{}{
		"device_id": c.deviceID,
		"hostname":  c.config.Hostname,
		"username":  c.config.Username,
		"os":        c.config.OS,
		"arch":      c.config.Arch,
		"timestamp": time.Now().Unix(),
	}

	jsonData, err := json.Marshal(deviceData)
	if err != nil {
		return err
	}

	url := c.config.GetHTTPURL() + "/api/device/register"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", "default-insecure-key-CHANGE-ME")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("registration failed with status: %d", resp.StatusCode)
	}

	log.Printf("Device registered successfully: %s", c.config.Hostname)
	return nil
}