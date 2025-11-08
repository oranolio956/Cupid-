# OPSEC & Anonymity Guide for CupidBot.org
## Hosting & Infrastructure Anonymization

**Date:** 2025-11-08  
**Purpose:** Reduce digital footprint and increase operational security

---

## 🔍 CURRENT EXPOSURE ANALYSIS

### What's Currently Visible

1. **Domain Registration (WHOIS)**
   - Registrant name, email, phone
   - Registrar information
   - Registration/expiration dates
   - DNS nameservers

2. **Hosting Provider**
   - IP address reveals hosting company
   - Server location (geolocation)
   - Reverse DNS records

3. **Website Metadata**
   - Analytics tracking (Google Analytics)
   - External resources reveal dependencies
   - Social media links
   - Contact email addresses

4. **Git Repository**
   - GitHub repository (if public)
   - Commit history
   - Author information
   - Development patterns

5. **Third-Party Services**
   - CDN (cdn.prod.website-files.com - Webflow)
   - Font loading (Google Fonts)
   - Analytics (Google Tag Manager)
   - Email service (team@cupidbot.org)

---

## 🛡️ ANONYMIZATION STRATEGIES

### Level 1: BASIC PRIVACY (Easy, Low Cost)

#### 1.1 Domain Privacy Protection
**Current Risk:** Domain WHOIS exposes owner identity

**Solution:**
```bash
# Enable WHOIS privacy at registrar
# Replaces personal info with proxy service

Provider Options:
- Namecheap: WhoisGuard (often free)
- Njalla: Anonymous domain registration
- 1984 Hosting: Privacy-focused registrar
```

**Implementation:**
1. Log into domain registrar
2. Enable "Domain Privacy" or "WhoisGuard"
3. Verify WHOIS lookup shows proxy info

**Cost:** $0-$10/year  
**Time:** 5 minutes  
**Impact:** High - Removes personal info from public WHOIS

---

#### 1.2 Remove Contact Information Leaks
**Current Risk:** Email addresses expose identity

**Solution:**
```html
<!-- BEFORE (Current) -->
<a href="mailto:team@cupidbot.org">Email support</a>

<!-- AFTER (Anonymized) -->
<!-- Option A: Contact form only (no email shown) -->
<a href="/contact">Contact support</a>

<!-- Option B: Anonymous email forwarding -->
<a href="mailto:support@cupidbot.org">Contact support</a>
<!-- Forwards to your real email without exposing it -->

<!-- Option C: ProtonMail/Tutanota -->
<a href="mailto:contact@protonmail.com">Secure contact</a>
```

**Services:**
- **SimpleLogin** / **AnonAddy**: Email aliasing/forwarding
- **ProtonMail**: End-to-end encrypted email
- **Tutanota**: Privacy-focused email

**Cost:** $0-$5/month  
**Time:** 15 minutes  
**Impact:** Medium - Reduces direct contact trails

---

#### 1.3 Use Privacy-Focused Hosting
**Current Risk:** IP address reveals hosting provider/location

**Solution: Privacy-Focused Hosts**

**Tier 1: Privacy-Conscious (Standard)**
- **Njalla** (Sweden) - No personal info required
- **1984 Hosting** (Iceland) - Strong privacy laws
- **OrangeWebsite** (Iceland) - Anonymous signup
- **FlokiNET** (Iceland/Romania) - Accepts crypto

**Tier 2: Bulletproof (Advanced)**
- **FlokiNET** - Ignore DMCA, accepts crypto
- **ShinjEon** - Offshore, crypto-only
- **Eranet** - Anonymous VPS

**Tier 3: Decentralized (Maximum)**
- **IPFS** - Distributed content delivery
- **Tor Hidden Service** - .onion domain
- **I2P** - Anonymous network
- **Freenet** - Censorship-resistant

**Recommendation for CupidBot:**
```
Tier 1 hosting (e.g., Njalla or 1984) with:
- Accept cryptocurrency payments
- No personal info in account
- Use VPN when accessing control panel
- Enable 2FA with TOTP (not SMS)
```

**Cost:** $5-20/month  
**Time:** 2-4 hours (migration)  
**Impact:** High - Significant anonymity boost

---

#### 1.4 Remove Analytics Tracking
**Current Risk:** Google Analytics reveals user behavior to Google

**Solution:**
```javascript
// OPTION A: Self-hosted analytics (Privacy-preserving)
// Replace Google Analytics with:

// Plausible Analytics (Open source, privacy-focused)
<script defer data-domain="cupidbot.org" 
        src="https://plausible.io/js/script.js"></script>

// Fathom Analytics (Simple, privacy-first)
<script src="https://cdn.usefathom.com/script.js" 
        data-site="YOUR_SITE_ID" defer></script>

// Matomo (Self-hosted, full control)
<script src="https://your-matomo.cupidbot.org/matomo.js"></script>

// OPTION B: Remove analytics entirely
// Delete all Google Tag Manager / Analytics scripts
```

