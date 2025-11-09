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
        host.style.fontFamily = "'Syne', sans-serif";
        host.style.pointerEvents = 'none';

        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');

            :host {
                all: initial;
                font-family: 'Syne', sans-serif;
                color: #fff;
                display: block;
                pointer-events: none;
            }

            .widget {
                position: relative;
                background:
                    radial-gradient(circle at top left, rgba(179, 83, 211, 0.32) 0%, transparent 65%),
                    radial-gradient(circle at bottom right, rgba(173, 44, 44, 0.32) 0%, transparent 70%),
                    rgba(5, 0, 9, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                padding: 1.6rem;
                box-shadow: 0 24px 58px rgba(8, 0, 14, 0.75);
                display: flex;
                flex-direction: column;
                gap: 1.35rem;
                overflow: hidden;
                isolation: isolate;
                animation: widgetEnter 0.75s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                pointer-events: auto;
            }

            .widget::before,
            .widget::after {
                content: "";
                position: absolute;
                width: 180px;
                height: 180px;
                border-radius: 50%;
                filter: blur(90px);
                opacity: 0.65;
                z-index: -1;
                animation: glowDrift 12s ease-in-out infinite;
            }

            .widget::before {
                top: -120px;
                left: -80px;
                background: rgba(179, 83, 211, 0.6);
            }

            .widget::after {
                bottom: -120px;
                right: -60px;
                background: rgba(173, 44, 44, 0.6);
                animation-delay: -6s;
            }

            .brand-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.16em;
            }

            .brand-name {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-weight: 700;
            }

            .brand-accent {
                background: linear-gradient(135deg, #b353d3 0%, #ad2c2c 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .indicator {
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-size: 0.68rem;
                color: rgba(255, 255, 255, 0.72);
            }

            .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #57f287;
                animation: pulse 2.8s ease-in-out infinite;
                box-shadow: 0 0 12px rgba(87, 242, 135, 0.75);
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0.75); opacity: 0.6; }
            }

            .hero {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .hero-eyebrow {
                font-family: 'Roboto Mono', monospace;
                font-size: 0.68rem;
                letter-spacing: 0.32em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.62);
            }

            .hero-title {
                font-size: 1.82rem;
                line-height: 1.08;
                letter-spacing: -0.01em;
            }

            .hero-copy {
                font-size: 0.84rem;
                line-height: 1.65;
                color: rgba(255, 255, 255, 0.78);
            }

            .cta-button {
                position: relative;
                margin-top: 0.6rem;
                padding: 0.78rem 1.55rem;
                border-radius: 999px;
                border: none;
                background: linear-gradient(135deg, #b353d3 0%, #ad2c2c 50%, #b353d3 100%);
                background-size: 200% 200%;
                color: #fff;
                font-size: 0.86rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 22px 40px rgba(179, 83, 211, 0.45);
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                overflow: hidden;
                animation: gradientShift 12s ease infinite;
            }

            .cta-button::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.28), transparent 65%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .cta-button:hover {
                transform: translateY(-3px) scale(1.01);
                box-shadow: 0 28px 50px rgba(179, 83, 211, 0.6);
            }

            .cta-button:hover::after {
                opacity: 1;
            }

            .cta-button.is-pressed {
                transform: translateY(1px) scale(0.97);
                box-shadow: 0 18px 28px rgba(179, 83, 211, 0.38);
            }

            .cta-button:focus-visible {
                outline: 2px solid rgba(179, 83, 211, 0.7);
                outline-offset: 4px;
            }

            .feature-list {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.7rem;
                font-size: 0.76rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.72);
            }

            .feature {
                position: relative;
                display: flex;
                align-items: center;
                gap: 0.65rem;
                padding: 0.65rem 0.85rem;
                border-radius: 16px;
                background: rgba(18, 4, 28, 0.82);
                border: 1px solid rgba(255, 255, 255, 0.06);
                backdrop-filter: blur(10px);
                transition: transform 0.25s ease, border-color 0.25s ease;
            }

            .feature::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                border: 1px solid transparent;
                background: linear-gradient(135deg, rgba(179, 83, 211, 0.25), rgba(173, 44, 44, 0.25)) border-box;
                -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                opacity: 0;
                transition: opacity 0.25s ease;
            }

            .feature:hover {
                transform: translateY(-3px);
                border-color: rgba(179, 83, 211, 0.35);
            }

            .feature:hover::before {
                opacity: 1;
            }

            .feature-icon {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(179, 83, 211, 0.9) 0%, rgba(173, 44, 44, 0.9) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                color: #fff;
                box-shadow: 0 0 12px rgba(179, 83, 211, 0.45);
            }

            .trust-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                color: rgba(255, 255, 255, 0.52);
            }

            .trust-logos {
                display: flex;
                gap: 0.45rem;
            }

            .trust-logos span {
                padding: 0.28rem 0.55rem;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.08);
                color: rgba(255, 255, 255, 0.72);
                font-size: 0.68rem;
                letter-spacing: 0.12em;
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
                50% { transform: translate(12px, -18px) scale(1.08); }
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
                    Live
                </div>
            </div>
            <div class="hero">
                <span class="hero-eyebrow">Premium dating automation</span>
                <div class="hero-title">AI that gets you dates</div>
                <div class="hero-copy">
                    CupidBot swipes and chats for you so you can skip to
                    the small talk. We only tap you when the date is locked in.
                </div>
                <button id="cupidbot-connect-btn" class="cta-button" type="button" aria-label="Connect CupidBot to Login">Connect To Login</button>
            </div>
            <div class="feature-list">
                <div class="feature">
                    <span class="feature-icon">✔</span>
                    Never swipe again
                </div>
                <div class="feature">
                    <span class="feature-icon">✔</span>
                    Real conversations, no scripts
                </div>
                <div class="feature">
                    <span class="feature-icon">✔</span>
                    Calendar-ready scheduling
                </div>
            </div>
            <div class="trust-row">
                <span>Featured in</span>
                <div class="trust-logos">
                    <span>VICE</span>
                    <span>NY POST</span>
                    <span>YAHOO</span>
                </div>
            </div>
        `;

        shadow.append(style, wrapper);
        document.body.appendChild(host);

        widgetHost = host;

        const connectButton = shadow.getElementById('cupidbot-connect-btn');
        if (connectButton) {
            const tap = () => {
                connectButton.classList.add('is-pressed');
                setTimeout(() => connectButton.classList.remove('is-pressed'), 220);
            };

            connectButton.addEventListener('click', () => {
                tap();
                const canMessage = typeof chrome !== 'undefined'
                    && chrome?.runtime
                    && typeof chrome.runtime.sendMessage === 'function';

                if (!canMessage) {
                    console.warn('CupidBot widget runtime messaging unavailable.');
                    return;
                }

                chrome.runtime.sendMessage(
                    { action: 'connectToLoginClicked', source: 'floating-widget' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.debug('CupidBot widget message channel error', chrome.runtime.lastError);
                        } else {
                            console.debug('CupidBot widget message delivered', response);
                        }
                    }
                );
            });

            connectButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    tap();
                }
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
