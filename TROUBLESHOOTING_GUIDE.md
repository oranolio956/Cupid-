# Spark RAT Troubleshooting Guide

## Table of Contents
1. [Quick Diagnosis](#quick-diagnosis)
2. [Common Issues](#common-issues)
3. [Connection Problems](#connection-problems)
4. [Performance Issues](#performance-issues)
5. [Authentication Issues](#authentication-issues)
6. [Device Management Issues](#device-management-issues)
7. [File Transfer Issues](#file-transfer-issues)
8. [Security Issues](#security-issues)
9. [System Errors](#system-errors)
10. [Advanced Troubleshooting](#advanced-troubleshooting)

## Quick Diagnosis

### System Health Check
```bash
# Check if backend is running
curl -s https://spark-backend-fixed-v2.onrender.com/api/health

# Check if frontend is accessible
curl -I https://spark-rat-dashboard.vercel.app

# Check system resources
top
free -h
df -h
```

### Service Status Check
```bash
# Check backend service
systemctl status spark-rat

# Check logs for errors
tail -f logs/spark.log | grep ERROR

# Check network connectivity
ping spark-backend-fixed-v2.onrender.com
```

## Common Issues

### Issue: Cannot Access Dashboard

#### Symptoms
- Browser shows "This site can't be reached"
- Dashboard loads but shows errors
- Login page doesn't appear

#### Diagnosis
```bash
# Check if frontend is deployed
curl -I https://spark-rat-dashboard.vercel.app

# Check DNS resolution
nslookup spark-rat-dashboard.vercel.app

# Check SSL certificate
openssl s_client -connect spark-rat-dashboard.vercel.app:443
```

#### Solutions
1. **Frontend Not Deployed**
   ```bash
   # Deploy frontend to Vercel
   cd spark-setup/spark-frontend
   vercel --prod
   ```

2. **DNS Issues**
   ```bash
   # Flush DNS cache
   sudo systemctl flush-dns
   # or
   sudo dscacheutil -flushcache
   ```

3. **SSL Certificate Issues**
   - Check certificate validity
   - Renew certificate if expired
   - Verify certificate chain

### Issue: Backend Not Responding

#### Symptoms
- API calls return connection errors
- Health check fails
- WebSocket connections fail

#### Diagnosis
```bash
# Check backend health
curl -s https://spark-backend-fixed-v2.onrender.com/api/health

# Check backend logs
curl -s https://spark-backend-fixed-v2.onrender.com/api/logs

# Check system resources
top -p $(pgrep spark-server)
```

#### Solutions
1. **Service Down**
   ```bash
   # Restart service
   systemctl restart spark-rat
   
   # Check service status
   systemctl status spark-rat
   ```

2. **High Resource Usage**
   ```bash
   # Check memory usage
   free -h
   
   # Check CPU usage
   top
   
   # Restart if needed
   systemctl restart spark-rat
   ```

3. **Port Conflicts**
   ```bash
   # Check if port is in use
   netstat -tlnp | grep :8000
   
   # Kill conflicting process
   sudo kill -9 <PID>
   ```

## Connection Problems

### Issue: Device Cannot Connect to Server

#### Symptoms
- Device shows as offline in dashboard
- Client logs show connection errors
- WebSocket connection fails

#### Diagnosis
```bash
# Check client logs
tail -f /var/log/spark-client.log

# Test network connectivity
ping spark-backend-fixed-v2.onrender.com

# Test port connectivity
telnet spark-backend-fixed-v2.onrender.com 443
```

#### Solutions
1. **Network Issues**
   ```bash
   # Check firewall settings
   ufw status
   
   # Allow HTTPS traffic
   ufw allow 443/tcp
   
   # Check proxy settings
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   ```

2. **Client Configuration**
   ```bash
   # Check client config
   cat /etc/spark-client/config.json
   
   # Update server URL
   sed -i 's/old-server/new-server/g' /etc/spark-client/config.json
   
   # Restart client
   systemctl restart spark-client
   ```

3. **Authentication Issues**
   ```bash
   # Check client credentials
   cat /etc/spark-client/credentials.json
   
   # Regenerate client key
   spark-client --generate-key
   ```

### Issue: WebSocket Connection Fails

#### Symptoms
- Real-time features not working
- Dashboard shows connection errors
- Commands not executing

#### Diagnosis
```bash
# Test WebSocket connection
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws

# Check WebSocket logs
grep "websocket" logs/spark.log | tail -10

# Check network connectivity
curl -I https://spark-backend-fixed-v2.onrender.com/ws
```

#### Solutions
1. **Proxy Issues**
   ```bash
   # Configure proxy for WebSocket
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

2. **Firewall Issues**
   ```bash
   # Allow WebSocket traffic
   ufw allow 443/tcp
   
   # Check NAT settings
   iptables -L -n
   ```

3. **Client Issues**
   ```bash
   # Update client
   spark-client --update
   
   # Restart client
   systemctl restart spark-client
   ```

## Performance Issues

### Issue: Slow Response Times

#### Symptoms
- Dashboard loads slowly
- Commands take long to execute
- File transfers are slow

#### Diagnosis
```bash
# Check system resources
top
free -h
df -h

# Check network latency
ping spark-backend-fixed-v2.onrender.com

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://spark-backend-fixed-v2.onrender.com/api/health
```

#### Solutions
1. **High CPU Usage**
   ```bash
   # Check CPU usage
   top -p $(pgrep spark-server)
   
   # Optimize configuration
   # Reduce rate limits
   # Increase server resources
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Restart service
   systemctl restart spark-rat
   
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **Network Issues**
   ```bash
   # Check network speed
   speedtest-cli
   
   # Check bandwidth usage
   iftop
   
   # Optimize network settings
   # Use CDN for static content
   # Enable compression
   ```

### Issue: High Memory Usage

#### Symptoms
- System running out of memory
- Service crashes with OOM errors
- Slow performance

#### Diagnosis
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check for memory leaks
valgrind --tool=memcheck ./spark-server

# Check swap usage
swapon -s
```

#### Solutions
1. **Memory Leak**
   ```bash
   # Restart service
   systemctl restart spark-rat
   
   # Check for memory leaks in code
   # Update to latest version
   ```

2. **Insufficient Memory**
   ```bash
   # Add swap space
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # Add to /etc/fstab
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

3. **Configuration Issues**
   ```bash
   # Reduce cache size
   # Limit concurrent connections
   # Optimize database queries
   ```

## Authentication Issues

### Issue: Login Fails

#### Symptoms
- "Invalid credentials" error
- Login page doesn't respond
- Session expires immediately

#### Diagnosis
```bash
# Check authentication logs
grep "LOGIN_ATTEMPT" logs/spark.log | tail -10

# Check user database
curl -s https://spark-backend-fixed-v2.onrender.com/api/users \
  -H "Authorization: Bearer $TOKEN"

# Test authentication endpoint
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

#### Solutions
1. **Wrong Credentials**
   ```bash
   # Reset password
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users/reset-password \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"username":"test"}'
   ```

2. **Account Locked**
   ```bash
   # Unlock account
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users/unlock \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"username":"test"}'
   ```

3. **Session Issues**
   ```bash
   # Clear all sessions
   curl -X DELETE https://spark-backend-fixed-v2.onrender.com/api/sessions \
     -H "Authorization: Bearer $TOKEN"
   ```

### Issue: Token Expired

#### Symptoms
- "Token expired" error
- API calls return 401
- Dashboard logs out automatically

#### Diagnosis
```bash
# Check token expiry
echo $TOKEN | base64 -d | jq

# Test token validity
curl -s https://spark-backend-fixed-v2.onrender.com/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

#### Solutions
1. **Refresh Token**
   ```bash
   # Get new token
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/auth/refresh \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Login Again**
   ```bash
   # Login to get new token
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

## Device Management Issues

### Issue: Device Not Appearing in Dashboard

#### Symptoms
- Device shows as offline
- Device not in device list
- Client running but not connected

#### Diagnosis
```bash
# Check client status
systemctl status spark-client

# Check client logs
journalctl -u spark-client -f

# Test client connectivity
spark-client --test-connection
```

#### Solutions
1. **Client Not Running**
   ```bash
   # Start client
   systemctl start spark-client
   
   # Enable auto-start
   systemctl enable spark-client
   ```

2. **Configuration Issues**
   ```bash
   # Check client config
   cat /etc/spark-client/config.json
   
   # Update server URL
   spark-client --configure
   ```

3. **Network Issues**
   ```bash
   # Check network connectivity
   ping spark-backend-fixed-v2.onrender.com
   
   # Check firewall
   ufw status
   ```

### Issue: Device Disconnects Frequently

#### Symptoms
- Device goes offline frequently
- Connection drops during operations
- WebSocket disconnections

#### Diagnosis
```bash
# Check connection logs
grep "disconnect" logs/spark.log | tail -10

# Check network stability
ping -c 100 spark-backend-fixed-v2.onrender.com

# Check client logs
tail -f /var/log/spark-client.log
```

#### Solutions
1. **Network Instability**
   ```bash
   # Check network quality
   mtr spark-backend-fixed-v2.onrender.com
   
   # Optimize network settings
   # Use wired connection
   # Check router settings
   ```

2. **Client Issues**
   ```bash
   # Update client
   spark-client --update
   
   # Restart client
   systemctl restart spark-client
   ```

3. **Server Issues**
   ```bash
   # Check server logs
   tail -f logs/spark.log
   
   # Restart server
   systemctl restart spark-rat
   ```

## File Transfer Issues

### Issue: File Upload Fails

#### Symptoms
- Upload progress stops
- "Upload failed" error
- Files not appearing in destination

#### Diagnosis
```bash
# Check file permissions
ls -la /path/to/file

# Check disk space
df -h

# Check upload logs
grep "upload" logs/spark.log | tail -10
```

#### Solutions
1. **Permission Issues**
   ```bash
   # Fix file permissions
   chmod 644 /path/to/file
   
   # Check directory permissions
   ls -la /path/to/directory
   ```

2. **Disk Space Issues**
   ```bash
   # Check disk space
   df -h
   
   # Clean up space
   sudo apt autoremove
   sudo apt autoclean
   ```

3. **Network Issues**
   ```bash
   # Check network speed
   speedtest-cli
   
   # Retry upload
   # Use smaller chunks
   ```

### Issue: File Download Fails

#### Symptoms
- Download doesn't start
- Download stops mid-way
- "File not found" error

#### Diagnosis
```bash
# Check file exists
ls -la /path/to/file

# Check file permissions
ls -la /path/to/file

# Test download URL
curl -I https://spark-backend-fixed-v2.onrender.com/api/files/download?path=/path/to/file
```

#### Solutions
1. **File Not Found**
   ```bash
   # Check file path
   find / -name "filename" 2>/dev/null
   
   # Update file path
   # Check file permissions
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   chmod 644 /path/to/file
   
   # Check directory permissions
   chmod 755 /path/to/directory
   ```

3. **Network Issues**
   ```bash
   # Check network connectivity
   ping spark-backend-fixed-v2.onrender.com
   
   # Retry download
   # Use different network
   ```

## Security Issues

### Issue: Rate Limiting Blocked

#### Symptoms
- "Rate limit exceeded" error
- API calls return 429
- Service temporarily unavailable

#### Diagnosis
```bash
# Check rate limit status
curl -s https://spark-backend-fixed-v2.onrender.com/api/rate-limit/status

# Check rate limit headers
curl -I https://spark-backend-fixed-v2.onrender.com/api/health

# Check rate limit logs
grep "rate_limit" logs/spark.log | tail -10
```

#### Solutions
1. **Wait for Reset**
   ```bash
   # Wait for rate limit reset
   # Check reset time in headers
   # Reduce request frequency
   ```

2. **Adjust Rate Limits**
   ```bash
   # Update rate limit configuration
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/config/rate-limit \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"requests_per_minute": 200}'
   ```

3. **Optimize Requests**
   ```bash
   # Use batch requests
   # Implement request queuing
   # Cache responses
   ```

### Issue: IP Blocked

#### Symptoms
- "IP blocked" error
- Cannot access any endpoints
- Connection refused

#### Diagnosis
```bash
# Check blocked IPs
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/blocked-ips

# Check IP status
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/ip-status

# Check security logs
grep "blocked" logs/spark.log | tail -10
```

#### Solutions
1. **Unblock IP**
   ```bash
   # Unblock specific IP
   curl -X POST https://spark-backend-fixed-v2.onrender.com/api/security/unblock-ip \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"ip":"192.168.1.100"}'
   ```

2. **Wait for Auto-Unblock**
   ```bash
   # Check unblock time
   # Wait for automatic unblock
   # Use different IP
   ```

3. **Review Security Settings**
   ```bash
   # Check security configuration
   # Adjust blocking thresholds
   # Review failed attempts
   ```

## System Errors

### Issue: Service Crashes

#### Symptoms
- Service stops unexpectedly
- Error logs show crashes
- System becomes unresponsive

#### Diagnosis
```bash
# Check service status
systemctl status spark-rat

# Check crash logs
journalctl -u spark-rat --since "1 hour ago"

# Check system logs
dmesg | tail -20
```

#### Solutions
1. **Restart Service**
   ```bash
   # Restart service
   systemctl restart spark-rat
   
   # Check service status
   systemctl status spark-rat
   ```

2. **Check Dependencies**
   ```bash
   # Check service dependencies
   systemctl list-dependencies spark-rat
   
   # Check required services
   systemctl status postgresql
   systemctl status nginx
   ```

3. **Update Service**
   ```bash
   # Update service
   systemctl daemon-reload
   systemctl restart spark-rat
   
   # Check for updates
   apt update && apt upgrade
   ```

### Issue: Database Connection Failed

#### Symptoms
- "Database connection failed" error
- Service cannot start
- Data operations fail

#### Diagnosis
```bash
# Check database status
systemctl status postgresql

# Test database connection
psql -h localhost -U spark_rat -d spark_rat

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

#### Solutions
1. **Start Database**
   ```bash
   # Start database service
   systemctl start postgresql
   
   # Enable auto-start
   systemctl enable postgresql
   ```

2. **Check Credentials**
   ```bash
   # Check database credentials
   cat config.json | grep -A 5 database
   
   # Update credentials
   # Test connection
   ```

3. **Check Database Space**
   ```bash
   # Check disk space
   df -h
   
   # Check database size
   psql -c "SELECT pg_size_pretty(pg_database_size('spark_rat'));"
   ```

## Advanced Troubleshooting

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
systemctl restart spark-rat

# Check debug logs
tail -f logs/spark.log | grep DEBUG
```

### Performance Profiling
```bash
# Profile CPU usage
perf record -p $(pgrep spark-server)
perf report

# Profile memory usage
valgrind --tool=massif ./spark-server
```

### Network Analysis
```bash
# Capture network traffic
tcpdump -i any -w spark-traffic.pcap

# Analyze traffic
wireshark spark-traffic.pcap
```

### Log Analysis
```bash
# Search for specific errors
grep -i "error\|exception\|fatal" logs/spark.log

# Count error types
grep -i "error" logs/spark.log | cut -d' ' -f4 | sort | uniq -c

# Monitor real-time logs
tail -f logs/spark.log | grep -E "(ERROR|WARN|FATAL)"
```

## Getting Help

### Self-Help Resources
- **Documentation**: https://docs.sparkrat.com
- **FAQ**: https://docs.sparkrat.com/faq
- **Community Forum**: https://community.sparkrat.com
- **Knowledge Base**: https://kb.sparkrat.com

### Support Channels
- **Email Support**: support@sparkrat.com
- **Live Chat**: Available 24/7
- **Phone Support**: +1-800-SPARK-RAT
- **Emergency Support**: emergency@sparkrat.com

### Escalation Process
1. **Level 1**: Basic troubleshooting
2. **Level 2**: Advanced technical support
3. **Level 3**: Engineering team
4. **Level 4**: Development team

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Support**: support@sparkrat.com