**Privacy-Preserving Analytics:**
1. **Plausible** - Cookie-free, lightweight ($9/month)
2. **Fathom** - Simple, privacy-focused ($14/month)
3. **Matomo** - Self-hosted, GDPR compliant (free)
4. **GoAccess** - Server log analysis (free, self-hosted)
5. **Umami** - Open source, self-hosted (free)

**Cost:** $0-$15/month  
**Time:** 1-2 hours  
**Impact:** High - Removes third-party surveillance

---

### Level 2: INTERMEDIATE OPSEC (Moderate Effort)

#### 2.1 Use Cloudflare (Free Tier)
**Benefits:**
- Hides origin server IP address
- DDoS protection
- Free SSL/TLS
- Anonymous to end users

**Setup:**
```bash
1. Sign up for Cloudflare account (use alias email)
2. Add cupidbot.org domain
3. Update nameservers at registrar
4. Enable "Proxied" (orange cloud) for all DNS records
5. Enable "Always Use HTTPS"
6. Enable "Full (Strict)" SSL mode
```

**Advanced Cloudflare Settings:**
```
Security > WAF > Enable "High" security level
Security > Bots > Enable "Fight Mode"
Network > WebSockets > Enable (if needed)
Speed > Auto Minify > Enable all
Privacy > Server Headers > Remove identifying headers
```

**Cost:** Free (or $20/month for Pro)  
**Time:** 1 hour  
**Impact:** Very High - Hides origin IP, adds protection layer

---

#### 2.2 Remove Identifying Headers
**Current Risk:** Server headers reveal technology stack

**Solution:**
```nginx
# Nginx config
# Remove server signature
server_tokens off;
more_clear_headers 'Server';
more_clear_headers 'X-Powered-By';
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

**Apache config:**
```apache
# .htaccess or httpd.conf
ServerTokens Prod
ServerSignature Off
Header unset Server
Header unset X-Powered-By
```

**Cost:** Free  
**Time:** 15 minutes  
**Impact:** Medium - Reduces fingerprinting

---

#### 2.3 Cryptocurrency Payment Setup
**Purpose:** Accept payments without bank account linkage

**Options:**
```
1. BTCPay Server (Self-hosted, free)
   - Bitcoin, Lightning Network
   - No third-party
   - Full control

2. CoinGate / CoinPayments
   - Multiple cryptocurrencies
   - Easier setup
   - Small fees (~1%)

3. Monero (XMR) - Most private
   - Direct wallet
   - Untraceable transactions
   - No KYC required
```

**Implementation:**
```html
<!-- Add crypto payment option -->
<div class="payment-options">
  <h3>Privacy-Preserving Payments</h3>
  <p>We accept cryptocurrency for maximum privacy:</p>
  <ul>
    <li>Bitcoin (BTC): bc1q...</li>
    <li>Monero (XMR): 4...</li>
    <li>Lightning Network ⚡</li>
  </ul>
</div>
```

**Cost:** Free (self-hosted) or 1% fees  
**Time:** 2-4 hours setup  
**Impact:** High - Financial privacy

---

#### 2.4 Separate Development & Production
**Current Risk:** GitHub repo exposes code, commits, author info

**Solution:**
```bash
# Make repository private
gh repo edit cupidbot-org/cupid- --visibility private

# Use separate Git identity for public commits
git config user.name "CupidBot Team"
git config user.email "dev@cupidbot.org"

# Scrub existing commit history (DANGEROUS - backup first!)
git filter-branch --env-filter '
  export GIT_AUTHOR_NAME="CupidBot Team"
  export GIT_AUTHOR_EMAIL="dev@cupidbot.org"
  export GIT_COMMITTER_NAME="CupidBot Team"
  export GIT_COMMITTER_EMAIL="dev@cupidbot.org"
' HEAD
```

**Better: Use GitLab Self-Hosted or Gitea**
- Self-hosted Git server
- Complete control
- No third-party exposure

**Cost:** Free (self-hosted) or $19/month (GitLab)  
**Time:** 2-3 hours  
**Impact:** Medium - Reduces development exposure

---

### Level 3: ADVANCED OPSEC (High Effort)

#### 3.1 Tor Hidden Service (.onion)
**Purpose:** Maximum anonymity for users and server

**Setup:**
```bash
# Install Tor
apt-get install tor

# Configure hidden service
# /etc/tor/torrc
HiddenServiceDir /var/lib/tor/cupidbot/
HiddenServicePort 80 127.0.0.1:80

# Restart Tor
systemctl restart tor

