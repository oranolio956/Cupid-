# Bug Fix Quick Reference Guide

## 🚨 STOP! Read This First

**DO NOT DEPLOY TO PRODUCTION** until critical bugs are fixed.

---

## Critical Bugs - Fix Immediately

### 1. activation-server.js - Add Database
```bash
npm install better-sqlite3
```

```javascript
const Database = require('better-sqlite3');
const db = new Database('activations.db');

// Initialize table
db.exec(`
  CREATE TABLE IF NOT EXISTS activations (
    email TEXT PRIMARY KEY,
    key TEXT NOT NULL,
    created TEXT NOT NULL,
    used INTEGER DEFAULT 0
  )
`);

// Replace Map operations with DB queries
const stmt = db.prepare('INSERT OR REPLACE INTO activations VALUES (?, ?, ?, ?)');
stmt.run(email, activationKey, timestamp, 0);
```

---

### 2. activation-server.js - Add Rate Limiting
```javascript
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = rateLimit.get(ip) || {count: 0, resetTime: now + 3600000};
  
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 3600000;
  }
  
  if (limit.count >= 5) return false;
  limit.count++;
  rateLimit.set(ip, limit);
  return true;
}

// In POST /api/activate
const clientIP = req.connection.remoteAddress;
if (!checkRateLimit(clientIP)) {
  res.writeHead(429, corsHeaders);
  res.end(JSON.stringify({error: 'Rate limit exceeded'}));
  return;
}
```

---

### 3. activation-server.js - Fix CORS
```javascript
const allowedOrigins = [
  'https://cupidbot.org',
  'https://www.cupidbot.org'
];

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// In request handler
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  corsHeaders['Access-Control-Allow-Origin'] = origin;
  corsHeaders['Access-Control-Allow-Credentials'] = 'true';
}
```

---

### 4. popup.js - Add Server Validation
```javascript
activateBtn.addEventListener('click', async () => {
  const key = input.value.trim();
  
  if (!validateKey(key)) {
    showError('Invalid trial key format.');
    return;
  }
  
  activateBtn.classList.add('loading');
  activateBtn.disabled = true;
  
  try {
    // VERIFY WITH SERVER
    const response = await fetch('https://api.cupidbot.org/api/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({key})
    });
    
    if (!response.ok) {
      throw new Error('Verification failed');
    }
    
    const result = await response.json();
    if (!result.valid) {
      showError('Invalid or expired trial key');
      activateBtn.classList.remove('loading');
      activateBtn.disabled = false;
      return;
    }
    
    // Continue with activation
    AppState.trialKey = key;
    AppState.hasEnteredKey = true;
    await saveState();
    
    showScreen('downloadScreen');
    startDependencyDownload();
    
  } catch (error) {
    console.error('Validation error:', error);
    showError('Failed to verify key. Please try again.');
    activateBtn.classList.remove('loading');
    activateBtn.disabled = false;
  }
});
```

---

### 5. main.go - Fix WebSocket Origin Validation
```go
func wsHandshake(ctx *gin.Context) {
  origin := ctx.GetHeader("Origin")
  allowedOrigins := []string{
    "https://cupid-otys.vercel.app",
    "https://spark-backend-fixed-v2.onrender.com",
  }
  
  // Add localhost only in development
  if config.Config.Environment == "development" {
    allowedOrigins = append(allowedOrigins, "http://localhost:3000")
  }
  
  validOrigin := false
  for _, allowed := range allowedOrigins {
    if origin == allowed {
      validOrigin = true
      break
    }
  }
  
  // Reject empty origins in production
  if origin == "" && config.Config.Environment == "production" {
    ctx.AbortWithStatus(http.StatusForbidden)
    return
  }
  
  if !validOrigin {
    ctx.AbortWithStatus(http.StatusForbidden)
    return
  }
  
  // ... rest of code
}
```

---

### 6. main.go - Fix Buffer Overflow
```go
func wsOnMessageBinary(session *melody.Session, data []byte) {
  var pack modules.Packet

  dataLen := len(data)
  if dataLen > 24 {
    if service, op, isBinary := utils.CheckBinaryPack(data); isBinary {
      switch service {
      case 20:
        switch op {
        case 00, 01, 02, 03:
          // Safe bounds checking
          if dataLen < 22 {
            return
          }
          event := hex.EncodeToString(data[6:22])
          
          // Safe payload extraction
          var payload []byte
          if dataLen > 22 {
            payloadLen := dataLen - 22
            payload = make([]byte, payloadLen)
            copy(payload, data[22:dataLen])
          }
          
          common.CallEvent(modules.Packet{
            Act:   `RAW_DATA_ARRIVE`,
            Event: event,
            Data: gin.H{
              `data`: payload,
            },
          }, session)
        }
      // ... rest of cases
      }
      return
    }
  }
  // ... rest of code
}
```

---

### 7. event.go - Fix Race Condition
```go
func CallEvent(pack modules.Packet, session *melody.Session) {
  if len(pack.Event) == 0 {
    return
  }
  ev, ok := events.Get(pack.Event)
  if !ok {
    return
  }
  if session != nil && session.UUID != ev.connection {
    return
  }
  
  ev.callback(pack, session)
  
  // Safe channel send
  if ev.finish != nil {
    select {
    case ev.finish <- true:
    default:
      // Channel closed or full, ignore
    }
  }
}
```

---

