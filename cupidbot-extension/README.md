# CupidBot AI — Installer-First Chrome Extension

The extension mirrors the premium finish of [cupidbot.org](https://cupidbot.org) while guiding operators through dependency installation from both the popup and an always-on floating widget.

## ✨ Experience Overview

- **Installer-first popup** – Leads with a dependency overview, one-click download, status feedback, and verification/testing shortcuts.
- **Background-managed downloads** – Uses the `chrome.downloads` API from the service worker so both popup and widget can trigger the installer.
- **Floating helper widget** – Docked bottom-right, offering a quick download button, install guide, and support links without leaving the page.
- **Diagnostic hooks** – Optional verification endpoint, troubleshooting, and release notes links are exposed in one click.

## 📦 Loading the Extension

1. Download this folder.
2. Open Chrome and visit `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `cupidbot-extension` directory.
6. Click the CupidBot action icon to launch the installer popup.

The floating widget appears automatically on any HTTPS page once the extension is active.

## 🧱 File Map

- `manifest.json` – Manifest V3 configuration (downloads + tabs permissions enabled)
- `background.js` – Handles installer downloads, deep-link navigation, and CTA logging
- `popup.html / popup.css / popup.js` – Installer experience, status management, and verification flow
- `content.js` – Injects the floating helper widget via Shadow DOM with download + help actions
- `assets/` – Chrome action icons

## 🔧 Configure Your URLs

Update the constants in these files to point at your real installer assets and documentation:

| File | Constant | Purpose |
|------|----------|---------|
| `background.js` | `INSTALLER_DOWNLOAD_URL` | HTTPS link to the packaged CupidBot installer (ZIP/EXE/PKG/etc.) |
| `background.js` | `INSTALL_GUIDE_URL`, `SUPPORT_URL`, `TROUBLESHOOT_URL`, `RELEASE_NOTES_URL` | Documentation opened from popup & widget |
| `popup.js` | `VERIFY_ENDPOINT` | Optional API endpoint to confirm installation success (expects JSON with `healthy`, `status: "ok"`, or `valid: true`) |

Leaving the defaults (example.com) will display friendly warnings so you know configuration is required.

## ✅ Verification Button

The popup’s **Verify setup** button performs a fetch to `VERIFY_ENDPOINT`. Return JSON such as:

```json
{ "healthy": true, "message": "All services ready" }
```

Any truthy `healthy`, `"status": "ok"`, or `valid: true` flag is treated as success. Non-200 responses or network failures surface a helpful error and point users toward troubleshooting.

## 🛠️ Development Notes

- The floating widget uses a Shadow DOM root to avoid CSS collisions with the host page.
- Runtime messaging is wrapped with defensive checks so missing APIs (e.g., Brave, Arc) degrade gracefully.
- All major actions log to the console (`chrome://extensions` → Inspect views) for quick debugging.

Once your URLs are configured, reload the unpacked extension, click **Download Installer**, and confirm the package lands in your Downloads folder. Run the installer, hit **Verify setup**, and CupidBot is ready to orchestrate conversations. Ongoing help, troubleshooting, and release notes are only one click away from either surface.
