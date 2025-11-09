document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');

    if (connectButton) {
        connectButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'connectToLoginClicked', source: 'popup' });
            console.log('Connect To Login clicked from popup');
        });
    }
});
