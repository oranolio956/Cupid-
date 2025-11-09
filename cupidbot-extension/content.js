// Floating CupidBot widget content script
(function () {
    const HOST_ID = 'cupidbot-floating-widget';

    const init = () => {
        if (document.getElementById(HOST_ID)) {
            return;
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

        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');

            :host {
                all: initial;
                font-family: 'Syne', sans-serif;
                color: #fff;
            }

            .widget {
                background:
                    radial-gradient(circle at top left, rgba(179, 83, 211, 0.3) 0%, transparent 60%),
                    radial-gradient(circle at bottom right, rgba(173, 44, 44, 0.35) 0%, transparent 65%),
                    rgba(5, 0, 9, 0.93);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 24px;
                padding: 1.5rem;
                box-shadow: 0 20px 48px rgba(8, 0, 14, 0.65);
                display: flex;
                flex-direction: column;
                gap: 1.25rem;
                overflow: hidden;
            }

            .brand-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.14em;
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
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.75);
            }

            .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #57f287;
                animation: pulse 2.5s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(0.8); opacity: 0.6; }
            }

            .hero {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .hero-eyebrow {
                font-family: 'Roboto Mono', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.28em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.6);
            }

            .hero-title {
                font-size: 1.85rem;
                line-height: 1.1;
                letter-spacing: -0.01em;
            }

            .hero-copy {
                font-size: 0.85rem;
                line-height: 1.6;
                color: rgba(255, 255, 255, 0.78);
            }

            .cta-button {
                margin-top: 0.5rem;
                padding: 0.75rem 1.4rem;
                border-radius: 999px;
                border: none;
                background: linear-gradient(135deg, #b353d3 0%, #ad2c2c 100%);
                color: #fff;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 18px 32px rgba(179, 83, 211, 0.35);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 24px 40px rgba(179, 83, 211, 0.45);
            }

            .feature-list {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.6rem;
                font-size: 0.78rem;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.7);
            }

            .feature {
                display: flex;
                align-items: center;
                gap: 0.55rem;
                padding: 0.6rem 0.75rem;
                border-radius: 14px;
                background: rgba(18, 4, 28, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.05);
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
            }

            .trust-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                font-size: 0.7rem;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                color: rgba(255, 255, 255, 0.55);
            }

            .trust-logos {
                display: flex;
                gap: 0.4rem;
            }

            .trust-logos span {
                padding: 0.25rem 0.5rem;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.06);
            }

            @media (max-width: 600px) {
                :host {
                    font-size: 14px;
                }
            }
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'widget';
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
                <button id="cupidbot-connect-btn" class="cta-button">Connect To Login</button>
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

        const connectButton = shadow.getElementById('cupidbot-connect-btn');
        if (connectButton) {
            connectButton.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'connectToLoginClicked', source: 'floating-widget' });
                console.log('Connect To Login clicked from floating widget');
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
