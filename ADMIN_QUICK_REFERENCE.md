# Spark RAT Administrator Quick Reference

## Quick Commands

### System Management
```bash
# Check system status
curl -s https://spark-backend-fixed-v2.onrender.com/api/health | jq

# View system metrics
curl -s https://spark-backend-fixed-v2.onrender.com/api/metrics | jq

# Check server logs
tail -f logs/spark.log

# Restart service
systemctl restart spark-rat
```

### User Management
```bash
# Create new user
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","role":"operator"}'

# List all users
curl -s https://spark-backend-fixed-v2.onrender.com/api/users \
  -H "Authorization: Bearer $TOKEN" | jq

# Reset user password
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/users/123/reset-password \
  -H "Authorization: Bearer $TOKEN"
```

### Device Management
```bash
# List all devices
curl -s https://spark-backend-fixed-v2.onrender.com/api/devices \
  -H "Authorization: Bearer $TOKEN" | jq

# Get device details
curl -s https://spark-backend-fixed-v2.onrender.com/api/devices/123 \
  -H "Authorization: Bearer $TOKEN" | jq

# Execute command on device
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/devices/123/commands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"systemctl status spark-client"}'
```

### Security Management
```bash
# Check security status
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/status \
  -H "Authorization: Bearer $TOKEN" | jq

# View blocked IPs
curl -s https://spark-backend-fixed-v2.onrender.com/api/security/blocked-ips \
  -H "Authorization: Bearer $TOKEN" | jq

# Unblock IP
curl -X POST https://spark-backend-fixed-v2.onrender.com/api/security/unblock-ip \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100"}'
```

## Configuration Files

### Backend Configuration (`config.json`)
```json
{
  "listen": ":8000",
  "environment": "production",
  "auth": {
    "admin": "$bcrypt$your-hash-here"
  },
  "security": {
    "rate_limit": {
      "enabled": true,
      "requests_per_minute": 100
    },
    "cors": {
      "enabled": true,
      "allowed_origins": ["https://spark-rat-dashboard.vercel.app"]
    }
  },
  "logging": {
    "level": "info",
    "file": "logs/spark.log"
  }
}
```

### Frontend Configuration (`.env.local`)
```env
REACT_APP_API_URL=https://spark-backend-fixed-v2.onrender.com
REACT_APP_WS_URL=wss://spark-backend-fixed-v2.onrender.com
REACT_APP_NAME=Spark RAT Dashboard
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production
```

### Client Configuration (`config.json`)
```json
{
  "server": {
    "host": "spark-backend-fixed-v2.onrender.com",
    "port": 443,
    "secure": true
  },
  "client": {
    "name": "My Device",
    "group": "Default",
    "auto_connect": true
  }
}
```

## Environment Variables

### Backend Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 8000 | Yes |
| `GO_ENV` | Environment | development | Yes |
| `SPARK_SALT` | Encryption salt | - | Yes |
| `SPARK_ADMIN_HASH` | Admin password hash | - | Yes |
| `LOG_LEVEL` | Logging level | info | No |
| `RATE_LIMIT_RPS` | Rate limit (requests/sec) | 100 | No |
| `CORS_ORIGINS` | CORS allowed origins | * | No |

### Frontend Environment Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | - | Yes |
| `REACT_APP_WS_URL` | WebSocket URL | - | Yes |
| `REACT_APP_NAME` | Application name | Spark RAT | No |
| `REACT_APP_VERSION` | Application version | 2.0.0 | No |
| `REACT_APP_ENVIRONMENT` | Environment | production | No |

## Service Management

### Systemd Service
```bash
# Enable service
sudo systemctl enable spark-rat

# Start service
sudo systemctl start spark-rat

# Stop service
sudo systemctl stop spark-rat

# Restart service
sudo systemctl restart spark-rat

# Check status
sudo systemctl status spark-rat

# View logs
sudo journalctl -u spark-rat -f
```

