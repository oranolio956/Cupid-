# CupidBot Trial Page

## 🎨 Premium Features

### Visual Design
- **Animated Particle Background**: Subtle purple particles floating across the page
- **Gradient Accents**: Matches exact purple (#b353d3) and red (#ad2c2c) colors
- **Dark Theme**: Deep black (#050009) background matching main site
- **Glassmorphism**: Frosted glass effect on key generation card

### Custom Animations
- **Pulsing Badge**: "Limited Time Offer" badge with glowing animation
- **Feature Pills**: Staggered fade-in animations on scroll
- **Button Ripple Effect**: Expanding circle on hover (premium feel)
- **Gradient Border**: Animated shifting gradient on key card
- **Scroll-Triggered**: Installation steps animate in as you scroll

### Interactive Elements
1. **Key Generation**:
   - Loading spinner during generation
   - Smooth slide-down reveal of the key
   - One-click copy with visual feedback
   - Format: `CUPID-XXXX-XXXX-XXXX-XXXX`

2. **Form Inputs**:
   - Glow effect on focus
   - Smooth transitions
   - Monospace font for technical feel

3. **Installation Steps**:
   - Numbered circles with gradient backgrounds
   - Slide-in animation on scroll
   - Clean, professional layout

## 📁 Files

- **trial.html** - Main trial page
- **cupidbot-extension/** - Chrome extension folder
  - manifest.json
  - popup.html / popup.js
  - background.js
  - content.js / content.css
  - icons/
  - README.md

## 🚀 How to View

### Option 1: Direct File
Simply open `trial.html` in your browser

### Option 2: Local Server
```bash
cd /workspaces/Cupid-
python3 -m http.server 8080
```
Then visit: `http://localhost:8080/trial.html`

### Option 3: Live Server (VS Code)
1. Right-click on `trial.html`
2. Select "Open with Live Server"

## 🎯 Design Matches Your Site

- **Fonts**: Roboto Mono + Syne (exact match)
- **Colors**: Your exact purple, red, and dark theme
- **Layout**: Uses your `.page-padding`, `.container-xxlarge` structure
- **Lines**: Horizontal dividers matching your style
- **Typography**: Same heading sizes and text styles

## 💎 Why This Screams Quality

1. **No Templates**: Everything is custom-built with your brand
2. **Smooth Animations**: 60fps animations using CSS transforms
3. **Interactive Particles**: Dynamic background that responds to the page
4. **Premium Micro-interactions**: Every hover, click, and scroll has polish
5. **Professional Typography**: Perfect spacing and hierarchy
6. **Glassmorphism**: Modern frosted glass effects
7. **Gradient Mastery**: Subtle, tasteful gradients throughout

## 🔧 Chrome Extension Installation

Users follow these steps:
1. Download the `cupidbot-extension` folder
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder
6. Enter trial key when prompted

## 📊 Features

- ✨ 24/7 AI Automation
- 🎯 Smart Targeting
- 📊 Real-time Analytics
- 🔒 Secure & Private
- 💬 Natural Conversations
- 📈 Conversion Optimization

## 🎨 Color Palette

- Primary Background: `#050009`
- Secondary Background: `#191919`
- Primary Purple: `#b353d3`
- Secondary Red: `#ad2c2c`
- Success Green: `#246426`
- Text Primary: `#ffffff`
- Text Secondary: `#c8c8c8`

## 📱 Responsive

Fully responsive design with breakpoints at:
- Desktop: > 991px
- Tablet: 768px - 991px
- Mobile: < 767px

## ⚡ Performance

- Lightweight particle system (50 particles)
- CSS transforms for GPU acceleration
- Optimized animations
- Lazy loading ready
- No heavy dependencies
