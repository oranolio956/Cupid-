// Content script for CupidBot - runs on OnlyFans pages

(function() {
    'use strict';
    
    let isActive = false;
    let hasValidKey = false;
    
    // Initialize
    init();
    
    async function init() {
        console.log('CupidBot AI initialized');
        
        // Check activation status
        const status = await getStatus();
        isActive = status.isActive;
        hasValidKey = status.hasKey && status.isValid;
        
        if (!hasValidKey) {
            console.log('CupidBot: No valid trial key found');
            return;
        }
        
        if (isActive) {
            console.log('CupidBot: AI is active');
            startMonitoring();
        } else {
            console.log('CupidBot: AI is paused');
        }
        
        // Listen for status changes
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'statusChanged') {
                isActive = request.isActive;
                if (isActive) {
                    startMonitoring();
                } else {
                    stopMonitoring();
                }
            }
        });
    }
    
    // Get activation status from background
    function getStatus() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
                resolve(response || { isActive: false, hasKey: false, isValid: false });
            });
        });
    }
    
    // Start monitoring for messages
    function startMonitoring() {
        // This is a placeholder - actual implementation would depend on OnlyFans' DOM structure
        // You would need to:
        // 1. Monitor for new messages
        // 2. Extract message content and context
        // 3. Generate AI response
        // 4. Insert response (with user confirmation)
        
        console.log('CupidBot: Monitoring started');
        
        // Add visual indicator that bot is active
        addBotIndicator();
        
        // Example: Monitor for message input fields
        observeMessageInputs();
    }
    
    // Stop monitoring
    function stopMonitoring() {
        console.log('CupidBot: Monitoring stopped');
        removeBotIndicator();
    }
    
    // Add visual indicator
    function addBotIndicator() {
        if (document.getElementById('cupidbot-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'cupidbot-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ff3366 0%, #ff6b9d 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(255, 51, 102, 0.4);
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
    
    // Remove visual indicator
    function removeBotIndicator() {
        const indicator = document.getElementById('cupidbot-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Observe message inputs (placeholder implementation)
    function observeMessageInputs() {
        // This would need to be customized based on OnlyFans' actual DOM structure
        // For security and privacy, actual message monitoring would require user consent
        
        const observer = new MutationObserver((mutations) => {
            // Monitor for new messages or chat windows
            // This is where you'd implement the actual AI response logic
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Generate AI response for a message
    async function generateResponse(message, context) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: 'generateResponse',
                message: message,
                context: context
            }, (response) => {
                if (response.error) {
                    console.error('CupidBot: Error generating response:', response.error);
                    resolve(null);
                } else {
                    resolve(response.response);
                }
            });
        });
    }
    
    // Update stats
    function updateStats(type) {
        chrome.runtime.sendMessage({
            action: 'updateStats',
            type: type
        });
    }
    
})();