### Docker Service
```bash
# Build image
docker build -t spark-rat-backend .

# Run container
docker run -d --name spark-backend -p 8000:8000 spark-rat-backend

# Stop container
docker stop spark-backend

# Remove container
docker rm spark-backend

# View logs
docker logs spark-backend -f
```

## Monitoring Commands

### System Health
```bash
# Check API health
curl -s https://spark-backend-fixed-v2.onrender.com/api/health

# Check system info
curl -s https://spark-backend-fixed-v2.onrender.com/api/info

# Check metrics
curl -s https://spark-backend-fixed-v2.onrender.com/api/metrics
```

### Performance Monitoring
```bash
# Check CPU usage
top -p $(pgrep spark-server)

# Check memory usage
free -h

# Check disk usage
df -h

# Check network usage
netstat -i
```

### Log Analysis
```bash
# View recent errors
grep ERROR logs/spark.log | tail -20

# Count errors by type
grep ERROR logs/spark.log | cut -d' ' -f4 | sort | uniq -c

# Monitor real-time logs
tail -f logs/spark.log | grep -E "(ERROR|WARN)"

# Search for specific events
grep "device_connected" logs/spark.log
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
pg_dump spark_rat > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql

# Restore backup
gunzip backup_20250101.sql.gz
psql spark_rat < backup_20250101.sql
```

### Configuration Backup
```bash
# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz config.json .env

# Restore configuration
tar -xzf config_backup_20250101.tar.gz
```

### File System Backup
```bash
# Backup uploaded files
tar -czf files_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup logs
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/
```

## Security Commands

### SSL Certificate Management
```bash
# Check certificate expiry
openssl x509 -in ssl/cert.pem -noout -dates

# Renew certificate
certbot renew --nginx

# Test SSL configuration
openssl s_client -connect spark-backend-fixed-v2.onrender.com:443
```

### Firewall Management
```bash
# Check firewall status
ufw status

# Allow HTTPS traffic
ufw allow 443/tcp

# Block IP address
ufw deny from 192.168.1.100

# Remove IP block
ufw delete deny from 192.168.1.100
```

### User Access Control
```bash
# Check user sessions
curl -s https://spark-backend-fixed-v2.onrender.com/api/users/sessions \
  -H "Authorization: Bearer $TOKEN" | jq

# Revoke user session
curl -X DELETE https://spark-backend-fixed-v2.onrender.com/api/users/123/sessions/456 \
  -H "Authorization: Bearer $TOKEN"

# Check failed login attempts
grep "LOGIN_ATTEMPT.*fail" logs/spark.log | tail -10
```

## Troubleshooting Commands

### Connection Issues
```bash
# Test API connectivity
curl -I https://spark-backend-fixed-v2.onrender.com/api/health

# Test WebSocket connectivity
wscat -c wss://spark-backend-fixed-v2.onrender.com/ws

# Check DNS resolution
nslookup spark-backend-fixed-v2.onrender.com

# Test port connectivity
telnet spark-backend-fixed-v2.onrender.com 443
```

### Performance Issues
```bash
# Check system load
uptime

# Check memory usage
free -h

# Check disk I/O
iostat -x 1

# Check network I/O
iftop

# Check process resources
htop
```

### Service Issues
```bash
# Check service status
systemctl status spark-rat

# Check service logs
journalctl -u spark-rat --since "1 hour ago"

# Restart service
systemctl restart spark-rat

# Check service dependencies
systemctl list-dependencies spark-rat
```

## Emergency Procedures

### Service Recovery
```bash
# Stop all services
systemctl stop spark-rat

# Clear temporary files
rm -rf /tmp/spark-*

# Restart services
systemctl start spark-rat

# Verify service status
systemctl status spark-rat
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

## Contact Information

- **Emergency Support**: emergency@sparkrat.com
- **Technical Support**: support@sparkrat.com
- **Security Issues**: security@sparkrat.com
- **Documentation**: https://docs.sparkrat.com
- **Status Page**: https://status.sparkrat.com

---

**Last Updated**: October 2025
**Version**: 2.0.0