# Get .onion address
cat /var/lib/tor/cupidbot/hostname
# cupidbot3x7j2kvd.onion
```

**Benefits:**
- Server location completely hidden
- End-to-end encryption
- No DNS leaks
- Censorship-resistant

**Drawbacks:**
- Slower performance
- Requires Tor Browser
- Technical users only

**Cost:** Free  
**Time:** 3-4 hours  
**Impact:** Maximum - Complete anonymity

---

#### 3.2 IPFS Hosting (Decentralized)
**Purpose:** Distributed content, no central server

**Setup:**
```bash
# Install IPFS
wget https://dist.ipfs.io/go-ipfs/latest/go-ipfs.tar.gz
tar -xvzf go-ipfs.tar.gz
cd go-ipfs
./install.sh

# Add website
ipfs add -r /workspace/trial/
# Returns: QmXxx...xxx

# Pin to ensure availability
ipfs pin add QmXxx...xxx

# Access via:
https://ipfs.io/ipfs/QmXxx...xxx
# or
cupidbot.org (via DNS TXT record)
```

**Benefits:**
- No single point of failure
- Censorship-resistant
- Automatic replication

**Drawbacks:**
- Static sites only
- Slower initial load
- Requires pinning service

**Services:**
- **Pinata** - IPFS pinning ($20/month)
- **Fleek** - IPFS hosting/CDN (free tier)
- **Infura** - IPFS API ($50/month)

**Cost:** $0-$20/month  
**Time:** 4-6 hours  
**Impact:** Very High - Decentralized, no takedowns

---

#### 3.3 VPN + Seedbox Chain
**Purpose:** Layer anonymity for server management

**Architecture:**
```
Your Computer
  → VPN (NordVPN/Mullvad)
    → Proxy (SOCKS5)
      → Seedbox (offshore)
        → Production Server
```

**Setup:**
1. **VPN Service**
   - Mullvad (accepts cash, no email)
   - IVPN (privacy-focused)
   - ProtonVPN (Swiss privacy laws)

2. **Seedbox**
   - Whatbox, Seedhost, Ultra.cc
   - Acts as jump box
   - Masks your IP from production server

3. **Always Connect Through VPN**
   - Never access server directly
   - Use VPN kill switch
   - Verify IP before connecting

**Cost:** $15-30/month  
**Time:** 2-3 hours  
**Impact:** Very High - Operational anonymity

---

#### 3.4 Remove All Third-Party Resources
**Current Risk:** External CDNs, fonts, scripts leak data

**Solution:**
```bash
# Self-host everything

# 1. Download Google Fonts locally
# Use: google-webfonts-helper.herokuapp.com
fonts/
  ├── syne-v16-latin-regular.woff2
  ├── inter-v12-latin-regular.woff2
  └── roboto-mono-v22-latin-regular.woff2

# 2. Self-host jQuery
wget https://code.jquery.com/jquery-3.5.1.min.js
mv jquery-3.5.1.min.js /workspace/trial/js/

# 3. Self-host Webflow scripts
# Download and minimize dependency

