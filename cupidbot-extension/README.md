# CupidBot AI — On-Brand Chrome Extension

The extension has been rebuilt to mirror the styling, typography, and tone of [cupidbot.org](https://cupidbot.org) while introducing a floating call-to-action widget that rests in the bottom-right corner of every page.

## ✨ Experience Overview

- **1:1 Hero Styling**: The popup replicates the homepage hero with the same headline, copy, gradient accents, and trust badges.
- **Floating Widget**: A glassmorphism widget is injected into the page at the bottom-right corner, matching site colors and typography.
- **Single CTA**: Both the popup and widget present a `Connect To Login` button ready for future wiring.
- **Motion & Polish**: Animated gradient backgrounds, orbiting light orbs, interactive hover states, and tactile CTA press feedback keep the experience feeling handcrafted rather than templated.
- **Minimal Chrome Footprint**: No storage, analytics, or external dependencies beyond Google Fonts and the hero image already used on the site.

## 📦 Installation

1. Download this folder.
2. Open Chrome and visit `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `cupidbot-extension` directory.
6. Click the CupidBot extension icon to open the redesigned popup.

The floating widget appears automatically on any HTTPS page once the extension is loaded.

## 🧱 File Map

- `manifest.json` – extension configuration (Manifest V3)
- `background.js` – logs interactions with the CTA for now
- `popup.html` / `popup.css` / `popup.js` – the hero-aligned popup
- `content.js` – injects the floating widget via Shadow DOM
- `assets/` – icon set used for Chrome surfaces

## 🧩 Connect To Login CTA

The button is present in both surfaces and dispatches a runtime message (`connectToLoginClicked`). The background service worker logs the event and is ready for future logic once additional requirements arrive.

## 🛠️ Development Notes

- The floating widget uses a Shadow DOM host to avoid clashing with page-level CSS.
- Styling leans on gradients, glass panels, and uppercase microcopy to stay faithful to the live site.
- Fonts (`Syne` and `Roboto Mono`) are loaded from Google Fonts to match production.

Load the unpacked extension, verify the popup and on-page widget, and let the `Connect To Login` CTA idle until new instructions are provided.
