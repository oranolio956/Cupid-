# Activation Server Deployment to Render

## Prerequisites
- Render account
- GitHub repository with activation-server-v2 code

## Deployment Steps

### 1. Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect to GitHub repository: `oranolio956/Cupid-`
4. Configure service:

**Basic Settings:**
- Name: `cupid-activation-server`
- Region: `Oregon (US West)`
- Branch: `main`
- Root Directory: `activation-server-v2`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Environment:**
- Node Version: `18.x`

**Instance Type:**
- Free tier (or Starter for production)

### 2. Add Environment Variables

```
PORT=3001
DB_PATH=/data/activations.db
NODE_ENV=production
```

### 3. Add Persistent Disk

1. In service settings, go to "Disks"
2. Click "Add Disk"
3. Configure:
   - Name: `activation-data`
   - Mount Path: `/data`
   - Size: `1 GB` (free tier)

### 4. Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note the service URL: `https://cupid-activation-server.onrender.com`

### 5. Verify Deployment

```bash
# Test health endpoint
curl https://cupid-activation-server.onrender.com/health

# Expected response:
# {"status":"healthy","timestamp":"2025-01-28T..."}
```

### 6. Update Chrome Extension

Update `cupidbot-extension/popup.js`:
```javascript
const CONFIG = {
    ACTIVATION_SERVER_URL: 'https://cupid-activation-server.onrender.com'
};
```

### 7. Test End-to-End

```bash
# Generate a test key
curl -X POST https://cupid-activation-server.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify the key
curl https://cupid-activation-server.onrender.com/api/verify/YOUR_KEY_HERE
```

## Post-Deployment

### Monitor Logs
```bash
# View logs in Render dashboard
# Or use Render CLI:
render logs cupid-activation-server
```

### Database Backup
```bash
# Download database from Render dashboard
# Disks → activation-data → Download
```

### Update CORS Origins
If needed, update allowed origins in server.js:
```javascript
const allowedOrigins = [
    'https://cupidbot.org',
    'https://cupid-otys.vercel.app',
    'chrome-extension://YOUR_EXTENSION_ID'
];
```

## Troubleshooting

### Database Not Persisting
- Verify disk is mounted at `/data`
- Check DB_PATH environment variable
- Check disk permissions

### CORS Errors
- Add extension origin to allowedOrigins
- Check CORS middleware configuration

### Rate Limiting Too Strict
- Adjust rate limit in server.js
- Current: 10 requests/hour per IP

## Security Notes

- Database is SQLite (file-based)
- Persistent disk ensures data survives restarts
- Rate limiting prevents abuse
- CORS restricts access to allowed origins
- No authentication on admin endpoints (add if needed)
