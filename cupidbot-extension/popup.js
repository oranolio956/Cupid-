// Popup functionality for CupidBot extension

document.addEventListener('DOMContentLoaded', function() {
    checkActivationStatus();
    
    // Activate button
    document.getElementById('activateBtn').addEventListener('click', activateTrial);
    
    // Toggle AI button
    document.getElementById('toggleBtn').addEventListener('click', toggleAI);
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
});

// Check if extension is already activated
function checkActivationStatus() {
    chrome.storage.local.get(['trialKey', 'activationDate', 'isActive', 'stats'], function(result) {
        if (result.trialKey && result.activationDate) {
            showActiveSection(result);
        } else {
            showActivationSection();
        }
    });
}

// Show activation section
function showActivationSection() {
    document.getElementById('activationSection').classList.remove('hidden');
    document.getElementById('activeSection').classList.add('hidden');
}

// Show active section
function showActiveSection(data) {
    document.getElementById('activationSection').classList.add('hidden');
    document.getElementById('activeSection').classList.remove('hidden');
    
    // Calculate expiry date (30 days from activation)
    const activationDate = new Date(data.activationDate);
    const expiryDate = new Date(activationDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    document.getElementById('expiryDate').textContent = expiryDate.toLocaleDateString();
    
    // Update stats
    if (data.stats) {
        document.getElementById('messagesCount').textContent = data.stats.messages || 0;
        document.getElementById('conversionsCount').textContent = data.stats.conversions || 0;
    }
    
    // Update AI status
    const isActive = data.isActive !== false; // Default to true
    updateAIStatus(isActive);
}

// Activate trial with key
function activateTrial() {
    const trialKey = document.getElementById('trialKey').value.trim();
    const messageEl = document.getElementById('message');
    
    if (!trialKey) {
        showMessage('Please enter a trial key', 'error');
        return;
    }
    
    // Validate key format (CUPID-XXXX-XXXX-XXXX-XXXX)
    const keyPattern = /^CUPID-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!keyPattern.test(trialKey)) {
        showMessage('Invalid trial key format', 'error');
        return;
    }
    
    // Store activation data
    const activationData = {
        trialKey: trialKey,
        activationDate: new Date().toISOString(),
        isActive: true,
        stats: {
            messages: 0,
            conversions: 0
        }
    };
    
    chrome.storage.local.set(activationData, function() {
        showMessage('Trial activated successfully!', 'success');
        setTimeout(() => {
            showActiveSection(activationData);
        }, 1500);
    });
}

// Toggle AI on/off
function toggleAI() {
    chrome.storage.local.get(['isActive'], function(result) {
        const newStatus = !result.isActive;
        chrome.storage.local.set({ isActive: newStatus }, function() {
            updateAIStatus(newStatus);
        });
    });
}

// Update AI status display
function updateAIStatus(isActive) {
    const statusText = document.getElementById('aiMode');
    const toggleBtn = document.getElementById('toggleBtn');
    
    if (isActive) {
        statusText.textContent = 'Enabled';
        statusText.className = 'status-value status-active';
        toggleBtn.textContent = 'Pause AI';
    } else {
        statusText.textContent = 'Paused';
        statusText.className = 'status-value status-inactive';
        toggleBtn.textContent = 'Resume AI';
    }
}

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message message-${type}`;
    messageEl.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 3000);
    }
}

// Open settings (placeholder)
function openSettings() {
    chrome.tabs.create({ url: 'https://cupidbot.ai/contact.html' });
}
