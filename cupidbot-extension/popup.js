document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');

    if (connectButton) {
        const tap = () => {
            connectButton.classList.add('is-pressed');
            setTimeout(() => connectButton.classList.remove('is-pressed'), 220);
        };

        connectButton.addEventListener('click', () => {
            tap();
            chrome.runtime.sendMessage({ action: 'connectToLoginClicked', source: 'popup' });
            console.log('Connect To Login clicked from popup');
        });

        connectButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                tap();
            }
        });
    }
});
