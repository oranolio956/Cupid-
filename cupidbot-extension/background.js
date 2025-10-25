// Background service worker for CupidBot extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('CupidBot AI extension installed');
    
    // Set default settings
    chrome.storage.local.get(['trialKey'], (result) => {
        if (!result.trialKey) {
            // Open trial page if not activated
            chrome.tabs.create({ url: 'https://cupidbot.ai/trial.html' });
        }
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStatus') {
        chrome.storage.local.get(['isActive', 'trialKey', 'activationDate'], (result) => {
            // Check if trial is still valid (30 days)
            let isValid = false;
            if (result.activationDate) {
                const activationDate = new Date(result.activationDate);
                const now = new Date();
                const daysDiff = (now - activationDate) / (1000 * 60 * 60 * 24);
                isValid = daysDiff <= 30;
            }
            
            sendResponse({
                isActive: result.isActive && isValid,
                hasKey: !!result.trialKey,
                isValid: isValid
            });
        });
        return true; // Keep channel open for async response
    }
    
    if (request.action === 'updateStats') {
        chrome.storage.local.get(['stats'], (result) => {
            const stats = result.stats || { messages: 0, conversions: 0 };
            
            if (request.type === 'message') {
                stats.messages++;
            } else if (request.type === 'conversion') {
                stats.conversions++;
            }
            
            chrome.storage.local.set({ stats: stats });
        });
    }
    
    if (request.action === 'generateResponse') {
        // In production, this would call your AI API
        // For now, return a placeholder
        generateAIResponse(request.message, request.context)
            .then(response => sendResponse({ response: response }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

// Generate AI response (placeholder - integrate with your actual AI API)
async function generateAIResponse(message, context) {
    // This is where you'd call your actual AI API
    // For demo purposes, returning a simple response
    
    const responses = [
        "Hey! Thanks for reaching out 😊",
        "I'd love to chat more! Have you checked out my exclusive content?",
        "You seem really interesting! Want to see more of me?",
        "I'm glad you messaged! I have some special content just for subscribers 💕",
        "Thanks for the message! I think you'd really enjoy my premium content"
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Check trial expiration daily
chrome.alarms.create('checkTrial', { periodInMinutes: 1440 }); // 24 hours

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkTrial') {
        chrome.storage.local.get(['activationDate', 'trialKey'], (result) => {
            if (result.activationDate) {
                const activationDate = new Date(result.activationDate);
                const now = new Date();
                const daysDiff = (now - activationDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff > 30) {
                    // Trial expired
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon128.png',
                        title: 'CupidBot Trial Expired',
                        message: 'Your 30-day trial has ended. Visit cupidbot.ai to upgrade!'
                    });
                }
            }
        });
    }
});
