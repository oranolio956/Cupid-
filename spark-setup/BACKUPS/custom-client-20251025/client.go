package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

// Device represents the device information sent to server
type Device struct {
	ID       string    `json:"id"`
	Hostname string    `json:"hostname"`
	Username string    `json:"username"`
	OS       string    `json:"os"`
	Arch     string    `json:"arch"`
	MAC      string    `json:"mac"`
	LAN      string    `json:"lan"`
	WAN      string    `json:"wan"`
	Latency  int       `json:"latency"` // milliseconds
	Uptime   int64     `json:"uptime"`  // seconds

	// System resources
	CPU struct {
		Model string  `json:"model"`
		Usage float64 `json:"usage"`
		Cores struct {
			Physical int `json:"physical"`
			Logical  int `json:"logical"`
		} `json:"cores"`
	} `json:"cpu"`

	RAM struct {
		Usage float64 `json:"usage"` // percentage
		Total int64   `json:"total"` // bytes
		Used  int64   `json:"used"`  // bytes
	} `json:"ram"`

	Disk struct {
		Usage float64 `json:"usage"` // percentage
		Total int64   `json:"total"` // bytes
		Used  int64   `json:"used"`  // bytes
	} `json:"disk"`

	// Network stats
	NetSent int64     `json:"net_sent"` // bytes per second
	NetRecv int64     `json:"net_recv"` // bytes per second

	// Connection metadata
	LastSeen    time.Time `json:"last_seen"`
	ConnectedAt time.Time `json:"connected_at"`
}

var (
	serverURL = "https://spark-backend-fixed-v2.onrender.com"
	apiKey    = "default-insecure-key-CHANGE-ME"
	deviceID  = ""
)

func main() {
	// Parse command line arguments
	if len(os.Args) > 1 {
		serverURL = os.Args[1]
	}
	if len(os.Args) > 2 {
		apiKey = os.Args[2]
	}

	log.Printf("Starting Spark client...")
	log.Printf("Server: %s", serverURL)
	log.Printf("API Key: %s", apiKey)

	// Register device first
	if err := registerDevice(); err != nil {
		log.Fatalf("Failed to register device: %v", err)
	}

	// Start update loop
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if err := updateDevice(); err != nil {
			log.Printf("Failed to update device: %v", err)
		}
	}
}

func registerDevice() error {
	device, err := getDeviceInfo()
	if err != nil {
		return err
	}

	deviceID = device.ID
	device.ConnectedAt = time.Now()
	device.LastSeen = time.Now()

	jsonData, err := json.Marshal(device)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", serverURL+"/api/device/register", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("registration failed with status: %d", resp.StatusCode)
	}

	log.Printf("Device registered successfully: %s", device.Hostname)
	return nil
}

func updateDevice() error {
	device, err := getDeviceInfo()
	if err != nil {
		return err
	}

	device.ID = deviceID
	device.LastSeen = time.Now()

	jsonData, err := json.Marshal(device)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", serverURL+"/api/device/update", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("update failed with status: %d", resp.StatusCode)
	}

	return nil
}

func getDeviceInfo() (*Device, error) {
	device := &Device{}

	// Get host info
	hostInfo, err := host.Info()
	if err != nil {
		return nil, err
	}

	device.Hostname = hostInfo.Hostname
	device.OS = hostInfo.Platform + " " + hostInfo.PlatformVersion
	device.Arch = hostInfo.KernelArch
	device.Uptime = int64(hostInfo.Uptime)

	// Get username
	device.Username = os.Getenv("USER")
	if device.Username == "" {
		device.Username = os.Getenv("USERNAME")
	}

	// Get CPU info
	cpuInfo, err := cpu.Info()
	if err == nil && len(cpuInfo) > 0 {
		device.CPU.Model = cpuInfo[0].ModelName
		device.CPU.Cores.Physical = int(cpuInfo[0].Cores)
		device.CPU.Cores.Logical = runtime.NumCPU()
	}

	// Get CPU usage
	cpuUsage, err := cpu.Percent(time.Second, false)
	if err == nil && len(cpuUsage) > 0 {
		device.CPU.Usage = cpuUsage[0]
	}

	// Get memory info
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		device.RAM.Usage = memInfo.UsedPercent
		device.RAM.Total = int64(memInfo.Total)
		device.RAM.Used = int64(memInfo.Used)
	}

	// Get disk info
	diskInfo, err := disk.Usage("/")
	if err == nil {
		device.Disk.Usage = diskInfo.UsedPercent
		device.Disk.Total = int64(diskInfo.Total)
		device.Disk.Used = int64(diskInfo.Used)
	}

	// Get network info
	netStats, err := net.IOCounters(false)
	if err == nil && len(netStats) > 0 {
		device.NetSent = int64(netStats[0].BytesSent)
		device.NetRecv = int64(netStats[0].BytesRecv)
	}

	// Get network interfaces for MAC and IP
	interfaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range interfaces {
			if len(iface.Addrs) > 0 && iface.HardwareAddr != "" {
				device.MAC = iface.HardwareAddr
				if len(iface.Addrs) > 0 {
					device.LAN = iface.Addrs[0].Addr
				}
				break
			}
		}
	}

	// Generate device ID if not set
	if deviceID == "" {
		device.ID = fmt.Sprintf("device-%d", time.Now().UnixNano())
	}

	// Simulate latency (in real implementation, ping the server)
	device.Latency = int(50 + (time.Now().UnixNano()%100))

	return device, nil
}