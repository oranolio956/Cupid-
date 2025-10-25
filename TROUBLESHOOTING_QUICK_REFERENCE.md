# Spark RAT Troubleshooting Quick Reference

## Quick Diagnosis Commands

### System Health Check
```bash
# Check if backend is running
curl -s https://spark-backend-fixed-v2.onrender.com/api/health | jq

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

# Check client service
systemctl status spark-client

# Check logs for errors
journalctl -u spark-rat -f | grep ERROR
```

## Common Issues & Solutions

### Issue: Cannot Access Dashboard
**Symptoms**: Browser shows "This site can't be reached" or errors
**Quick Fix**:
```bash
# Check if frontend is deployed
curl -I https://spark-rat-dashboard.vercel.app

# Check DNS resolution
nslookup spark-rat-dashboard.vercel.app

# Deploy frontend if needed
cd spark-setup/spark-frontend
vercel --prod
```

### Issue: Backend Not Responding
**Symptoms**: API calls return connection errors
**Quick Fix**:
```bash
# Check backend health
curl -s https://spark-backend-fixed-v2.onrender.com/api/health

# Check backend logs
curl -s https://spark-backend-fixed-v2.onrender.com/api/logs

# Restart service
systemctl restart spark-rat
```

### Issue: Device Cannot Connect
**Symptoms**: Device shows as offline in dashboard
**Quick Fix**:
```bash
# Check client status
systemctl status spark-client

# Check client logs
journalctl -u spark-client -f

# Test network connectivity
ping spark-backend-fixed-v2.onrender.com

# Restart client
systemctl restart spark-client
```

### Issue: Authentication Fails
**Symptoms**: "Invalid credentials" error
**Quick Fix**:
```bash
# Check authentication logs
grep "LOGIN_ATTEMPT" logs/spark.log | tail -10

# Reset password
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users/reset-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'
```

### Issue: File Transfer Fails
**Symptoms**: Upload/download doesn't work
**Quick Fix**:
```bash
# Check file permissions
ls -la /path/to/file

# Check disk space
df -h

# Check file size limits
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/devices/123/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "path=/tmp/"
```

## Error Codes & Solutions

### HTTP 401 Unauthorized
**Cause**: Invalid or expired authentication token
**Solution**:
```bash
# Get new token
TOKEN=$(curl -s -X POST https://spark-backend-fixed-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.token')

# Test token
curl -s https://spark-backend-fixed-v2.onrender.com/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### HTTP 403 Forbidden
**Cause**: Insufficient permissions
**Solution**:
```bash
# Check user permissions
curl -s https://spark-backend-fixed-v2.onrender.com/api/users/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Update user permissions
curl -X PUT https://spark-backend-fixed-v2.onrender.com/api/users/123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissions":["device:read","device:write"]}'
```

### HTTP 404 Not Found
**Cause**: Resource not found
**Solution**:
```bash
# Check if resource exists
curl -s https://spark-backend-fixed-v2.onrender.com/api/devices \
  -H "Authorization: Bearer $TOKEN" | jq

# Check endpoint documentation
curl -s https://spark-backend-fixed-v2.onrender.com/api/info | jq
```

### HTTP 429 Too Many Requests
**Cause**: Rate limit exceeded
**Solution**:
```bash
# Check rate limit status
curl -I https://spark-backend-fixed-v2.onrender.com/api/health

# Wait for reset or reduce request frequency
sleep 60
```

### HTTP 500 Internal Server Error
**Cause**: Server error
**Solution**:
```bash
# Check server logs
journalctl -u spark-rat -f

# Restart service
systemctl restart spark-rat

# Check system resources
top
free -h
```

## Performance Issues

### High CPU Usage
**Diagnosis**:
```bash
# Check CPU usage
top -p $(pgrep spark-server)

# Check process details
ps aux | grep spark
```

**Solution**:
```bash
# Restart service
systemctl restart spark-rat

# Check for memory leaks
valgrind --tool=memcheck ./spark-server
```

### High Memory Usage
**Diagnosis**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10
```

**Solution**:
```bash
# Restart service
systemctl restart spark-rat

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Slow Response Times
**Diagnosis**:
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://spark-backend-fixed-v2.onrender.com/api/health

# Check network latency
ping spark-backend-fixed-v2.onrender.com
```

**Solution**:
```bash
# Optimize configuration
# Reduce rate limits
# Increase server resources
# Check network quality
```

## Network Issues

### Connection Timeout
**Diagnosis**:
```bash
# Test connectivity
ping spark-backend-fixed-v2.onrender.com

# Test port connectivity
telnet spark-backend-fixed-v2.onrender.com 443

# Check firewall
ufw status
```

**Solution**:
```bash
# Allow HTTPS traffic
ufw allow 443/tcp

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### DNS Resolution Issues
**Diagnosis**:
```bash
# Check DNS resolution
nslookup spark-backend-fixed-v2.onrender.com

# Check DNS servers
cat /etc/resolv.conf
```

**Solution**:
```bash
# Flush DNS cache
sudo systemctl flush-dns

