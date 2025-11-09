document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');

    if (connectButton) {
        const tap = () => {
            connectButton.classList.add('is-pressed');
            setTimeout(() => connectButton.classList.remove('is-pressed'), 220);
        };

        connectButton.addEventListener('click', () => {
            tap();
            try {
                chrome.runtime.sendMessage({ action: 'connectToLoginClicked', source: 'popup' });
                console.log('Connect To Login clicked from popup');
            } catch (error) {
                console.warn('CupidBot popup could not notify background script.', error);
            }
        });

        connectButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                tap();
            }
        });
    }
});
