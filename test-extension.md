# Chrome Extension Testing Plan

## Manual Testing Steps

### 1. Load Extension
```bash
1. Open Chrome
2. Go to chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select: /workspaces/Cupid-/cupidbot-extension
```

### 2. Test Loading Screen
- Extension icon should appear in toolbar
- Click extension icon
- Should see loading screen with progress bar
- Should complete and show key entry screen

### 3. Test Key Entry Screen
**Test Invalid Format:**
- Enter: "INVALID"
- Click "Activate Trial"
- Should show error: "Invalid trial key format"

**Test Valid Format (no server):**
- Enter: "CUPID-TEST-1234-5678-ABCD"
- Click "Activate Trial"
- Should attempt server validation
- Should fall back to format validation (server not deployed yet)
- Should show success screen
- Should auto-proceed to dashboard after 2 seconds

### 4. Test Dashboard
- Should show trial days remaining (30)
- Should show stats (0 messages, 0 conversions)
- Should show "AI is active and monitoring"
- Buttons should be clickable

### 5. Test State Persistence
- Close extension popup
- Reopen extension
- Should go directly to dashboard (skip loading and key entry)

## Automated Validation

### Code Validation
```bash
# Check for syntax errors
node -c cupidbot-extension/popup.js

# Check manifest validity
cat cupidbot-extension/manifest.json | jq .
```

### API Endpoint Validation
```bash
# Verify correct endpoint format
grep "ACTIVATION_SERVER_URL" cupidbot-extension/popup.js
grep "api/verify" cupidbot-extension/popup.js
```

## Expected Results

✅ No fake download screen
✅ Immediate activation after key entry
✅ Correct API endpoint format
✅ Proper error handling
✅ State persistence works
✅ Dashboard displays correctly

## Known Limitations (Until Deployment)

⚠️ Server validation will fail (activation server not deployed)
⚠️ Falls back to format validation only
⚠️ This is expected and acceptable for now

## Next Steps After Testing

1. Deploy activation server to Render
2. Update CONFIG.ACTIVATION_SERVER_URL
3. Test end-to-end with real server
4. Generate test activation keys
