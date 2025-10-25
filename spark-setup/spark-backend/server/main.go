package main

import (
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gorilla/websocket"
	// Embedded frontend is in the same package
)

// Config represents the server configuration
type Config struct {
	Listen string `json:"listen"`
	Salt   string `json:"salt"`
	Auth   map[string]string `json:"auth"`
	Log    LogConfig `json:"log"`
}

type LogConfig struct {
	Level string `json:"level"`
	Path  string `json:"path"`
	Days  int    `json:"days"`
}

// Device represents a connected device
type Device struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	LastSeen    time.Time `json:"lastSeen"`
	IP          string    `json:"ip"`
	Description string    `json:"description"`
}

// WebSocket connection manager
type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
}

var hub = &Hub{
	clients:    make(map[*websocket.Conn]bool),
	broadcast:  make(chan []byte),
	register:   make(chan *websocket.Conn),
	unregister: make(chan *websocket.Conn),
}

// Sample devices for demonstration
var devices = []Device{
	{
		ID:          "device-001",
		Name:        "Spark Terminal 1",
		Type:        "terminal",
		Status:      "online",
		LastSeen:    time.Now(),
		IP:          "192.168.1.100",
		Description: "Main terminal device",
	},
	{
		ID:          "device-002",
		Name:        "Spark Terminal 2",
		Type:        "terminal",
		Status:      "offline",
		LastSeen:    time.Now().Add(-5 * time.Minute),
		IP:          "192.168.1.101",
		Description: "Secondary terminal device",
	},
	{
		ID:          "device-003",
		Name:        "Spark Monitor",
		Type:        "monitor",
		Status:      "online",
		LastSeen:    time.Now(),
		IP:          "192.168.1.102",
		Description: "System monitoring device",
	},
}

func main() {
	// Load configuration
	_, err := loadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Start WebSocket hub
	go hub.run()

	// Setup routes
	http.HandleFunc("/api/device/list", deviceListHandler)
	http.HandleFunc("/api/device/", deviceHandler)
	http.HandleFunc("/api/health", healthHandler)
	http.HandleFunc("/ws", websocketHandler)
	
	// Serve static files (embedded frontend)
	// Try to serve from dist/ first, then server/dist/ as fallback
	var distFS fs.FS
	var distErr error
	
	// Try dist/ first (when building from server directory)
	distFS, distErr = fs.Sub(GetEmbedFS(), "dist")
	if distErr != nil {
		// Try server/dist/ (when building from parent directory)
		distFS, distErr = fs.Sub(GetEmbedFS(), "server/dist")
		if distErr != nil {
			log.Fatalf("Failed to create sub filesystem: %v", distErr)
		}
	}
	http.Handle("/", http.FileServer(http.FS(distFS)))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Starting Spark server on port %s", port)
	log.Printf("📡 WebSocket endpoint: /ws")
	log.Printf("🔌 API endpoint: /api/device/list")
	log.Printf("🌐 Frontend served at: /")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func loadConfig() (*Config, error) {
	// Try to load from config.json first
	if data, err := os.ReadFile("config.json"); err == nil {
		var config Config
		if err := json.Unmarshal(data, &config); err == nil {
			return &config, nil
		}
	}

	// Fallback to environment variables
	config := &Config{
		Listen: getEnv("SPARK_LISTEN", ":8000"),
		Salt:   getEnv("SPARK_SALT", "default-salt-123456789012345678901234"),
		Auth: map[string]string{
			getEnv("SPARK_USERNAME", "admin"): getEnv("SPARK_PASSWORD", "admin123"),
		},
		Log: LogConfig{
			Level: "info",
			Path:  "./logs",
			Days:  7,
		},
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func deviceListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Update device statuses (simulate real-time updates)
	for i := range devices {
		if devices[i].Status == "online" {
			devices[i].LastSeen = time.Now()
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"devices": devices,
		"count":   len(devices),
	})
}

func deviceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	deviceID := filepath.Base(r.URL.Path)
	
	for _, device := range devices {
		if device.ID == deviceID {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"device":  device,
			})
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   "Device not found",
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"uptime":    time.Since(startTime).String(),
		"devices":   len(devices),
	})
}

var startTime = time.Now()

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for development
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	hub.register <- conn

	// Send initial device list
	devicesJSON, _ := json.Marshal(map[string]interface{}{
		"type":    "devices",
		"devices": devices,
	})
	conn.WriteMessage(websocket.TextMessage, devicesJSON)
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.clients[conn] = true
			log.Printf("WebSocket client connected. Total clients: %d", len(h.clients))

		case conn := <-h.unregister:
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
				log.Printf("WebSocket client disconnected. Total clients: %d", len(h.clients))
			}

		case message := <-h.broadcast:
			for conn := range h.clients {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(h.clients, conn)
					conn.Close()
				}
			}
		}
	}
}