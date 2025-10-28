// Ultra-Premium CupidBot Extension
// Configuration
const CONFIG = {
    // Activation server URL - LIVE PRODUCTION
    ACTIVATION_SERVER_URL: 'https://cupid-activation-server.onrender.com'
};

// State Management
const AppState = {
    currentScreen: 'loading',
    hasSeenLoading: false,
    hasEnteredKey: false,
    trialKey: null,
    stats: {
        messages: 0,
        conversions: 0
    }
};

// Removed fake download dependencies - user requested immediate activation

// Loading messages
const loadingMessages = [
    'Warming up the AI...',
    'Calibrating conversation engine...',
    'Teaching the bot your style...',
    'Initializing charm protocols...',
    'Almost ready to charm! 💕'
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadState();
    initializeApp();
});

// Load state from storage
async function loadState() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([
            'hasSeenLoading',
            'hasEnteredKey',
            'trialKey',
            'stats',
            'activationDate'
        ], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Storage load error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                Object.assign(AppState, result);
                resolve();
            }
        });
    });
}

// Save state to storage
async function saveState() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(AppState, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage save error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

// Initialize app based on state
function initializeApp() {
    if (!AppState.hasSeenLoading) {
        showLoadingScreen();
    } else if (!AppState.hasEnteredKey) {
        showScreen('keyScreen');
        setupKeyEntry();
    } else {
        showScreen('dashboardScreen');
        setupDashboard();
    }
}

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    AppState.currentScreen = screenId;
}

// ===== LOADING SCREEN =====
function showLoadingScreen() {
    showScreen('loadingScreen');
    
    let progress = 0;
    let messageIndex = 0;
    const progressBar = document.getElementById('loadingProgress');
    const progressText = document.getElementById('loadingText');
    const messagesContainer = document.getElementById('loadingMessages');
    
    // Show first message
    showLoadingMessage(loadingMessages[0], messagesContainer);
    
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                AppState.hasSeenLoading = true;
                saveState();
                showScreen('keyScreen');
                setupKeyEntry();
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.floor(progress) + '%';
        
        // Show messages at intervals
        if (progress > (messageIndex + 1) * 20 && messageIndex < loadingMessages.length - 1) {
            messageIndex++;
            showLoadingMessage(loadingMessages[messageIndex], messagesContainer);
        }
    }, 300);
}

function showLoadingMessage(message, container) {
    container.innerHTML = `<div class="loading-message">${message}</div>`;
}

// ===== KEY ENTRY SCREEN =====
function setupKeyEntry() {
    const input = document.getElementById('trialKeyInput');
    const activateBtn = document.getElementById('activateBtn');
    const errorMsg = document.getElementById('keyError');
    
    // Auto-format key input
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        
        for (let i = 0; i < value.length && i < 20; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += '-';
            }
            formatted += value[i];
        }
        
        e.target.value = formatted;
        errorMsg.classList.remove('show');
    });
    
    // Activate button
    activateBtn.addEventListener('click', async () => {
        const key = input.value.trim();
        
        if (!validateKeyFormat(key)) {
            showError('Invalid trial key format. Please check and try again.');
            return;
        }
        
        activateBtn.classList.add('loading');
        activateBtn.disabled = true;
        
        // Validate key with server
        try {
            const isValid = await validateKeyWithServer(key);
            
            if (!isValid) {
                activateBtn.classList.remove('loading');
                activateBtn.disabled = false;
                showError('Invalid or expired trial key. Please check your key or request a new one.');
                return;
            }
            
            // Key is valid, proceed directly to dashboard
            AppState.trialKey = key;
            AppState.hasEnteredKey = true;
            AppState.activationDate = new Date().toISOString();
            await saveState();
            
            activateBtn.classList.remove('loading');
            
            // Show success screen briefly, then dashboard
            showScreen('successScreen');
            showSuccessAnimation();
            
            // Auto-proceed to dashboard after 2 seconds
            setTimeout(() => {
                showScreen('dashboardScreen');
                setupDashboard();
            }, 2000);
        } catch (error) {
            activateBtn.classList.remove('loading');
            activateBtn.disabled = false;
            showError('Unable to verify key. Please check your internet connection and try again.');
            console.error('Key validation error:', error);
        }
    });
}

function validateKeyFormat(key) {
    const pattern = /^CUPID-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key);
}

async function validateKeyWithServer(key) {
    // Extract just the key part after CUPID- for server validation
    const keyPart = key.replace('CUPID-', '').replace(/-/g, '');
    
    try {
        // Call activation server API - GET /api/verify/:key
        const response = await fetch(`${CONFIG.ACTIVATION_SERVER_URL}/api/verify/${keyPart}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Server returned error:', response.status);
            return false;
        }
        
        const result = await response.json();
        console.log('Validation result:', result);
        
        // Server returns { valid: true/false, ... }
        return result.valid === true;
    } catch (error) {
        console.error('Server validation error:', error);
        // In case of network error, fall back to format validation only
        // This prevents complete lockout but logs the issue
        console.warn('Server validation failed, using format validation only');
        return validateKeyFormat(key);
    }
}

function showError(message) {
    const errorMsg = document.getElementById('keyError');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

// ===== REMOVED FAKE DOWNLOAD SCREEN =====
// User requested immediate activation without fake download progress bars

// ===== SUCCESS SCREEN =====
function showSuccessAnimation() {
    createConfetti();
    
    const getStartedBtn = document.getElementById('getStartedBtn');
    getStartedBtn.addEventListener('click', () => {
        showScreen('dashboardScreen');
        setupDashboard();
    });
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#b353d3', '#ad2c2c', '#246426', '#ffffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 4000);
}

// ===== DASHBOARD SCREEN =====
function setupDashboard() {
    // Update stats
    document.getElementById('messagesCount').textContent = AppState.stats.messages || 0;
    document.getElementById('conversionsCount').textContent = AppState.stats.conversions || 0;
    
    // Calculate trial days remaining
    const activationDate = new Date(AppState.activationDate || Date.now());
    const now = new Date();
    const daysElapsed = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysElapsed);
    document.getElementById('trialDays').textContent = daysRemaining;
    
    // Setup buttons
    document.getElementById('pauseBtn').addEventListener('click', () => {
        alert('AI paused. Click again to resume.');
    });
    
    document.getElementById('settingsBtn').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://cupidbot.org/contact.html' });
    });
    
    // Animate stats on load
    animateValue('messagesCount', 0, AppState.stats.messages || 0, 1000);
    animateValue('conversionsCount', 0, AppState.stats.conversions || 0, 1000);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStats') {
        AppState.stats = request.stats;
        saveState();
        if (AppState.currentScreen === 'dashboardScreen') {
            setupDashboard();
        }
    }
});
