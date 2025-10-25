package health

import (
	"Spark/utils"
	"Spark/utils/melody"
	"Spark/modules"
	"Spark/common"
	"log"
	"time"
)

// Checker manages health checks with a worker pool to prevent goroutine explosion
type Checker struct {
	workers   int
	jobs      chan *melody.Session
	container *melody.Melody
	quit      chan struct{}
}

const (
	MaxIdleSeconds = 150
	MaxPingInterval = 60
)

// NewChecker creates a new health checker with a worker pool
func NewChecker(container *melody.Melody, workers int) *Checker {
	c := &Checker{
		workers:   workers,
		jobs:      make(chan *melody.Session, workers*2),
		container: container,
		quit:      make(chan struct{}),
	}
	
	// Start worker pool
	for i := 0; i < workers; i++ {
		go c.worker()
	}
	
	return c
}

// worker processes ping jobs from the queue
func (c *Checker) worker() {
	for {
		select {
		case session := <-c.jobs:
			pingDevice(session)
		case <-c.quit:
			return
		}
	}
}

// Start begins the health check routines
func (c *Checker) Start() {
	// Start ping routine
	go c.pingRoutine()
	
	// Start cleanup routine
	go c.cleanupRoutine()
}

// pingRoutine handles periodic pings with dynamic intervals
func (c *Checker) pingRoutine() {
	var tick int64 = 0
	var pingInterval int64 = 3
	
	for {
		select {
		case <-time.After(3 * time.Second):
			tick += 3
			if tick >= 3 && (tick >= pingInterval || tick >= MaxPingInterval) {
				pingInterval += 3
				if pingInterval > MaxPingInterval {
					pingInterval = MaxPingInterval
				}
				tick = 0
				c.checkAll()
			}
		case <-c.quit:
			return
		}
	}
}

// cleanupRoutine handles session cleanup every 60 seconds
func (c *Checker) cleanupRoutine() {
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case now := <-ticker.C:
			c.cleanupSessions(now)
		case <-c.quit:
			return
		}
	}
}

// checkAll queues all sessions for health check
func (c *Checker) checkAll() {
	c.container.IterSessions(func(uuid string, s *melody.Session) bool {
		select {
		case c.jobs <- s: // Queue for worker pool
		default:
			// Queue full, skip this check
			log.Printf("Health check queue full, skipping device %s", uuid)
		}
		return true
	})
}

// cleanupSessions removes expired sessions
func (c *Checker) cleanupSessions(now time.Time) {
	timestamp := now.Unix()
	queue := make([]*melody.Session, 0)
	
	c.container.IterSessions(func(uuid string, s *melody.Session) bool {
		val, ok := s.Get(`LastPack`)
		if !ok {
			queue = append(queue, s)
			return true
		}
		lastPack, ok := val.(int64)
		if !ok {
			queue = append(queue, s)
			return true
		}
		if timestamp-lastPack > MaxIdleSeconds {
			queue = append(queue, s)
		}
		return true
	})
	
	// Close expired sessions
	for i := 0; i < len(queue); i++ {
		queue[i].Close()
	}
}

// Stop stops the health checker
func (c *Checker) Stop() {
	close(c.quit)
}

// pingDevice sends a ping to a device and handles the response
func pingDevice(s *melody.Session) {
	t := time.Now().UnixMilli()
	trigger := utils.GetStrUUID()
	common.SendPack(modules.Packet{Act: `PING`, Event: trigger}, s)
	common.AddEventOnce(func(packet modules.Packet, session *melody.Session) {
		device, ok := common.Devices.Get(s.UUID)
		if ok {
			device.Latency = uint(time.Now().UnixMilli()-t) / 2
		}
	}, s.UUID, trigger, 3*time.Second)
}