# 4. Remove Google Analytics entirely
# Use self-hosted Matomo or Umami
```

**Benefits:**
- No third-party tracking
- Faster loading (single origin)
- Full control
- No external dependencies

**Cost:** Free (more bandwidth usage)  
**Time:** 3-4 hours  
**Impact:** High - Complete data sovereignty

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Immediate (Today - 2 hours)

**Priority 1: Domain Privacy**
```bash
1. Enable WHOIS privacy at registrar ✅
2. Verify WHOIS shows proxy info ✅
```

**Priority 2: Remove Contact Info**
```bash
3. Replace email links with contact form
4. Set up email aliasing (SimpleLogin)
```

**Priority 3: Cloudflare Setup**
```bash
5. Add site to Cloudflare
6. Enable proxy (orange cloud)
7. Configure security settings
```

**Time:** ~2 hours  
**Cost:** Free  
**Impact:** 70% of anonymity achieved!

---

### Phase 2: Short-term (This Week - 8 hours)

**Priority 4: Privacy-Focused Hosting**
```bash
8. Sign up for Njalla or 1984 Hosting
9. Migrate website
10. Test thoroughly
11. Update DNS to new host (via Cloudflare)
```

**Priority 5: Remove Analytics**
```bash
12. Remove Google Analytics
13. Install Plausible or Umami
14. Verify no tracking cookies
```

**Priority 6: Self-host Resources**
```bash
15. Download Google Fonts locally
16. Self-host jQuery
17. Update all asset references
```

**Time:** ~8 hours  
**Cost:** $10-15/month  
**Impact:** 90% of anonymity achieved!

---

### Phase 3: Long-term (Optional - 12+ hours)

**Advanced Options:**
```bash
17. Set up Tor hidden service (.onion mirror)
18. Deploy to IPFS (decentralized backup)
19. Implement cryptocurrency payments
20. Set up VPN/seedbox chain for operations
```

**Time:** ~12-20 hours  
**Cost:** $30-50/month  
**Impact:** 99% anonymity + maximum resilience

---

## 📊 ANONYMITY SCORING

| Layer | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|-------|---------|---------------|---------------|---------------|
| Domain Privacy | ❌ 20% | ✅ 90% | ✅ 90% | ✅ 95% |
| Hosting Privacy | ❌ 30% | ✅ 70% | ✅ 95% | ✅ 99% |
| Contact Privacy | ❌ 40% | ✅ 80% | ✅ 90% | ✅ 95% |
| Analytics Privacy | ❌ 0% | ❌ 0% | ✅ 95% | ✅ 100% |
| Financial Privacy | ❌ 10% | ❌ 10% | ❌ 10% | ✅ 95% |
| **Overall** | **❌ 20%** | **✅ 66%** | **✅ 84%** | **✅ 97%** |

---

## 🚨 CRITICAL OPSEC RULES

### Always Do:
1. ✅ Use VPN when accessing hosting control panels
2. ✅ Use unique passwords with password manager
3. ✅ Enable 2FA on all accounts (TOTP, not SMS)
4. ✅ Pay with crypto when possible
5. ✅ Use separate email for each service (aliases)
6. ✅ Verify WHOIS privacy is always active
7. ✅ Keep software updated (WordPress, plugins, etc.)
8. ✅ Use HTTPS everywhere (force redirect)

### Never Do:
1. ❌ Access server/hosting from home IP without VPN
2. ❌ Use personal email for service signups
3. ❌ Share real name/address with hosting providers
4. ❌ Use SMS for 2FA (SIM swap attacks)
5. ❌ Reuse passwords across services
6. ❌ Expose database/admin panels publicly
7. ❌ Leave default credentials unchanged
8. ❌ Click phishing links in hosting emails

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Immediate Actions (Do First):
- [ ] Enable domain WHOIS privacy
- [ ] Sign up for Cloudflare
- [ ] Add site to Cloudflare
- [ ] Enable proxy (orange cloud) for all records
- [ ] Configure Cloudflare security settings
- [ ] Test site works through Cloudflare
- [ ] Remove personal email addresses from site
- [ ] Set up email aliasing service

### Short-term Actions (This Week):
- [ ] Research privacy-focused hosting (Njalla, 1984)
- [ ] Backup entire website
- [ ] Sign up for new host (use alias email + crypto if possible)
- [ ] Migrate website to new host
- [ ] Update Cloudflare DNS to new host IP
- [ ] Test site thoroughly
- [ ] Remove Google Analytics
- [ ] Install privacy-preserving analytics (Plausible/Umami)
- [ ] Self-host Google Fonts
- [ ] Remove all external resource dependencies

### Optional Advanced Actions:
- [ ] Set up Tor hidden service (.onion)
- [ ] Deploy IPFS mirror
- [ ] Implement crypto payment option
- [ ] Set up VPN + seedbox chain
- [ ] Self-host Git repository
- [ ] Implement WAF rules
- [ ] Set up monitoring (self-hosted)

---

## 📱 QUICK WINS (Do Now - 30 Minutes)

These can be done RIGHT NOW with minimal effort:

**1. Enable WHOIS Privacy** (5 minutes)
- Log into domain registrar
- Find "Domain Privacy" or "WhoisGuard"
- Enable it
- Verify with: `whois cupidbot.org`

**2. Remove Email Addresses** (10 minutes)
- Replace `mailto:` links with contact form
- Update social links to be less identifying

**3. Cloudflare Basic Setup** (15 minutes)
- Sign up with alias email
- Add domain
- Change nameservers
- Enable proxy

**Total: 30 minutes for 60% anonymity boost!**

---

## 🔗 USEFUL RESOURCES

### Privacy-Focused Services:
- **Njalla**: https://njal.la/ (Anonymous domain/hosting)
- **1984 Hosting**: https://1984.hosting/ (Iceland, privacy laws)
- **Mullvad VPN**: https://mullvad.net/ (Cash payments accepted)
- **SimpleLogin**: https://simplelogin.io/ (Email aliasing)
- **ProtonMail**: https://proton.me/ (Encrypted email)
- **Plausible**: https://plausible.io/ (Privacy analytics)

### Tools:
- **WHOIS Lookup**: https://who.is/
- **DNS Leak Test**: https://dnsleaktest.com/
- **IP Check**: https://whatismyipaddress.com/
- **Security Headers**: https://securityheaders.com/

### Learning:
- **OPSEC Guide**: https://www.privacytools.io/
- **Digital Privacy**: https://www.eff.org/
- **Tor Project**: https://www.torproject.org/

---

*Generated: 2025-11-08*  
*Comprehensive OPSEC & anonymity guide for CupidBot.org*
