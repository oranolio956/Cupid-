# 🔍 Console Error Checker Tool

**Location:** `/trial/console-checker.html`  
**Purpose:** Debug console errors on any page across the site  
**Status:** ✅ Installed and working

---

## 🚀 How to Use

### Method 1: Local Testing
```bash
cd /workspace/trial
python3 -m http.server 8888
```

Then open in browser:
- **Main page:** http://localhost:8888/
- **Console checker:** http://localhost:8888/console-checker.html

### Method 2: Production
Upload `console-checker.html` to your trial/ directory:
- **URL:** https://cupidbot.org/trial/console-checker.html

---

## 🎯 Features

### Real-time Error Detection
- ✅ **JavaScript errors** - Catches all JS runtime errors
- ✅ **Missing resources** - Detects 404s for CSS/JS/images
- ✅ **CSP violations** - Identifies Content Security Policy blocks
- ✅ **CORS issues** - Flags cross-origin resource problems
- ✅ **HTML validation** - Basic structure checks

### Visual Console
- 🔴 **Errors** - Red background, critical issues
- 🟡 **Warnings** - Yellow background, potential problems
- 🔵 **Info** - Blue background, informational messages
- 🟢 **Success** - Green background, confirmations

### Automatic Checks
- Page load status
- DOCTYPE presence
- Body content check
- CSP detection
- Resource counting (CSS, JS, images)
- HTML size verification

---

## 📊 What It Checks

### 1. Page Loading
```
✓ Page loaded successfully
✓ HTML size: 42009 bytes
✓ Found 2 stylesheets, 3 scripts, 15 images
```

### 2. Content Security Policy (CSP)
```
⚠️ CSP detected: default-src 'self'; script-src...
⚠️ CSP has upgrade-insecure-requests (may break HTTP testing)
```

### 3. Missing Resources
```
❌ Failed to load stylesheet: fonts/google-fonts.css (404)
❌ Script error: install-script.js:45 Uncaught TypeError
```

### 4. HTML Structure
```
⚠️ Missing DOCTYPE
❌ No <body> tag
⚠️ HTML is suspiciously short: 250 bytes
```

---

## 🛠️ Usage Examples

### Check Current Page
1. Open console-checker.html
2. Default checks index.html automatically
3. View results in real-time

### Check Different Page
1. Enter URL in input field: `../index.html`
2. Click "Check Page"
3. View error report

### Check External Resources
1. Enter full URL: `https://cupidbot.org/`
2. Note: May hit CORS restrictions
3. Local files work best

---

## 🐛 Common Issues Detected

### Issue 1: White Page (CSP upgrade-insecure-requests)
**Symptom:** Page loads but shows nothing

**Detection:**
```
⚠️ CSP has upgrade-insecure-requests (may break HTTP testing)
```

**Solution:** Remove from CSP (✅ Already fixed!)

---

### Issue 2: Missing Fonts
**Symptom:** Text not rendering, fallback fonts

**Detection:**
```
❌ Failed to load: fonts/google-fonts.css (404)
```

**Solution:** 
```bash
# Verify fonts exist
ls -la /workspace/trial/fonts/
```

---

### Issue 3: JavaScript Errors
**Symptom:** Interactive features broken

**Detection:**
```
❌ install-script.js:123 Uncaught ReferenceError: gtag is not defined
```

**Solution:** Check removed GA code for dependencies

---

### Issue 4: External Resource Blocking
**Symptom:** Images/CSS not loading

**Detection:**
```
❌ Blocked by CSP: https://cdn.prod.website-files.com/...
```

**Solution:** Add domain to CSP whitelist

---

## 🔧 Technical Details

### How It Works
1. **IFrame Loading** - Loads target page in hidden iframe
2. **Error Capture** - Intercepts window.error events
3. **Resource Scanning** - Analyzes DOM for links/scripts/images
4. **Fetch Validation** - Parallel fetch to verify HTML
5. **Real-time Logging** - Displays results with timestamps

### Limitations
- **CORS**: Cannot inspect cross-origin iframes
- **CSP**: Some CSPs block iframe loading
- **Timing**: May miss very early errors
- **Network**: Doesn't catch network timing issues

### Browser Compatibility
- ✅ Chrome/Edge (tested)
- ✅ Firefox (tested)
- ✅ Safari (should work)
- ✅ Mobile browsers (works)

---

## 📋 Quick Troubleshooting

### Page Shows White/Blank
1. Open console-checker.html
2. Look for CSP warnings
3. Check for JavaScript errors
4. Verify all resources load (200 status)

### Fonts Not Loading
1. Check: `ls trial/fonts/`
2. Verify: fonts/google-fonts.css exists
3. Check CSP: font-src includes 'self'

### JavaScript Not Running
1. Check CSP: script-src includes 'unsafe-inline'
2. Look for console errors
3. Verify install-script.js loads

### Images Not Showing
1. Check CSP: img-src includes https:
2. Verify image paths are correct
3. Check 404s in Network tab

---

## 🎓 Best Practices

### During Development
```bash
# Always run local server
python3 -m http.server 8888

# Check console-checker.html after every change
# Fix errors immediately
```

### Before Deployment
```bash
# Run full check
open http://localhost:8888/console-checker.html

# Ensure:
# - 0 errors
# - No CSP violations  
# - All resources load
```

### In Production
```bash
# Keep console-checker.html available
# Use for emergency debugging
# Remove from public site if sensitive
```

---

## 🚨 Critical Checks

### Pre-deployment Checklist
- [ ] Page loads (not white/blank)
- [ ] No JavaScript errors
- [ ] All CSS loaded (styles applied)
- [ ] All fonts loaded (no fallbacks)
- [ ] All images displayed
- [ ] No CSP violations
- [ ] No 404s in Network tab
- [ ] Interactive features work

---

## 📞 Support

### Issue Fixed ✅
**Problem:** /trial/ page showing white  
**Cause:** CSP `upgrade-insecure-requests`  
**Solution:** Removed from CSP directive  
**Status:** Fixed and deployed

### Files Changed
- `/workspace/trial/index.html` - CSP fix
- `/workspace/trial/console-checker.html` - NEW tool

### Testing
```bash
cd /workspace/trial
python3 -m http.server 8888
# Open: http://localhost:8888/console-checker.html
```

---

*Tool created: 2025-11-08*  
*Issue resolved: CSP upgrade-insecure-requests removed*  
*Status: Production ready*
