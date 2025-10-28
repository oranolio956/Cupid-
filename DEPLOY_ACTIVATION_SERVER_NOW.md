# 🚀 DEPLOY ACTIVATION SERVER NOW

## Quick Deployment Steps

### 1. Go to Render Dashboard
https://dashboard.render.com

### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect to GitHub: `oranolio956/Cupid-`

### 3. Configure Service

**Basic Settings:**
```
Name: cupid-activation-server
Region: Oregon (US West)
Branch: main
Root Directory: activation-server-v2
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Environment Variables:**
```
PORT=3001
DB_PATH=/data/activations.db
NODE_ENV=production
```

**Add Persistent Disk:**
```
Name: activation-data
Mount Path: /data
Size: 1 GB
```

### 4. Deploy
Click "Create Web Service" and wait for deployment

### 5. Get Service URL
After deployment, note the URL (e.g., `https://cupid-activation-server.onrender.com`)

### 6. Test Deployment
```bash
curl https://YOUR-SERVICE-URL.onrender.com/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-01-28T..."}
```

### 7. Update Chrome Extension
Edit `cupidbot-extension/popup.js` line 5:
```javascript
const CONFIG = {
    ACTIVATION_SERVER_URL: 'https://YOUR-SERVICE-URL.onrender.com'
};
```

### 8. Test End-to-End

**Generate Test Key:**
```bash
curl -X POST https://YOUR-SERVICE-URL.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Verify Key:**
```bash
curl https://YOUR-SERVICE-URL.onrender.com/api/verify/YOUR_KEY_HERE
```

### 9. Test in Chrome Extension
1. Load extension in Chrome (chrome://extensions/)
2. Click extension icon
3. Enter generated key
4. Should activate successfully!

## ✅ Success Criteria
- Health endpoint returns 200
- Can generate keys
- Can verify keys
- Chrome extension can validate keys
- Database persists across restarts

## 🔧 Troubleshooting

**If health check fails:**
- Check Render logs
- Verify environment variables
- Check build logs for errors

**If CORS errors:**
- Extension origins are automatically allowed
- Check browser console for specific error

**If database doesn't persist:**
- Verify disk is mounted at /data
- Check DB_PATH environment variable

## 📝 After Deployment
1. Commit updated extension URL
2. Test full activation flow
3. Generate production keys
4. Monitor logs for errors
