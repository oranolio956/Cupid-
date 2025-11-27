package optimizations

import (
	"context"
	"sync"
	"time"
)

// ConnectionPool provides connection pooling functionality
type ConnectionPool struct {
	// Pool configuration
	maxConnections int
	minConnections int
	idleTimeout    time.Duration
	maxLifetime    time.Duration
	
	// Pool storage
	connections chan *Connection
	active      map[*Connection]time.Time
	
	// Statistics
	totalConnections int64
	errors          int64
	
	// Mutex for thread safety
	mutex sync.RWMutex
	
	// Context for cancellation
	ctx    context.Context
	cancel context.CancelFunc
}

// Connection represents a pooled connection
type Connection struct {
	ID        string
	CreatedAt time.Time
	LastUsed  time.Time
	IsActive  bool
}

// NewConnectionPool creates a new connection pool
func NewConnectionPool(maxConnections, minConnections int, idleTimeout, maxLifetime time.Duration) *ConnectionPool {
	ctx, cancel := context.WithCancel(context.Background())
	
	cp := &ConnectionPool{
		maxConnections: maxConnections,
		minConnections: minConnections,
		idleTimeout:    idleTimeout,
		maxLifetime:    maxLifetime,
		connections:    make(chan *Connection, maxConnections),
		active:         make(map[*Connection]time.Time),
		ctx:            ctx,
		cancel:         cancel,
	}
	
	// Initialize minimum connections
	for i := 0; i < minConnections; i++ {
		conn := cp.createConnection()
		cp.connections <- conn
		cp.active[conn] = time.Now()
		cp.totalConnections++
	}
	
	// Start cleanup goroutine
	go cp.cleanup()
	
	return cp
}

// GetConnection gets a connection from the pool
func (cp *ConnectionPool) GetConnection() (*Connection, error) {
	select {
	case conn := <-cp.connections:
		cp.mutex.Lock()
		conn.LastUsed = time.Now()
		conn.IsActive = true
		cp.active[conn] = time.Now()
		cp.mutex.Unlock()
		return conn, nil
		
	case <-time.After(5 * time.Second):
		// Try to create a new connection if pool is empty
		cp.mutex.Lock()
		if len(cp.active) < cp.maxConnections {
			conn := cp.createConnection()
			conn.IsActive = true
			cp.active[conn] = time.Now()
			cp.totalConnections++
			cp.mutex.Unlock()
			return conn, nil
		}
		cp.mutex.Unlock()
		
		cp.errors++
		return nil, ErrPoolExhausted
		
	case <-cp.ctx.Done():
		return nil, cp.ctx.Err()
	}
}

// ReturnConnection returns a connection to the pool
func (cp *ConnectionPool) ReturnConnection(conn *Connection) {
	if conn == nil {
		return
	}
	
	cp.mutex.Lock()
	conn.IsActive = false
	conn.LastUsed = time.Now()
	delete(cp.active, conn)
	cp.mutex.Unlock()
	
	select {
	case cp.connections <- conn:
		// Connection returned to pool
	default:
		// Pool is full, discard connection
		cp.mutex.Lock()
		cp.totalConnections--
		cp.mutex.Unlock()
	}
}

// CloseConnection closes a connection
func (cp *ConnectionPool) CloseConnection(conn *Connection) {
	if conn == nil {
		return
	}
	
	cp.mutex.Lock()
	conn.IsActive = false
	delete(cp.active, conn)
	cp.totalConnections--
	cp.mutex.Unlock()
}

// createConnection creates a new connection
func (cp *ConnectionPool) createConnection() *Connection {
	return &Connection{
		ID:        generateConnectionID(),
		CreatedAt: time.Now(),
		LastUsed:  time.Now(),
		IsActive:  false,
	}
}

// cleanup removes idle and expired connections
func (cp *ConnectionPool) cleanup() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			cp.mutex.Lock()
			
			now := time.Now()
			var toRemove []*Connection
			
			// Check idle connections
			for conn, lastUsed := range cp.active {
				if now.Sub(lastUsed) > cp.idleTimeout {
					toRemove = append(toRemove, conn)
				}
			}
			
			// Check expired connections
			for conn := range cp.active {
				if now.Sub(conn.CreatedAt) > cp.maxLifetime {
					toRemove = append(toRemove, conn)
				}
			}
			
			// Remove connections
			for _, conn := range toRemove {
				conn.IsActive = false
				delete(cp.active, conn)
				cp.totalConnections--
			}
			
			cp.mutex.Unlock()
			
		case <-cp.ctx.Done():
			return
		}
	}
}

// GetActiveConnections returns the number of active connections
func (cp *ConnectionPool) GetActiveConnections() int {
	cp.mutex.RLock()
	defer cp.mutex.RUnlock()
	
	return len(cp.active)
}

// GetTotalConnections returns the total number of connections created
func (cp *ConnectionPool) GetTotalConnections() int64 {
	cp.mutex.RLock()
	defer cp.mutex.RUnlock()
	
	return cp.totalConnections
}

// GetErrors returns the number of connection errors
func (cp *ConnectionPool) GetErrors() int64 {
	cp.mutex.RLock()
	defer cp.mutex.RUnlock()
	
	return cp.errors
}

// GetStats returns connection pool statistics
func (cp *ConnectionPool) GetStats() map[string]interface{} {
	cp.mutex.RLock()
	defer cp.mutex.RUnlock()
	
	return map[string]interface{}{
		"active_connections": len(cp.active),
		"total_connections":  cp.totalConnections,
		"errors":            cp.errors,
		"max_connections":   cp.maxConnections,
		"min_connections":   cp.minConnections,
		"idle_timeout":      cp.idleTimeout.String(),
		"max_lifetime":      cp.maxLifetime.String(),
	}
}

// Close closes the connection pool
func (cp *ConnectionPool) Close() {
	cp.cancel()
	
	// Close all connections
	cp.mutex.Lock()
	for conn := range cp.active {
		conn.IsActive = false
	}
	cp.active = make(map[*Connection]time.Time)
	cp.mutex.Unlock()
}

// generateConnectionID generates a unique connection ID
func generateConnectionID() string {
	return fmt.Sprintf("conn_%d", time.Now().UnixNano())
}

// ErrPoolExhausted is returned when the connection pool is exhausted
var ErrPoolExhausted = fmt.Errorf("connection pool exhausted")