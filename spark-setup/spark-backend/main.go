package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"
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
	mutex      sync.RWMutex
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

var devicesMutex sync.RWMutex

// CORS middleware
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next(w, r)
	}
}

func main() {
	// Load configuration
	_, err := loadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Start WebSocket hub
	go hub.run()

	// Setup routes with CORS middleware
	http.HandleFunc("/api/device/list", corsMiddleware(deviceListHandler))
	http.HandleFunc("/api/device/", corsMiddleware(deviceHandler))
	http.HandleFunc("/api/health", corsMiddleware(healthHandler))
	http.HandleFunc("/ws", websocketHandler)
	
	// Serve static files (embedded frontend)
	http.Handle("/", http.FileServer(http.FS(GetEmbedFS())))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🚀 Starting Spark server on port %s", port)
	log.Printf("📡 WebSocket endpoint: /ws")
	log.Printf("🔌 API endpoint: /api/device/list")
	log.Printf("🌐 Frontend served at: /")

	// Create server with timeouts
	server := &http.Server{
		Addr:         ":" + port,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		
		log.Println("🛑 Shutting down server...")
		
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}
	
	log.Println("✅ Server shutdown complete")
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

	// Update device statuses (simulate real-time updates)
	devicesMutex.Lock()
	for i := range devices {
		if devices[i].Status == "online" {
			devices[i].LastSeen = time.Now()
		}
	}
	devicesCopy := make([]Device, len(devices))
	copy(devicesCopy, devices)
	devicesMutex.Unlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"devices": devicesCopy,
		"count":   len(devicesCopy),
	})
}

func deviceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	deviceID := filepath.Base(r.URL.Path)
	
	devicesMutex.RLock()
	for _, device := range devices {
		if device.ID == deviceID {
			devicesMutex.RUnlock()
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"device":  device,
			})
			return
		}
	}
	devicesMutex.RUnlock()

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   "Device not found",
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	hub.register <- conn

	// Send initial device list
	devicesMutex.RLock()
	devicesJSON, _ := json.Marshal(map[string]interface{}{
		"type":    "devices",
		"devices": devices,
	})
	devicesMutex.RUnlock()
	
	if err := conn.WriteMessage(websocket.TextMessage, devicesJSON); err != nil {
		log.Printf("Error sending initial device list: %v", err)
		hub.unregister <- conn
		return
	}

	// Handle WebSocket connection in a goroutine
	go handleWebSocketConnection(conn)
}

func handleWebSocketConnection(conn *websocket.Conn) {
	defer func() {
		hub.unregister <- conn
		conn.Close()
	}()

	// Set read deadline to detect dead connections
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Start ping ticker
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	go func() {
		for {
			select {
			case <-ticker.C:
				if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()

	// Read messages from client
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mutex.Lock()
			h.clients[conn] = true
			clientCount := len(h.clients)
			h.mutex.Unlock()
			log.Printf("WebSocket client connected. Total clients: %d", clientCount)

		case conn := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				clientCount := len(h.clients)
				h.mutex.Unlock()
				conn.Close()
				log.Printf("WebSocket client disconnected. Total clients: %d", clientCount)
			} else {
				h.mutex.Unlock()
			}

		case message := <-h.broadcast:
			h.mutex.RLock()
			clients := make([]*websocket.Conn, 0, len(h.clients))
			for conn := range h.clients {
				clients = append(clients, conn)
			}
			h.mutex.RUnlock()
			
			for _, conn := range clients {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					h.mutex.Lock()
					delete(h.clients, conn)
					h.mutex.Unlock()
					conn.Close()
				}
			}
		}
	}
}