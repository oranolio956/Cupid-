// Background Service Worker for CupidBot

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('CupidBot AI extension installed');
    
    if (details.reason === 'install') {
        // First install - open trial page
        chrome.tabs.create({ url: 'https://cupidbot.org/trial.html' });
    }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStatus') {
        chrome.storage.local.get([
            'hasSeenLoading',
            'hasEnteredKey',
            'hasDownloadedDeps',
            'trialKey'
        ], (result) => {
            sendResponse(result);
        });
        return true;
    }
    
    if (request.action === 'updateStats') {
        chrome.storage.local.get(['stats'], (result) => {
            const stats = result.stats || { messages: 0, conversions: 0 };
            
            if (request.type === 'message') {
                stats.messages++;
            } else if (request.type === 'conversion') {
                stats.conversions++;
            }
            
            chrome.storage.local.set({ stats: stats }, () => {
                // Notify popup if it's open
                chrome.runtime.sendMessage({
                    action: 'updateStats',
                    stats: stats
                });
            });
        });
    }
});

// Check trial expiration daily
chrome.alarms.create('checkTrial', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkTrial') {
        chrome.storage.local.get(['activationDate'], (result) => {
            if (result.activationDate) {
                const activationDate = new Date(result.activationDate);
                const now = new Date();
                const daysElapsed = (now - activationDate) / (1000 * 60 * 60 * 24);
                
                if (daysElapsed > 30) {
                    // Trial expired
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'assets/icon128.png',
                        title: 'CupidBot Trial Expired',
                        message: 'Your 30-day trial has ended. Visit cupidbot.org to upgrade!'
                    });
                }
            }
        });
    }
});
