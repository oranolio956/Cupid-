# CupidBot Installer Configuration Guide

This document explains how to wire the extension to real installer assets, what each endpoint does, and the expected responses so both the popup and floating widget behave correctly in production.

## 1. Required URLs

Edit `cupidbot-extension/background.js` to replace the placeholder values:

| Constant | Purpose | Example |
| --- | --- | --- |
| `INSTALLER_DOWNLOAD_URL` | Direct HTTPS link to the packaged installer (ZIP, PKG, EXE, shell script, etc.). The file should be signed/notarised if applicable. | `https://downloads.cupidbot.org/releases/cupidbot-installer-1.4.2.pkg` |
| `INSTALLER_FILENAME` | Suggested filename when the browser saves the installer. Include extension. | `cupidbot-installer-1.4.2.pkg` |
| `INSTALL_GUIDE_URL` | Step-by-step instructions. Usually a public docs page. | `https://docs.cupidbot.org/install/guide` |
| `SUPPORT_URL` | Contact/support portal for manual assistance. | `https://cupidbot.org/support` |
| `TROUBLESHOOT_URL` | Troubleshooting flow for failed installs. | `https://docs.cupidbot.org/install/troubleshoot` |
| `RELEASE_NOTES_URL` | Latest release notes/changelog. | `https://docs.cupidbot.org/releases` |

### Hosting Notes
- The installer URL must be accessible over HTTPS.
- Set the correct `Content-Type` and enable CORS if the file is distributed from object storage (S3, GCS, etc.).
- If you need controlled access, generate signed URLs server-side and return them through your activation API instead of hardcoding the link. Update the service worker accordingly.

## 2. Verification Endpoint

`popup.js` sends a GET request to `VERIFY_ENDPOINT` when the user clicks **Verify setup**. Replace the placeholder domain with your verification API (HTTPS recommended).

```javascript
const VERIFY_ENDPOINT = 'https://status.cupidbot.org/api/v1/installer/verify';
```

### Expected Response
- The popup treats any JSON with `healthy: true`, `status: "ok"`, or `valid: true` as a success.
- Include a human-friendly `message` explaining the current state (success or failure). The UI displays this value.
- Non-200 responses or invalid JSON trigger an error banner with a fallback message.

#### Successful Example
```json
{
  "healthy": true,
  "message": "CupidBot services are running and credentials loaded."
}
```

#### Failed Example
```json
{
  "healthy": false,
  "message": "Installer not detected. Re-run the CupidBot installer and try again."
}
```

### Backend Checklist
- The endpoint should authenticate requests if you need to tie verification to a customer account. Add any required auth headers in `popup.js`.
- Rate-limit as needed; the popup makes manual requests (no polling).
- If you do not have a verification service, leave the placeholder value. The UI warns operators that verification is not yet available.

## 3. Optional Enhancements

- **Checksum Validation**: expose `sha256` or similar from your API and show it in the popup to help users verify downloads.
- **Version Awareness**: serve the latest version/URL from an activation endpoint so you can rotate installers without shipping a new extension.
- **Native Messaging**: if you need to trigger local scripts automatically after download, use Chrome Native Messaging. The current design intentionally avoids auto-running installers for safety.

## 4. Deployment Steps Summary

1. Upload the latest CupidBot installer to your distribution CDN and record its URL.
2. Update the constants in `background.js` with the installer URL, filenames, and documentation links.
3. Replace `VERIFY_ENDPOINT` in `popup.js` with your verification API.
4. Reload the unpacked extension in Chrome:
   - Click **Download Installer** and confirm the package saves with the correct name.
   - Run the installer, then click **Verify setup** to ensure the new endpoint responds as expected.
5. Publish the extension update (zip + upload to the Chrome Web Store or deliver the unpacked directory internally).

With these steps complete, the installer workflow stays fully branded, the widget provides quick access to help links, and operators have a clear verification path.