### 8. event.go - Fix Goroutine Leak
```go
func AddEventOnce(fn EventCallback, connUUID, trigger string, timeout time.Duration) bool {
  ev := &event{
    connection: connUUID,
    callback:   fn,
    finish:     make(chan bool, 1),  // BUFFERED
    remove:     make(chan bool, 1),  // BUFFERED
  }
  events.Set(trigger, ev)
  
  timer := time.NewTimer(timeout)
  defer timer.Stop()
  defer close(ev.remove)
  defer close(ev.finish)
  
  select {
  case ok := <-ev.finish:
    events.Remove(trigger)
    return ok
  case ok := <-ev.remove:
    events.Remove(trigger)
    return ok
  case <-timer.C:
    events.Remove(trigger)
    return false
  }
}
```

---

### 9. rate_limiting.go - Fix Cleanup
```go
type limiterEntry struct {
  limiter    *rate.Limiter
  lastAccess time.Time
}

type AdvancedRateLimiter struct {
  limiters map[string]*limiterEntry  // Changed type
  // ... other fields
}

func (arl *AdvancedRateLimiter) getOrCreateLimiter(key string, rps, burst int) *rate.Limiter {
  entry, exists := arl.limiters[key]
  if !exists {
    entry = &limiterEntry{
      limiter:    rate.NewLimiter(rate.Limit(rps), burst),
      lastAccess: time.Now(),
    }
    arl.limiters[key] = entry
    arl.stats.ActiveLimiters = len(arl.limiters)
  }
  entry.lastAccess = time.Now()
  return entry.limiter
}

func (arl *AdvancedRateLimiter) cleanup() {
  ticker := time.NewTicker(arl.cleanupInterval)
  defer ticker.Stop()
  
  for range ticker.C {
    arl.mutex.Lock()
    
    now := time.Now()
    cutoff := now.Add(-arl.config.MaxIdleTime)
    
    // Remove old limiters
    for key, entry := range arl.limiters {
      if entry.lastAccess.Before(cutoff) {
        delete(arl.limiters, key)
      }
    }
    
    arl.stats.ActiveLimiters = len(arl.limiters)
    arl.stats.LastCleanup = now
    arl.lastCleanup = now
    
    arl.mutex.Unlock()
  }
}
```

---

### 10. ddos_protection.go - Fix Request Rate Check
```go
type ConnectionInfo struct {
  IP                 string
  LastSeen           time.Time
  FirstSeen          time.Time
  RequestCount       int
  WindowStart        time.Time  // ADD THIS
  WindowRequestCount int        // ADD THIS
  IsBlocked          bool
  BlockReason        string
  BlockUntil         time.Time
}

func (ddp *DDoSProtector) isRequestRateExceeded(connInfo *ConnectionInfo) bool {
  now := time.Now()
  
  // Reset window if expired
  if now.Sub(connInfo.WindowStart) > time.Minute {
    connInfo.WindowStart = now
    connInfo.WindowRequestCount = 0
  }
  
  connInfo.WindowRequestCount++
  
  // Check requests per minute
  if connInfo.WindowRequestCount > ddp.config.MaxRequestsPerMinute {
    return true
  }
  
  return false
}
```

---

### 11. cors.go - Fix MaxAge Header
```go
import "strconv"

func handlePreflightRequest(c *gin.Context, config *CORSConfig, origin string) {
  // ... existing code ...
  
  // FIX THIS LINE
  c.Header("Access-Control-Max-Age", strconv.Itoa(config.MaxAge))
  
  // ... rest of code
}
```

---

## Testing Commands

### Test activation-server.js
```bash
# Start server
node activation-server.js

# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/activate \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done

# Should see 429 after 5 requests
```

### Test Go backend
```bash
cd spark-setup/spark-backend

# Run tests
go test ./...

# Run with race detector
go test -race ./...

# Build
go build -o spark-backend

# Run
./spark-backend
```

### Test Chrome extension
```bash
cd cupidbot-extension

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select cupidbot-extension folder

# Test with invalid key
# Should show error from server
```

---

## Deployment Checklist

- [ ] Database persistence added to activation-server
- [ ] Rate limiting implemented
- [ ] CORS properly restricted
- [ ] Server-side key validation working
- [ ] WebSocket origin validation fixed
- [ ] Buffer overflow fixed
- [ ] Race conditions resolved
- [ ] Goroutine leaks fixed
- [ ] Memory leaks fixed
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation updated

---

## Monitoring Setup

### Add to activation-server.js
```javascript
// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    activations: activations.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    rateLimitSize: rateLimit.size
  });
});
```

### Add to main.go
```go
// Metrics endpoint
app.GET("/metrics", func(ctx *gin.Context) {
  ctx.JSON(http.StatusOK, gin.H{
    "devices": common.Devices.Len(),
    "goroutines": runtime.NumGoroutine(),
    "memory": getMemStats(),
  })
})
```

---

## Emergency Rollback Plan

If issues occur after deployment:

1. **Immediate**: Revert to previous version
2. **Check logs**: Look for errors
3. **Monitor metrics**: Check for anomalies
4. **Test in staging**: Reproduce issue
5. **Fix and redeploy**: With proper testing

---

## Support Contacts

- **Security Issues**: security@cupidbot.org
- **Bug Reports**: bugs@cupidbot.org
- **Emergency**: emergency@cupidbot.org

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: 🔴 CRITICAL FIXES REQUIRED
