// Floating CupidBot widget content script
(function () {
    if (window.top !== window) {
        return;
    }

    if (window.__CupidBotWidgetBootstrapped) {
        return;
    }
    window.__CupidBotWidgetBootstrapped = true;

    const HOST_ID = 'cupidbot-floating-widget';
    let widgetHost = null;
    let hostObserver = null;

    const injectWidget = () => {
        if (widgetHost && document.body.contains(widgetHost)) {
            return widgetHost;
        }

        if (widgetHost && widgetHost.remove) {
            widgetHost.remove();
        }

        const host = document.createElement('div');
        host.id = HOST_ID;
        host.style.position = 'fixed';
        host.style.bottom = '24px';
        host.style.right = '24px';
        host.style.zIndex = '2147483647';
        host.style.maxWidth = '320px';
        host.style.width = '320px';
        host.style.fontFamily = "'Manrope', sans-serif";
        host.style.pointerEvents = 'none';

        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

            :host {
                all: initial;
                font-family: 'Manrope', sans-serif;
                color: #fff;
                display: block;
                pointer-events: none;
            }

            .widget {
                position: relative;
                background:
                    radial-gradient(circle at 14% -10%, rgba(94, 98, 244, 0.32), transparent 60%),
                    radial-gradient(circle at 92% 120%, rgba(255, 93, 168, 0.28), transparent 68%),
                    rgba(12, 14, 20, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                padding: 1.55rem;
                box-shadow: 0 24px 58px rgba(8, 0, 14, 0.75);
                display: flex;
                flex-direction: column;
                gap: 1.2rem;
                overflow: hidden;
                isolation: isolate;
                animation: widgetEnter 0.75s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                pointer-events: auto;
            }

            .widget::before,
            .widget::after {
                content: "";
                position: absolute;
                width: 160px;
                height: 160px;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.55;
                z-index: -1;
                animation: glowDrift 14s ease-in-out infinite;
            }

            .widget::before {
                top: -110px;
                left: -70px;
                background: rgba(94, 98, 244, 0.65);
            }

            .widget::after {
                bottom: -110px;
                right: -60px;
                background: rgba(255, 93, 168, 0.6);
                animation-delay: -7s;
            }

            .brand-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.74rem;
                text-transform: uppercase;
                letter-spacing: 0.18em;
            }

            .brand-name {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-weight: 600;
                font-family: 'Space Grotesk', sans-serif;
                letter-spacing: 0.18em;
            }

            .brand-accent {
                background: linear-gradient(135deg, #5E62F4 0%, #9C6BFF 45%, #FF5DA8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .indicator {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-size: 0.64rem;
                color: rgba(225, 229, 235, 0.76);
            }

            .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #37D172;
                animation: pulse 2.6s ease-in-out infinite;
                box-shadow: 0 0 12px rgba(55, 209, 114, 0.75);
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0.75); opacity: 0.6; }
            }

            .hero {
                display: flex;
                flex-direction: column;
                gap: 0.68rem;
            }

            .hero-eyebrow {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.64rem;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                color: rgba(199, 205, 214, 0.65);
            }

            .hero-title {
                font-family: 'Space Grotesk', sans-serif;
                font-size: 1.68rem;
                line-height: 1.08;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }

            .hero-copy {
                font-size: 0.84rem;
                line-height: 1.55;
                color: rgba(225, 229, 235, 0.82);
            }

            .button-stack {
                display: flex;
                gap: 0.6rem;
                flex-wrap: wrap;
            }

            .cta-button {
                position: relative;
                padding: 0.72rem 1.4rem;
                border-radius: 999px;
                border: none;
                background: linear-gradient(135deg, #5E62F4 0%, #FF5DA8 100%);
                background-size: 200% 200%;
                color: #fff;
                font-size: 0.78rem;
                font-family: 'JetBrains Mono', monospace;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                cursor: pointer;
                box-shadow: 0 18px 32px rgba(94, 98, 244, 0.45);
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                animation: gradientShift 12s ease infinite;
            }

            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 24px 44px rgba(94, 98, 244, 0.58);
            }

            .cta-button.is-pressed {
                transform: translateY(1px);
                box-shadow: 0 16px 24px rgba(94, 98, 244, 0.35);
            }

            .ghost-button {
                padding: 0.68rem 1.35rem;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(18, 21, 32, 0.65);
                color: rgba(225, 229, 235, 0.82);
                font-size: 0.74rem;
                font-family: 'JetBrains Mono', monospace;
                letter-spacing: 0.16em;
                text-transform: uppercase;
                cursor: pointer;
                transition: border-color 0.2s ease, background 0.2s ease;
            }

            .ghost-button:hover {
                border-color: rgba(153, 143, 255, 0.55);
                background: rgba(26, 29, 42, 0.72);
            }

            .download-status {
                margin-top: 0.75rem;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.08em;
                color: rgba(215, 215, 215, 0.8);
            }

            .download-status.status-success {
                color: #37D172;
            }

            .download-status.status-error {
                color: #FF5C73;
            }

            .download-status.status-progress {
                color: rgba(153, 143, 255, 0.9);
            }

            .feature-list {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.6rem;
            }

            .feature {
                display: flex;
                align-items: center;
                gap: 0.55rem;
                padding: 0.55rem 0.75rem;
                border-radius: 14px;
                background: rgba(19, 22, 32, 0.78);
                border: 1px solid rgba(255, 255, 255, 0.06);
                font-size: 0.7rem;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: rgba(225, 229, 235, 0.72);
                font-family: 'JetBrains Mono', monospace;
            }

            .feature-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #5E62F4, #9C6BFF);
                font-size: 0.72rem;
                font-weight: 600;
            }

            .quick-links {
                display: flex;
                gap: 0.5rem;
                justify-content: space-between;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.66rem;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                color: rgba(225, 229, 235, 0.55);
            }

            .inline-link {
                background: none;
                border: none;
                color: rgba(199, 161, 255, 0.88);
                cursor: pointer;
                padding: 0;
                position: relative;
            }

            .inline-link::after {
                content: "";
                position: absolute;
                left: 0;
                bottom: -2px;
                width: 100%;
                height: 1px;
                background: currentColor;
                opacity: 0.3;
                transition: opacity 0.2s ease;
            }

            .inline-link:hover::after {
                opacity: 1;
            }

            @keyframes widgetEnter {
                from {
                    opacity: 0;
                    transform: translateY(16px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes glowDrift {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(16px, -16px) scale(1.06); }
            }

            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @media (prefers-reduced-motion: reduce) {
                *,
                *::before,
                *::after {
                    animation: none !important;
                    transition: none !important;
                }
            }

            @media (max-width: 600px) {
                :host {
                    font-size: 14px;
                }
            }
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'widget';
        wrapper.setAttribute('role', 'complementary');
        wrapper.setAttribute('aria-label', 'CupidBot assistant panel');
        wrapper.innerHTML = `
            <div class="brand-row">
                <div class="brand-name"><span class="brand-accent">CupidBot</span>.org</div>
                <div class="indicator">
                    <span class="indicator-dot"></span>
                    Ready
                </div>
            </div>
            <div class="hero">
                <span class="hero-eyebrow">Dependency setup</span>
                <div class="hero-title">Install CupidBot</div>
                <div class="hero-copy">
                    Download the installer to configure CupidBot services on this device. Run it with administrator
                    permissions once the download completes.
                </div>
                <div class="button-stack">
                    <button id="widgetDownloadBtn" class="cta-button" type="button" aria-label="Download CupidBot installer">Download Installer</button>
                    <button id="widgetGuideBtn" class="ghost-button" type="button" aria-label="Open CupidBot install guide">Install Guide</button>
                </div>
                <div class="download-status status-ready" id="widgetStatus">Ready to download the latest installer package.</div>
            </div>
            <div class="feature-list">
                <div class="feature">
                    <span class="feature-icon">①</span>
                    Download the CupidBot installer
                </div>
                <div class="feature">
                    <span class="feature-icon">②</span>
                    Run with administrator privileges
                </div>
                <div class="feature">
                    <span class="feature-icon">③</span>
                    Verify setup from the extension popup
                </div>
            </div>
            <div class="quick-links">
                <button id="widgetSupportBtn" class="inline-link" type="button">Support</button>
                <button id="widgetTroubleshootBtn" class="inline-link" type="button">Troubleshooting</button>
            </div>
        `;

        shadow.append(style, wrapper);
        document.body.appendChild(host);

        widgetHost = host;

        const downloadButton = shadow.getElementById('widgetDownloadBtn');
        const guideButton = shadow.getElementById('widgetGuideBtn');
        const supportButton = shadow.getElementById('widgetSupportBtn');
        const troubleshootButton = shadow.getElementById('widgetTroubleshootBtn');
        const statusLabel = shadow.getElementById('widgetStatus');

        if (downloadButton) {
            const tap = () => {
                downloadButton.classList.add('is-pressed');
                setTimeout(() => downloadButton.classList.remove('is-pressed'), 200);
            };

            downloadButton.addEventListener('click', async () => {
                tap();
                setWidgetStatus('progress', 'Preparing the CupidBot installer download…');
                const response = await sendRuntimeMessage('startInstallerDownload', { source: 'floating-widget' });

                if (response?.success) {
                    setWidgetStatus('success', 'Installer saved to your downloads folder. Run it to finish setup.');
                } else {
                    const message = response?.message || 'Unable to start download. Use the install guide for manual steps.';
                    setWidgetStatus('error', message);
                }
            });
        }

        if (guideButton) {
            guideButton.addEventListener('click', () => {
                sendRuntimeMessage('openInstallGuide');
                setWidgetStatus('ready', 'Opening the install guide in a new tab…');
            });
        }

        if (supportButton) {
            supportButton.addEventListener('click', () => {
                sendRuntimeMessage('openSupport');
                setWidgetStatus('ready', 'Support opened. We are here to help.');
            });
        }

        if (troubleshootButton) {
            troubleshootButton.addEventListener('click', () => {
                sendRuntimeMessage('openTroubleshooting');
                setWidgetStatus('ready', 'Launching troubleshooting steps in a new tab…');
            });
        }

        function setWidgetStatus(state, message) {
            if (!statusLabel) {
                return;
            }

            statusLabel.classList.remove('status-ready', 'status-progress', 'status-success', 'status-error');

            const toneClass = {
                ready: 'status-ready',
                progress: 'status-progress',
                success: 'status-success',
                error: 'status-error'
            }[state] || 'status-ready';

            statusLabel.classList.add(toneClass);
            statusLabel.textContent = message;
        }

        function sendRuntimeMessage(action, payload = {}) {
            return new Promise((resolve) => {
                const canMessage = typeof chrome !== 'undefined'
                    && chrome?.runtime
                    && typeof chrome.runtime.sendMessage === 'function';

                if (!canMessage) {
                    resolve({
                        success: false,
                        message: 'Runtime messaging unavailable in this browser.'
                    });
                    return;
                }

                chrome.runtime.sendMessage(
                    { action, ...payload },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            resolve({
                                success: false,
                                message: chrome.runtime.lastError.message || 'chrome.runtime messaging error'
                            });
                        } else {
                            resolve(response || { success: true });
                        }
                    }
                );
            });
        }

        return host;
    };

    const monitorWidget = () => {
        if (!document.body) {
            return;
        }

        if (hostObserver) {
            hostObserver.disconnect();
        }

        hostObserver = new MutationObserver(() => {
            if (widgetHost && !document.body.contains(widgetHost)) {
                injectWidget();
            }
        });

        hostObserver.observe(document.body, { childList: true, subtree: true });
    };

    const bootstrap = () => {
        if (!document.body) {
            requestAnimationFrame(bootstrap);
            return;
        }

        injectWidget();
        monitorWidget();
    };

    window.addEventListener('beforeunload', () => {
        if (hostObserver) {
            hostObserver.disconnect();
        }
        widgetHost = null;
    });

    bootstrap();
})();
