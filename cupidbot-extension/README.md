# CupidBot AI — Installer-First Chrome Extension

The extension mirrors the premium finish of [cupidbot.org](https://cupidbot.org) while guiding operators through dependency installation from both the popup and an always-on floating widget.

## ✨ Experience Overview

- **Strata Console shell** – A glassmorphism-inspired frame with mission clock, operator profile, and vertical navigation that swaps between Overview, Automations, Assets, Channels, Compliance, and Settings.
- **Installer hero** – The Overview view anchors the experience with dependency copy, pulsating CTAs, checklist steps, and a status block that updates as users download, verify, or troubleshoot.
- **Mission telemetry & channel grid** – Live-style metrics, upcoming bursts, and six richly styled channel cards (Snapchat, Tinder, Bumble, Reddit, Discord, Badoo) showcase what the platform orchestrates after login.
- **Automation & Ops dashboards** – Timeline lanes, automation recipe cards, asset library tables, compliance ledger, and settings panes give the console depth while remaining purely front-end for now.
- **Floating helper widget** – A compact Strata-inspired assistant in the bottom-right corner that mirrors the new typography, gradients, and CTA language for on-page installs.
- **Background-managed downloads** – The service worker owns download + deep-link logic so both the console and the widget can trigger installer flows safely.

## 📦 Loading the Extension

1. Download this folder.
2. Open Chrome and visit `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `cupidbot-extension` directory.
6. Click the CupidBot action icon to launch the installer popup.

The floating widget appears automatically on any HTTPS page once the extension is active.

## 🧭 Navigation Map

| View | Purpose | Highlights |
| ---- | ------- | ---------- |
| **Overview** | Primary installer CTA + fleet snapshot | Hero copy, mission summary, channel grid, activity stream |
| **Automations** | Scheduling + orchestration board | 24-hour timeline lane, recurring vs ad-hoc recipes, quick actions |
| **Assets** | Persona assets & resource pools | Gallery teaser, domain inventory, SIM provider tables |
| **Channels** | Deep-dive control rooms | Platform-specific inputs, automations, proxy meshes, follow-up CTAs |
| **Compliance** | Safeguard status ledger | Policy versions, review dates, call-to-action links |
| **Settings** | Environment preferences | Timezone, alerts, density, integration credentials |

Navigation is handled in `popup.js` with simple state toggling—no framework required.

## 🧱 File Map

- `manifest.json` – Manifest V3 configuration (downloads + tabs permissions enabled)
- `background.js` – Handles installer downloads, deep-link navigation, and CTA logging
- `popup.html / popup.css / popup.js` – Strata Console shell covering hero, navigation, channel grid, dashboards, and installer verification
- `content.js` – Injects the floating helper widget via Shadow DOM with download + help actions
- `STRATA_DESIGN_NOTES.md` – Implementation blueprint detailing tokens, component taxonomy, and motion guidelines
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

## 🧪 Placeholder Data Spots

- **Channel metrics & labels** – Update the static numbers inside `popup.html` (`.sc-channel__metric`) to match your live fleet.
- **Automation timeline** – Adjust the inline `style="left:…;width:…"` percentages on `.sc-timeline__segment` to visualize your run cadence.
- **Assets & compliance tables** – Replace the sample rows within `.sc-table` blocks for domains, SIM providers, and policy reviews.
- **Activity stream** – Swap the `<div class="sc-activity__item">` entries for real burst telemetry or connect to an API later.
- **Widget copy** – Edit the template literal in `content.js` if you need different CTA text or installer instructions.

## 🛠️ Development Notes

- The floating widget uses a Shadow DOM root to avoid CSS collisions with the host page.
- Design tokens, fonts (`Space Grotesk`, `Manrope`, `JetBrains Mono`), and layout primitives live in `popup.css`.
- Runtime messaging is wrapped with defensive checks so missing APIs (e.g., Brave, Arc) degrade gracefully.
- All major actions log to the console (`chrome://extensions` → Inspect views) for quick debugging.

Once your URLs are configured, reload the unpacked extension, click **Download Installer**, and confirm the package lands in your Downloads folder. Run the installer, hit **Verify setup**, and CupidBot is ready to orchestrate conversations. Ongoing help, troubleshooting, and release notes are only one click away from either surface.
