// Content Script for OnlyFans integration
(function() {
    'use strict';
    
    console.log('CupidBot AI activated on OnlyFans');
    
    // Check if extension is activated
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response && response.hasDownloadedDeps && response.trialKey) {
            initializeCupidBot();
        }
    });
    
    function initializeCupidBot() {
        // Add visual indicator
        addBotIndicator();
        
        // Monitor for messages (placeholder - actual implementation would depend on OnlyFans DOM)
        console.log('CupidBot monitoring active');
    }
    
    function addBotIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'cupidbot-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #b353d3 0%, #ad2c2c 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 20px rgba(179, 83, 211, 0.4);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
            ">
                <span style="
                    width: 8px;
                    height: 8px;
                    background: #00ff88;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                "></span>
                CupidBot AI Active
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        
        document.body.appendChild(indicator);
        
        // Click to open popup
        indicator.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
    }
})();
