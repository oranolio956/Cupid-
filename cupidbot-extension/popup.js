document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');

    if (connectButton) {
        const tap = () => {
            connectButton.classList.add('is-pressed');
            setTimeout(() => connectButton.classList.remove('is-pressed'), 220);
        };

        connectButton.addEventListener('click', () => {
            tap();
            const canMessage = typeof chrome !== 'undefined'
                && chrome?.runtime
                && typeof chrome.runtime.sendMessage === 'function';

            if (!canMessage) {
                console.warn('CupidBot popup runtime messaging unavailable.');
                return;
            }

            chrome.runtime.sendMessage(
                { action: 'connectToLoginClicked', source: 'popup' },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.debug('CupidBot popup message channel error', chrome.runtime.lastError);
                    } else {
                        console.debug('CupidBot popup message delivered', response);
                    }
                }
            );
        });

        connectButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                tap();
            }
        });
    }
});
