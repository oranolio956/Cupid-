# Spark RAT Operations Runbook

## Table of Contents
1. [System Overview](#system-overview)
2. [Deployment](#deployment)
3. [Monitoring](#monitoring)
4. [Troubleshooting](#troubleshooting)
5. [Maintenance](#maintenance)
6. [Emergency Procedures](#emergency-procedures)

---

## System Overview

### Architecture
```
┌─────────────────┐
│  Chrome         │
│  Extension      │◄────┐
└────────┬────────┘     │
         │              │
         │ HTTPS        │ WebSocket
         ▼              │
┌─────────────────┐     │
│  Activation     │     │
│  Server         │     │
│  (Node.js)      │     │
└─────────────────┘     │
                        │
┌─────────────────┐     │
│  Frontend       │     │
│  Dashboard      │◄────┤
│  (React/Vercel) │     │
└────────┬────────┘     │
         │              │
         │ HTTPS        │
         ▼              │
┌─────────────────┐     │
│  Backend        │     │
│  Server         │─────┘
│  (Go/Render)    │
└─────────────────┘
```

### Components

1. **Backend Server** (Go)
   - URL: https://spark-backend-wj4e.onrender.com
   - Platform: Render
   - Purpose: Main API and WebSocket server
   - Auth: HTTP Basic Auth with bcrypt

2. **Frontend Dashboard** (React)
   - URL: https://spark-rat-dashboard.vercel.app
   - Platform: Vercel
   - Purpose: Web UI for managing RAT clients
   - Auth: Credentials passed to backend

3. **Activation Server** (Node.js)
   - URL: TBD (not yet deployed)
   - Platform: Render (planned)
   - Purpose: License key management
   - Database: SQLite with persistent disk

4. **Chrome Extension**
   - Platform: Chrome Web Store (unpacked for dev)
   - Purpose: OnlyFans automation
   - Activation: Requires valid license key

---

## Deployment

### Backend Deployment (Render)

**Prerequisites:**
- GitHub repository with latest code
- Render account connected to GitHub

**Steps:**
1. Push code to GitHub:
   ```bash
   cd /workspaces/Cupid-/spark-setup/spark-backend
   git add -A
   git commit -m "Update backend"
   git push origin main
   ```

2. Render auto-deploys on push to main branch

3. Verify deployment:
   ```bash
   curl https://spark-backend-wj4e.onrender.com/health
   ```

**Configuration:**
- Build Command: `go build -o main .`
- Start Command: `./main`
- Environment Variables:
  - `PORT`: 8080 (auto-set by Render)
  - `ADMIN_PASSWORD_HASH`: bcrypt hash of password

**Troubleshooting Deployment:**
- Check Render logs for build errors
- Verify Go version compatibility
- Ensure all dependencies in go.mod
- Check for port binding issues

### Frontend Deployment (Vercel)

**Prerequisites:**
- Vercel account connected to GitHub
- Environment variables configured

**Steps:**
1. Push code to GitHub:
   ```bash
   cd /workspaces/Cupid-/spark-setup/spark-frontend
   git add -A
   git commit -m "Update frontend"
   git push origin main
   ```

2. Vercel auto-deploys on push

3. Verify deployment:
   ```bash
   curl https://spark-rat-dashboard.vercel.app
   ```

**Configuration:**
- Framework: React
- Build Command: `npm run build`
- Output Directory: `build`
- Environment Variables:
  - `REACT_APP_API_URL`: Backend URL

**Troubleshooting Deployment:**
- Check Vercel build logs
- Verify Node.js version
- Check for missing dependencies
- Verify environment variables

### Activation Server Deployment (Render)

**Prerequisites:**
- Render account
- Persistent disk configured

**Steps:**
1. Create new Web Service on Render
2. Connect to GitHub repository
3. Configure:
   - Build Command: `cd activation-server-v2 && npm install`
   - Start Command: `cd activation-server-v2 && npm start`
   - Add persistent disk at `/data`
   - Set environment variable: `DB_PATH=/data/activations.db`

4. Deploy and verify:
   ```bash
   curl http://YOUR_ACTIVATION_SERVER/health
   ```

**Configuration:**
- Port: 3000
- Persistent Disk: 1GB at /data
- Environment Variables:
  - `DB_PATH`: /data/activations.db
  - `PORT`: 3000

---

## Monitoring

### Health Checks

**Backend Health:**
```bash
#!/bin/bash
# Check backend health
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://spark-backend-wj4e.onrender.com/health)
if [ "$RESPONSE" != "200" ]; then
    echo "❌ Backend unhealthy: HTTP $RESPONSE"
    # Send alert
else
    echo "✅ Backend healthy"
fi
```

**Frontend Health:**
```bash
#!/bin/bash
# Check frontend health
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://spark-rat-dashboard.vercel.app)
if [ "$RESPONSE" != "200" ]; then
    echo "❌ Frontend unhealthy: HTTP $RESPONSE"
    # Send alert
else
    echo "✅ Frontend healthy"
fi
```

### Metrics to Monitor

1. **Backend Metrics:**
   - Response time (target: <200ms)
   - Error rate (target: <1%)
   - Memory usage (target: <80%)
   - Active connections
   - Connected clients

2. **Frontend Metrics:**
   - Page load time
   - API call success rate
   - WebSocket connection stability

3. **Activation Server Metrics:**
   - Key generation rate
   - Verification success rate
   - Database size
   - Disk usage

### Monitoring Dashboard

Access real-time metrics:
```bash
cd /workspaces/Cupid-
./dashboard.sh
```

This shows:
- Backend status
- Response times
- Active connections
- Error rates
- Memory usage

---

## Troubleshooting

### Backend Issues

#### Issue: Backend returns 502 Bad Gateway
**Symptoms:** All requests return 502
**Diagnosis:**
```bash
# Check if backend is running
curl https://spark-backend-wj4e.onrender.com/health

# Check Render logs
# Go to Render dashboard > Service > Logs
```
**Solutions:**
1. Check Render logs for crash/panic
2. Verify environment variables set
3. Check for recent code changes
4. Restart service in Render dashboard
5. Redeploy if necessary

#### Issue: Authentication fails
**Symptoms:** Valid credentials return 401
**Diagnosis:**
```bash
# Test with known good credentials
curl -u "admin:ChangeMe2024!SecurePassword" \
  https://spark-backend-wj4e.onrender.com/api/devices
```
**Solutions:**
1. Verify password hash in environment variables
2. Check bcrypt implementation
3. Verify Basic Auth header format
4. Check for CORS issues

#### Issue: WebSocket connections fail
**Symptoms:** Clients can't establish WebSocket connection
**Diagnosis:**
```bash
# Test WebSocket connection
websocat wss://spark-backend-wj4e.onrender.com/ws \
  -H "Authorization: Basic $(echo -n 'admin:ChangeMe2024!SecurePassword' | base64)"
```
**Solutions:**
1. Check WebSocket upgrade headers
2. Verify authentication on WebSocket
3. Check for proxy/firewall issues
4. Verify Render supports WebSockets

#### Issue: Memory leak
**Symptoms:** Memory usage grows continuously
**Diagnosis:**
```bash
# Monitor memory over time
watch -n 60 'curl -s https://spark-backend-wj4e.onrender.com/api/metrics | jq .memory'
```
**Solutions:**
1. Check rate limiter cleanup goroutine
2. Verify event system cleanup
3. Check for goroutine leaks
4. Review connection cleanup
5. Restart service as temporary fix

#### Issue: Rate limiting too aggressive
**Symptoms:** Legitimate requests blocked
**Diagnosis:**
```bash
# Check rate limit stats
curl -u "admin:ChangeMe2024!SecurePassword" \
  https://spark-backend-wj4e.onrender.com/api/metrics | jq .rate_limit
```
**Solutions:**
1. Adjust rate limit configuration
2. Add IP to whitelist
3. Increase limits for production
4. Check for misconfigured limits

### Frontend Issues

#### Issue: White screen on load
**Symptoms:** Frontend shows blank page
**Diagnosis:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Check network tab for failed requests
**Solutions:**
1. Clear browser cache
2. Check API URL configuration
3. Verify CORS headers
4. Redeploy frontend

#### Issue: Can't login
**Symptoms:** Login form doesn't work
**Diagnosis:**
1. Check browser console for errors
2. Check network tab for API calls
3. Verify credentials
**Solutions:**
1. Verify backend is running
2. Check CORS configuration
3. Verify credentials correct
4. Check for JavaScript errors

#### Issue: Real-time updates not working
**Symptoms:** Dashboard doesn't update
**Diagnosis:**
1. Check WebSocket connection in network tab
2. Look for connection errors
**Solutions:**
1. Verify WebSocket URL correct
2. Check authentication on WebSocket
3. Verify backend WebSocket working
4. Check for proxy issues

### Activation Server Issues

#### Issue: Keys not persisting
**Symptoms:** Keys disappear after restart
**Diagnosis:**
```bash
# Check if database file exists
ls -lh /data/activations.db
```
**Solutions:**
1. Verify persistent disk mounted
2. Check DB_PATH environment variable
3. Verify write permissions
4. Check disk space

#### Issue: Key verification fails
**Symptoms:** Valid keys rejected
**Diagnosis:**
```bash
# Test key verification
curl -X POST http://YOUR_ACTIVATION_SERVER/api/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "TEST_KEY", "hwid": "TEST_HWID"}'
```
**Solutions:**
1. Check database for key
2. Verify key format
3. Check expiration date
4. Verify HWID matching logic

---

## Maintenance

### Regular Tasks

#### Daily
- Check health endpoints
- Review error logs
- Monitor response times
- Check active connections

#### Weekly
- Review rate limit stats
- Check memory usage trends
- Review blocked IPs
- Update documentation

#### Monthly
- Review and rotate logs
- Update dependencies
- Security audit
- Performance review
- Backup database

### Database Maintenance

**Backup Activation Database:**
```bash
# Download from Render
# Go to Render dashboard > Service > Disk > Download

# Or use SSH
ssh render-service
cp /data/activations.db /tmp/backup-$(date +%Y%m%d).db
```

**Restore Database:**
```bash
# Upload to Render
# Go to Render dashboard > Service > Disk > Upload

# Or use SSH
ssh render-service
cp /tmp/backup.db /data/activations.db
systemctl restart activation-server
```

**Clean Old Keys:**
```bash
# Connect to activation server
curl -X POST http://YOUR_ACTIVATION_SERVER/api/admin/cleanup \
  -H "Content-Type: application/json"
```

### Log Management

**View Backend Logs:**
```bash
# In Render dashboard
# Go to Service > Logs

# Or use Render CLI
render logs spark-backend
```

**View Frontend Logs:**
```bash
# In Vercel dashboard
# Go to Deployment > Logs

# Or use Vercel CLI
vercel logs
```

### Dependency Updates

**Update Backend Dependencies:**
```bash
cd spark-setup/spark-backend
go get -u ./...
go mod tidy
go test ./...
git commit -am "Update Go dependencies"
git push
```

**Update Frontend Dependencies:**
```bash
cd spark-setup/spark-frontend
npm update
npm audit fix
npm test
git commit -am "Update npm dependencies"
git push
```

**Update Activation Server Dependencies:**
```bash
cd activation-server-v2
npm update
npm audit fix
npm test
git commit -am "Update activation server dependencies"
git push
```

---

## Emergency Procedures

### Backend Down

**Immediate Actions:**
1. Check Render status page
2. Check backend logs
3. Verify recent deployments
4. Check for DDoS attack

**Recovery Steps:**
1. Restart service in Render dashboard
2. If restart fails, rollback to previous deployment
3. If rollback fails, redeploy from known good commit
4. Notify users of downtime

**Post-Incident:**
1. Review logs for root cause
2. Document incident
3. Implement fixes
4. Update monitoring

### Database Corruption

**Immediate Actions:**
1. Stop activation server
2. Backup corrupted database
3. Restore from latest backup
4. Restart activation server

**Recovery Steps:**
```bash
# Stop server
systemctl stop activation-server

# Backup corrupted DB
cp /data/activations.db /data/corrupted-$(date +%Y%m%d).db

# Restore from backup
cp /data/backup-latest.db /data/activations.db

# Restart server
systemctl start activation-server

# Verify
curl http://YOUR_ACTIVATION_SERVER/health
```

**Post-Incident:**
1. Analyze corruption cause
2. Implement additional backups
3. Add database integrity checks
4. Update backup procedures

### Security Breach

**Immediate Actions:**
1. Identify breach scope
2. Block malicious IPs
3. Rotate all credentials
4. Review access logs

**Recovery Steps:**
1. Change admin password
2. Regenerate API keys
3. Review and revoke suspicious keys
4. Update security measures
5. Notify affected users

**Post-Incident:**
1. Full security audit
2. Implement additional security
3. Update security documentation
4. Train team on security

### DDoS Attack

**Immediate Actions:**
1. Identify attack pattern
2. Enable aggressive rate limiting
3. Block attacking IPs
4. Contact hosting provider

**Recovery Steps:**
```bash
# Add IPs to blacklist
curl -X POST https://spark-backend-wj4e.onrender.com/api/admin/blacklist \
  -u "admin:PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"ips": ["1.2.3.4", "5.6.7.8"]}'

# Enable stricter rate limits
# Update configuration and redeploy
```

**Post-Incident:**
1. Analyze attack vectors
2. Implement DDoS protection
3. Consider CDN/WAF
4. Update monitoring

---

## Contact Information

### Support Channels
- GitHub Issues: https://github.com/oranolio956/Cupid-/issues
- Email: support@example.com (update with real email)

### Escalation
1. **Level 1:** Check runbook, attempt self-service fixes
2. **Level 2:** Review logs, contact development team
3. **Level 3:** Emergency procedures, contact senior engineers

### External Services
- **Render Support:** https://render.com/support
- **Vercel Support:** https://vercel.com/support
- **GitHub Support:** https://support.github.com

---

## Appendix

### Useful Commands

**Quick Health Check:**
```bash
curl -s https://spark-backend-wj4e.onrender.com/health | jq
```

**Test Authentication:**
```bash
curl -u "admin:ChangeMe2024!SecurePassword" \
  https://spark-backend-wj4e.onrender.com/api/devices | jq
```

**Monitor Logs:**
```bash
render logs spark-backend --tail
```

**Check Metrics:**
```bash
curl -u "admin:ChangeMe2024!SecurePassword" \
  https://spark-backend-wj4e.onrender.com/api/metrics | jq
```

### Configuration Files

**Backend Config:**
- Location: `spark-setup/spark-backend/`
- Key files: `main.go`, `go.mod`, `Dockerfile`

**Frontend Config:**
- Location: `spark-setup/spark-frontend/`
- Key files: `package.json`, `.env`, `vercel.json`

**Activation Server Config:**
- Location: `activation-server-v2/`
- Key files: `server.js`, `package.json`, `Dockerfile`

### Version Information

- Backend: Go 1.21+
- Frontend: React 18, Node.js 18+
- Activation Server: Node.js 18+
- Database: SQLite 3

### Change Log

- 2025-01-28: Initial runbook creation
- 2025-01-28: Added bug fix documentation
- 2025-01-28: Added emergency procedures
