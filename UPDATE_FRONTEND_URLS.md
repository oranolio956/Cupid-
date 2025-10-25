# FRONTEND URL UPDATE CHECKLIST
IMPORTANT: DO NOT PROCEED until you have the ACTUAL backend URL from Render deployment.
The backend URL should look like: https://[service-name].onrender.com
Example: https://spark-backend-fixed-v2.onrender.com

## FILES THAT MUST BE UPDATED (ALL 3 - NO EXCEPTIONS):

### FILE 1: spark-setup/spark-frontend/vercel.json
**Location**: Lines 24-25
**Current values**:
- REACT_APP_API_URL: "https://spark-backend-fixed-v2.onrender.com"
- REACT_APP_WS_URL: "wss://spark-backend-fixed-v2.onrender.com"
**Action**:
1. Read the ENTIRE file first
2. Find EXACT line numbers for REACT_APP_API_URL and REACT_APP_WS_URL
3. Replace ONLY the URL portion with your actual Render URL
4. For API_URL: use https://[your-url]
5. For WS_URL: use wss://[your-url] (note: wss not https)
6. Read file again to verify

### FILE 2: spark-setup/spark-frontend/webpack.config.js
**Location**: Lines 72-73
**Current values**:
- process.env.REACT_APP_API_URL default: 'https://spark-backend-fixed-v2.onrender.com'
- process.env.REACT_APP_WS_URL default: 'wss://spark-backend-fixed-v2.onrender.com'
**Action**:
1. Read lines 60-80 of the file first
2. Find the webpack.DefinePlugin section
3. Locate EXACT lines with REACT_APP_API_URL and REACT_APP_WS_URL
4. Replace ONLY the URL portion in the JSON.stringify() calls
5. Keep the || operator and JSON.stringify() syntax
6. Read those lines again to verify

### FILE 3: spark-setup/spark-frontend/src/config/backend.js
**Location**: Lines 6-7
**Current values**:
- API_URL: process.env.REACT_APP_API_URL || 'https://spark-backend-fixed-v2.onrender.com'
- WS_URL: process.env.REACT_APP_WS_URL || 'wss://spark-backend-fixed-v2.onrender.com'
**Action**:
1. Read lines 1-20 of the file first
2. Find EXACT lines with API_URL and WS_URL
3. Replace ONLY the URL portion in the fallback (after ||)
4. Keep the process.env checks
5. Read those lines again to verify

## VERIFICATION CHECKLIST:
- [ ] Read FILE 1 completely - URLs updated
- [ ] Read FILE 2 completely - URLs updated  
- [ ] Read FILE 3 completely - URLs updated
- [ ] All 3 files use SAME backend URL
- [ ] API URLs use https://
- [ ] WebSocket URLs use wss://
- [ ] No typos in URLs
- [ ] No trailing slashes in URLs
- [ ] All JSON is valid (no syntax errors)

## AFTER UPDATING ALL 3 FILES:
Run these grep commands to verify:
```bash
grep -n "REACT_APP_API_URL" spark-setup/spark-frontend/vercel.json
grep -n "REACT_APP_API_URL" spark-setup/spark-frontend/webpack.config.js
grep -n "API_URL" spark-setup/spark-frontend/src/config/backend.js
```
All three should show YOUR ACTUAL BACKEND URL.