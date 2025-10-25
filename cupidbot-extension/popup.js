// Ultra-Premium CupidBot Extension
// State Management
const AppState = {
    currentScreen: 'loading',
    hasSeenLoading: false,
    hasEnteredKey: false,
    hasDownloadedDeps: false,
    trialKey: null,
    stats: {
        messages: 0,
        conversions: 0
    }
};

// Dependencies to "download"
const dependencies = [
    { name: 'AI Model Weights', size: '847 MB', duration: 3000, icon: '🧠' },
    { name: 'Conversation Engine', size: '234 MB', duration: 2000, icon: '💬' },
    { name: 'NLP Processor', size: '156 MB', duration: 1500, icon: '📝' },
    { name: 'Sentiment Analyzer', size: '89 MB', duration: 1000, icon: '😊' },
    { name: 'Response Generator', size: '67 MB', duration: 800, icon: '✨' }
];

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
    return new Promise((resolve) => {
        chrome.storage.local.get([
            'hasSeenLoading',
            'hasEnteredKey',
            'hasDownloadedDeps',
            'trialKey',
            'stats'
        ], (result) => {
            Object.assign(AppState, result);
            resolve();
        });
    });
}

// Save state to storage
async function saveState() {
    return new Promise((resolve) => {
        chrome.storage.local.set(AppState, resolve);
    });
}

// Initialize app based on state
function initializeApp() {
    if (!AppState.hasSeenLoading) {
        showLoadingScreen();
    } else if (!AppState.hasEnteredKey) {
        showScreen('keyScreen');
        setupKeyEntry();
    } else if (!AppState.hasDownloadedDeps) {
        showScreen('downloadScreen');
        startDependencyDownload();
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
        
        if (!validateKey(key)) {
            showError('Invalid trial key format. Please check and try again.');
            return;
        }
        
        activateBtn.classList.add('loading');
        activateBtn.disabled = true;
        
        // Simulate API validation
        await sleep(1500);
        
        // For demo, accept any properly formatted key
        AppState.trialKey = key;
        AppState.hasEnteredKey = true;
        await saveState();
        
        activateBtn.classList.remove('loading');
        
        // Show download screen
        showScreen('downloadScreen');
        startDependencyDownload();
    });
}

function validateKey(key) {
    const pattern = /^CUPID-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(key);
}

function showError(message) {
    const errorMsg = document.getElementById('keyError');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

// ===== DEPENDENCY DOWNLOAD SCREEN =====
async function startDependencyDownload() {
    const container = document.getElementById('dependenciesList');
    const overallProgress = document.getElementById('overallProgress');
    const overallPercent = document.getElementById('overallPercent');
    
    // Create dependency items
    container.innerHTML = dependencies.map((dep, index) => `
        <div class="dependency-item" id="dep-${index}">
            <div class="dep-icon">${dep.icon}</div>
            <div class="dep-info">
                <div class="dep-name">${dep.name}</div>
                <div class="dep-size">${dep.size}</div>
                <div class="dep-progress">
                    <div class="dep-progress-fill" id="dep-progress-${index}"></div>
                </div>
            </div>
            <div class="dep-status" id="dep-status-${index}">⏳</div>
        </div>
    `).join('');
    
    // Download each dependency sequentially
    let totalProgress = 0;
    const progressPerDep = 100 / dependencies.length;
    
    for (let i = 0; i < dependencies.length; i++) {
        await downloadDependency(i, dependencies[i]);
        totalProgress += progressPerDep;
        overallProgress.style.width = totalProgress + '%';
        overallPercent.textContent = Math.floor(totalProgress) + '%';
    }
    
    // Mark as complete
    AppState.hasDownloadedDeps = true;
    await saveState();
    
    // Show success screen
    await sleep(500);
    showScreen('successScreen');
    showSuccessAnimation();
}

async function downloadDependency(index, dep) {
    const item = document.getElementById(`dep-${index}`);
    const progressBar = document.getElementById(`dep-progress-${index}`);
    const status = document.getElementById(`dep-status-${index}`);
    
    item.classList.add('downloading');
    
    return new Promise((resolve) => {
        let progress = 0;
        const steps = 20;
        const stepDuration = dep.duration / steps;
        
        const interval = setInterval(() => {
            progress += 100 / steps;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                progressBar.style.width = '100%';
                status.textContent = '✓';
                item.classList.remove('downloading');
                item.classList.add('completed');
                
                resolve();
            } else {
                progressBar.style.width = progress + '%';
            }
        }, stepDuration);
    });
}

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