# Update DNS servers
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
```

## Security Issues

### Rate Limiting Blocked
**Diagnosis**:
```bash
# Check rate limit status
curl -s https://spark-backend-fixed-v2.onrender.com/api/rate-limit/status

# Check rate limit headers
curl -I https://spark-backend-fixed-v2.onrender.com/api/health
```

**Solution**:
```bash
# Wait for reset
# Check reset time in headers
# Reduce request frequency
```

### IP Blocked
**Diagnosis**:
```bash
# Check blocked IPs
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/blocked-ips

# Check IP status
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/ip-status
```

**Solution**:
```bash
# Unblock IP
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/security/unblock-ip \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100"}'
```

## Log Analysis

### View Recent Errors
```bash
# Backend errors
grep ERROR logs/spark.log | tail -20

# Client errors
journalctl -u spark-client | grep ERROR | tail -20

# System errors
dmesg | tail -20
```

### Count Error Types
```bash
# Count errors by type
grep ERROR logs/spark.log | cut -d' ' -f4 | sort | uniq -c

# Count by severity
grep -E "(ERROR|WARN|FATAL)" logs/spark.log | cut -d' ' -f3 | sort | uniq -c
```

### Monitor Real-time Logs
```bash
# Backend logs
tail -f logs/spark.log | grep -E "(ERROR|WARN|FATAL)"

# Client logs
journalctl -u spark-client -f

# System logs
journalctl -f
```

## Service Management

### Start Services
```bash
# Start backend
systemctl start spark-rat

# Start client
systemctl start spark-client

# Start nginx
systemctl start nginx
```

### Stop Services
```bash
# Stop backend
systemctl stop spark-rat

# Stop client
systemctl stop spark-client

# Stop nginx
systemctl stop nginx
```

### Restart Services
```bash
# Restart backend
systemctl restart spark-rat

# Restart client
systemctl restart spark-client

# Restart nginx
systemctl restart nginx
```

### Check Service Status
```bash
# Check all services
systemctl status spark-rat spark-client nginx

# Check service logs
journalctl -u spark-rat --since "1 hour ago"

# Check service dependencies
systemctl list-dependencies spark-rat
```

## Database Issues

### Connection Failed
**Diagnosis**:
```bash
# Check database status
systemctl status postgresql

# Test database connection
psql -h localhost -U spark_rat -d spark_rat

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

**Solution**:
```bash
# Start database
systemctl start postgresql

# Check credentials
cat config.json | grep -A 5 database

# Test connection
psql -h localhost -U spark_rat -d spark_rat
```

### Database Performance
**Diagnosis**:
```bash
# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('spark_rat'));"

# Check active connections
psql -c "SELECT * FROM pg_stat_activity;"

# Check slow queries
psql -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

**Solution**:
```bash
# Optimize database
psql -c "VACUUM ANALYZE;"

# Check disk space
df -h

# Restart database
systemctl restart postgresql
```

## Emergency Procedures

### Service Recovery
```bash
# Stop all services
systemctl stop spark-rat spark-client nginx

# Clear temporary files
rm -rf /tmp/spark-*

# Restart services
systemctl start nginx spark-rat spark-client

# Verify service status
systemctl status spark-rat spark-client nginx
```

### Data Recovery
```bash
# Stop services
systemctl stop spark-rat

# Restore from backup
gunzip backup_20250101.sql.gz
psql spark_rat < backup_20250101.sql

# Restore configuration
tar -xzf config_backup_20250101.tar.gz

# Start services
systemctl start spark-rat
```

### Security Incident Response
```bash
# Block suspicious IP
ufw deny from 192.168.1.100

# Revoke all user sessions
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/security/revoke-all-sessions \
  -H "Authorization: Bearer $TOKEN"

# Check for unauthorized access
grep "unauthorized" logs/spark.log | tail -20

# Update security settings
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/security/update-settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rate_limit": 50, "max_sessions": 10}'
```

## Diagnostic Tools

### System Information
```bash
# System overview
uname -a
cat /etc/os-release
free -h
df -h

# Process information
ps aux | grep spark
lsof -i :8000

# Network information
netstat -tlnp
ss -tlnp
```

### Performance Analysis
```bash
# CPU usage
top -p $(pgrep spark-server)

# Memory usage
pmap $(pgrep spark-server)

# I/O usage
iotop -p $(pgrep spark-server)

# Network usage
nethogs
```

### Network Analysis
```bash
# Capture network traffic
tcpdump -i any -w spark-traffic.pcap

# Analyze traffic
wireshark spark-traffic.pcap

# Test connectivity
mtr spark-backend-fixed-v2.onrender.com
```

## Support Contacts

- **Emergency Support**: emergency@sparkrat.com
- **Technical Support**: support@sparkrat.com
- **Security Issues**: security@sparkrat.com
- **Documentation**: https://docs.sparkrat.com
- **Status Page**: https://status.sparkrat.com
- **Community Forum**: https://community.sparkrat.com

---

**Last Updated**: October 2025
**Version**: 2.0.0