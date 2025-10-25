# Spark RAT - Final Testing Checklist
## Backend Tests
### Health & Connectivity
- [ ] Backend is accessible: `curl https://spark-backend-fixed-v2.onrender.com/api/info`
- [ ] Response time < 500ms
- [ ] HTTPS certificate valid
- [ ] WebSocket connects: `wscat -c wss://spark-backend-fixed-v2.onrender.com/ws`
- [ ] CORS headers present
- [ ] Security headers present (HSTS, X-Frame-Options, etc.)
### Authentication
- [ ] Login with correct password works
- [ ] Login with wrong password fails
- [ ] Session persists across page reloads
- [ ] Logout works
- [ ] Unauthorized requests return 401
### Device Management
- [ ] Device registration works
- [ ] Device appears in list within 10 seconds
- [ ] Device metrics update every 3 seconds
- [ ] Offline device removed after 15 seconds
- [ ] Multiple devices can connect simultaneously
### API Endpoints
- [ ] GET /api/info returns version
- [ ] GET /api/device/list returns devices
- [ ] POST /api/device/register works
- [ ] POST /api/device/update works
- [ ] GET /api/device/{id} returns single device
- [ ] All endpoints require authentication
## Frontend Tests
### Login Page
- [ ] Login page loads on first visit
- [ ] Password field is type="password"
- [ ] Enter key submits form
- [ ] Loading indicator shows during login
- [ ] Error message shows on wrong password
- [ ] Redirects to dashboard on success
### Dashboard - Desktop
- [ ] Device table loads
- [ ] Columns are sortable
- [ ] Search/filter works
- [ ] Metrics display correctly (CPU, RAM, Disk)
- [ ] Network stats show upload/download
- [ ] OS icons display correctly
- [ ] All action buttons visible
### Dashboard - Mobile
- [ ] Stats header shows device counts
- [ ] Device cards render properly
- [ ] Hamburger menu opens drawer
- [ ] Empty state shows when no devices
- [ ] Pull-to-refresh works
- [ ] Responsive layout works (320px - 768px)
### Features
- [ ] Terminal modal opens
- [ ] Terminal accepts commands
- [ ] Terminal shows command output
- [ ] File explorer modal opens
- [ ] File explorer shows directory listing
- [ ] File upload works
- [ ] File download works
- [ ] Screenshot modal opens
- [ ] Screenshot captures and displays
- [ ] Process manager modal opens
- [ ] Process list displays
### Error Handling
- [ ] ErrorBoundary catches component errors
- [ ] Network errors show user-friendly message
- [ ] Loading states display during async operations
- [ ] Retry logic works on failed requests
## Client Tests
### Windows Client
- [ ] Downloads successfully
- [ ] Runs without errors
- [ ] Connects to backend
- [ ] Registers device
- [ ] Sends metrics every 3 seconds
- [ ] Responds to terminal commands
- [ ] File operations work
- [ ] Screenshot works
- [ ] Runs as service
- [ ] Auto-starts on boot (if configured)
### macOS Client (Intel)
- [ ] Downloads successfully
- [ ] Runs without errors
- [ ] Connects to backend
- [ ] All features work
- [ ] Permissions prompts handled
### macOS Client (Apple Silicon)
- [ ] Downloads successfully
- [ ] Runs on M1/M2/M3 Macs
- [ ] All features work
### Linux Client
- [ ] Downloads successfully
- [ ] Runs without errors
- [ ] systemd service installs
- [ ] Auto-starts on boot
- [ ] All features work
## Integration Tests
### Full Workflow - Windows
1. [ ] Visit downloads page
2. [ ] Download Windows client
3. [ ] Run as Administrator
4. [ ] Device appears in dashboard
5. [ ] Open terminal
6. [ ] Run command: `dir`
7. [ ] Output displays correctly
8. [ ] Open file explorer
9. [ ] Browse C:\ drive
10. [ ] Download a file
11. [ ] File downloads successfully
12. [ ] Take screenshot
13. [ ] Screenshot displays correctly
### Full Workflow - macOS
1. [ ] Download macOS client
2. [ ] Make executable: `chmod +x`
3. [ ] Run with sudo
4. [ ] Device appears in dashboard
5. [ ] Test all features
### Full Workflow - Linux
1. [ ] Download Linux client
2. [ ] Install as service
3. [ ] Device appears in dashboard
4. [ ] Test all features
## Performance Tests
### Load Testing
- [ ] 10 simultaneous devices connect
- [ ] Dashboard responsive with 10 devices
- [ ] All 10 devices update metrics
- [ ] Terminal works on all 10
- [ ] Server CPU < 50%
- [ ] Server RAM < 400MB
### Stress Testing
- [ ] 50 rapid API requests don't crash server
- [ ] Rate limiting kicks in appropriately
- [ ] WebSocket handles 10 concurrent connections
- [ ] Large file transfers don't timeout
## Security Tests
### Authentication
- [ ] Cannot access dashboard without login
- [ ] Cannot access API without auth
- [ ] Session expires after inactivity (if configured)
- [ ] Password brute force blocked by rate limiting
### Encryption
- [ ] All traffic uses HTTPS
- [ ] WebSocket uses WSS
- [ ] Client-server communication encrypted
- [ ] No credentials in logs
### Authorization
- [ ] Cannot access other users' devices (if multi-user)
- [ ] Admin actions require admin auth
- [ ] Device whitelist works (if configured)
## Mobile Tests
### iOS Safari
- [ ] Dashboard loads
- [ ] Login works
- [ ] Device cards render
- [ ] Touch interactions work
- [ ] Modals display correctly
### Android Chrome
- [ ] Dashboard loads
- [ ] All features work
- [ ] Responsive layout works
## Browser Compatibility
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
## Documentation Tests
- [ ] README.md renders correctly on GitHub
- [ ] ADMIN_GUIDE.md has correct URLs
- [ ] QUICK_REFERENCE.md is accurate
- [ ] Downloads page has correct links
- [ ] All code examples run without errors
## Deployment Tests
### Backend Deployment
- [ ] Render build succeeds
- [ ] Health check passes
- [ ] Logs are accessible
- [ ] Environment variables set correctly
- [ ] Auto-deploy works on git push
### Frontend Deployment
- [ ] Vercel build succeeds
- [ ] Environment variables set
- [ ] Custom domain works (if configured)
- [ ] CDN caching works
- [ ] Auto-deploy works on git push
## Monitoring Tests
- [ ] UptimeRobot pings every 5 minutes
- [ ] Alerts sent on downtime
- [ ] Render health checks work
- [ ] Logs capture errors
- [ ] Metrics collected
## Final Checks
- [ ] All passwords changed from defaults
- [ ] Salt is random and secret
- [ ] No TODO comments in production code
- [ ] No console.log in production code
- [ ] Git repo has no sensitive data
- [ ] .env files in .gitignore
- [ ] README has correct URLs
- [ ] Deployment guide tested by fresh user
- [ ] Backup system in place
- [ ] Monitoring configured