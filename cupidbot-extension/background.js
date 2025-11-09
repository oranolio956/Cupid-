// CupidBot Assistant Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
    console.log('CupidBot assistant installed and ready.');
});

chrome.runtime.onMessage.addListener((request, sender) => {
    if (request?.action === 'connectToLoginClicked') {
        console.log('Connect To Login clicked', {
            from: sender?.tab?.url || 'extension'
        });
    }
});
