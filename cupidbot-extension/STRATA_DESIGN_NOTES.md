# Strata Console Redesign – Implementation Blueprint

This document captures the structure, components, and styling guidelines for the “Strata Console” experience inside the CupidBot extension. It is the source of truth for subsequent UI work.

---

## 1. High-Level Architecture

| Surface | Purpose | Implementation Notes |
| --- | --- | --- |
| Popup (`popup.html`) | Primary console shell with navigation, dashboard, channel modules, and automation views | Built with vanilla HTML/CSS/JS. Uses custom component classes prefixed `sc-` |
| Floating widget (`content.js`) | Quick-access assistant for downloads, guides, and status | Injected via Shadow DOM. Uses same design tokens as popup |
| Background service worker (`background.js`) | Handles downloads, doc links, logging | Already instrumented for installer flow |
| Future options page (`options.html` TBD) | Room for advanced configuration if needed | Not in this iteration; keep architecture extensible |

---

## 2. Layout & Navigation

### Popup Structure
```
sc-shell
 ├─ sc-topbar
 ├─ sc-body
 │    ├─ sc-nav (vertical rail)
 │    └─ sc-main
 │         ├─ sc-section (overview hero)
 │         ├─ sc-section (channel grid)
 │         └─ sc-section (detail / subviews)
 └─ sc-status-bar (optional foot stats)
```

- `sc-nav` anchors the following primary tabs: `overview`, `automations`, `assets`, `channels`, `compliance`, `settings`.
- Each tab reveals a dedicated panel inside `sc-main`. Panels are separate `<section>` elements toggled via class `is-active`.

---

## 3. Design Tokens & Assets

### Colors
```css
--sc-bg-900: #0B0D10;
--sc-bg-800: #11141A;
--sc-bg-750: rgba(17, 20, 26, 0.85);
--sc-surface-1: rgba(21, 24, 31, 0.78);
--sc-surface-2: rgba(10, 12, 15, 0.65);
--sc-border-soft: rgba(255, 255, 255, 0.06);
--sc-border-strong: rgba(255, 255, 255, 0.12);

--sc-accent-iris: linear-gradient(135deg, #5E62F4 0%, #9C6BFF 100%);
--sc-accent-mint: linear-gradient(135deg, #4BD3C0 0%, #54E69A 100%);
--sc-accent-flare: linear-gradient(135deg, #FF8D6A 0%, #FF5DA8 100%);

--sc-text-strong: #FFFFFF;
--sc-text-soft: rgba(225, 229, 235, 0.78);
--sc-text-muted: rgba(190, 196, 205, 0.55);
--sc-success: #37D172;
--sc-warning: #FFB347;
--sc-danger: #FF5C73;
```

### Typography
- **Display**: Sequal Display (SemiBold, Bold) – uppercase headings
- **Body**: Söhne or GT America (Medium, Regular, Light)
- **Numeric/Code**: GT Flexa Mono (Regular)

Serve webfonts via `/fonts/` folder, referenced in CSS with `font-display: swap`.

### Shadows & Radii
```css
--sc-radius-lg: 26px;
--sc-radius-md: 18px;
--sc-radius-sm: 12px;

--sc-shadow-soft: 0 28px 64px rgba(8, 0, 14, 0.85);
--sc-shadow-control: 0 14px 28px rgba(12, 0, 22, 0.45);
```

---

## 4. Component Inventory

Component classes (`sc-` prefix) will be defined in `popup.css`.

1. **sc-card** – base panel with soft border, blur, radius.
2. **sc-pill** – rounded label chip for statuses.
3. **sc-button**, `--primary`, `--ghost`, `--icon`.
4. **sc-badge** – small uppercase tokens (e.g., status labels).
5. **sc-grid** – responsive grid container for channel modules.
6. **sc-channel** – specialized card for each platform; includes header, stats, actions, persona preview stack.
7. **sc-table** – minimal table layout for assets/compliance.
8. **sc-timeline** – horizontal automation timeline (flex + pseudo elements).
9. **sc-drawer** – slide in panel for wizards (hidden by default).
10. **sc-nav-item** – nav link with icon + label.

---

## 5. Channel Module Structure

Each channel module uses:
```
sc-channel (data-platform="tinder")
 ├─ sc-channel__header
 ├─ sc-channel__metrics
 ├─ sc-channel__actions
 └─ sc-channel__preview
```

Metrics displayed:
- Active Accounts
- Daily Throughput
- Queue Depth
- Last Batch Runtime

Action buttons:
- `New Burst`
- `Profiles`
- `Proxy Pool`
- Secondary quick links (toggle list or dropdown)

Platform-specific drawers will be invoked for workflows (e.g., `data-chart="proxy-map"`).

---

## 6. Views Breakdown

### Overview
- `sc-section` hero with `Fleet Health`, `Automation Timeline`, `Alerts`.
- Channel grid (Snapchat, Tinder, Bumble, Reddit, Discord, Badoo).
- Each channel tile uses accent gradient overlay (tinted to brand color).

### Automations
- `sc-kanban` style board: Scheduled / Running / Completed.
- Timeline view using `sc-timeline` (flex row with segments).

### Assets
- Photo library grid (masonry using CSS columns).
- Pools table (email, phone API, proxies) with `sc-table`.

### Compliance
- Checklist list with status pills (e.g., TOS accepted, MFA cadence).
- Download links / doc openers per platform.

### Settings
- Two-column form layout (general, notifications, integrations).
- Use `sc-form-field` for consistent spacing.

---

## 7. Floating Widget Design

Structure mirrored in `content.js`:
```
widget
 ├─ brand-row
 ├─ hero (copy + button-stack + status)
 ├─ feature-list
 └─ quick-links
```
Reuses color tokens, button variants (`cta-button`, `ghost-button`, `inline-link`).

Status classes: `status-ready`, `status-progress`, `status-success`, `status-error`.

---

## 8. Interaction Specs

- Button press: scale to 0.97, return to 1.0 over 120ms.
- Sections fade in via `fade-up` class (translateY 12px → 0, 200ms).
- Channel cards hover: elevate with `--sc-shadow-control`, slight accent border.
- Timeline segments animate width on mount.
- Wizard drawers slide from right (transform `translateX(460px)` to `0`).

---

## 9. Implementation Phases

1. **Token Layer** – fonts, variables, base classes.
2. **Shell + Navigation** – static layout with placeholder sections.
3. **Overview Content** – hero, metrics, channel grid.
4. **Drawer & Timeline Components** – Automations, assets.
5. **Widget Update** – sync styling and actions.
6. **Documentation** – keep README + this doc aligned.

---

Deliverables should maintain fidelity to this plan, ensuring the Chrome extension feels bespoke, visually rich, and functional without relying on default fonts or boilerplate layouts.
