package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

// Config represents the server configuration
type Config struct {
	Listen string            `json:"listen"`
	Salt   string            `json:"salt"`
	Auth   map[string]string `json:"auth"`
	Log    LogConfig         `json:"log"`
}

type LogConfig struct {
	Level string `json:"level"`
	Path  string `json:"path"`
	Days  int    `json:"days"`
}

// Device represents a connected device with full system information
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
		Model string `json:"model"`
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

// Real connected devices only - starts empty
var devices = make(map[string]*Device)
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

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	devicesMutex.RLock()
	deviceCount := len(devices)
	devicesMutex.RUnlock()

	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"uptime":    time.Since(startTime).String(),
		"devices":   deviceCount,
	}

	json.NewEncoder(w).Encode(response)
}

// Device list endpoint
func deviceListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	devicesMutex.RLock()
	defer devicesMutex.RUnlock()

	// Return in format expected by frontend
	response := map[string]interface{}{
		"code": 0,
		"msg":  "success",
		"data": devices, // Already a map[string]*Device
	}

	// If no devices connected, return empty map (not error)
	if len(devices) == 0 {
		response["data"] = make(map[string]interface{})
	}

	json.NewEncoder(w).Encode(response)
}

// Device registration endpoint for real clients to connect
func deviceRegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var device Device
	if err := json.NewDecoder(r.Body).Decode(&device); err != nil {
		http.Error(w, "Invalid device data", http.StatusBadRequest)
		return
	}

	// Generate ID if not provided
	if device.ID == "" {
		device.ID = fmt.Sprintf("device-%d", time.Now().UnixNano())
	}

	// Set connection time
	device.ConnectedAt = time.Now()
	device.LastSeen = time.Now()

	// Store device
	devicesMutex.Lock()
	devices[device.ID] = &device
	devicesMutex.Unlock()

	log.Printf("Device registered: %s (%s)", device.Hostname, device.ID)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"code": 0,
		"msg":  "Device registered successfully",
		"id":   device.ID,
	})
}

// Individual device endpoint
func deviceHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Extract device ID from URL path
	deviceID := r.URL.Path[len("/api/device/"):]
	
	devicesMutex.RLock()
	device, exists := devices[deviceID]
	devicesMutex.RUnlock()

	if !exists {
		http.Error(w, "Device not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"code": 0,
		"data": device,
	})
}

// WebSocket upgrade handler
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	hub.register <- conn

	go func() {
		defer func() {
			hub.unregister <- conn
			conn.Close()
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("WebSocket error: %v", err)
				}
				break
			}
		}
	}()
}

// Hub run loop
func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mutex.Lock()
			h.clients[conn] = true
			h.mutex.Unlock()
			log.Printf("WebSocket client connected. Total clients: %d", len(h.clients))

		case conn := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			h.mutex.Unlock()
			log.Printf("WebSocket client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mutex.RLock()
			for conn := range h.clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("WebSocket write error: %v", err)
					conn.Close()
					delete(h.clients, conn)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

var startTime = time.Now()

func main() {
	// Start WebSocket hub
	go hub.run()

	// Register API routes
	http.HandleFunc("/api/health", corsMiddleware(healthHandler))
	http.HandleFunc("/api/device/list", corsMiddleware(deviceListHandler))
	http.HandleFunc("/api/device/register", corsMiddleware(deviceRegisterHandler))
	http.HandleFunc("/api/device/", corsMiddleware(deviceHandler))
	http.HandleFunc("/ws", wsHandler)

	// Serve static files (if any)
	http.Handle("/", http.FileServer(http.Dir("./static/")))

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("Starting Spark backend server on port %s", port)
	log.Printf("Health check: http://localhost:%s/api/health", port)
	log.Printf("Device list: http://localhost:%s/api/device/list", port)
	log.Printf("WebSocket: ws://localhost:%s/ws", port)

	server := &http.Server{
		Addr:    ":" + port,
		Handler: nil,
	}

	// Graceful shutdown
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}