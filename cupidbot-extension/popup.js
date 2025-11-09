document.addEventListener('DOMContentLoaded', () => {
    const DOWNLOAD_LABEL_READY = 'Download Installer';
    const DOWNLOAD_LABEL_PROGRESS = 'Preparing…';

    const VERIFY_ENDPOINT = 'https://example.com/cupidbot/installer/status';

    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBtnText = document.getElementById('downloadBtnText');
    const openGuideBtn = document.getElementById('openGuideBtn');
    const supportLink = document.getElementById('supportLink');
    const verifyBtn = document.getElementById('verifyBtn');
    const showDownloadsBtn = document.getElementById('showDownloadsBtn');
    const troubleshootBtn = document.getElementById('troubleshootBtn');
    const releaseNotesBtn = document.getElementById('releaseNotesBtn');

    const statusPanel = document.getElementById('statusPanel');
    const statusBadge = document.getElementById('statusBadge');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');

    let lastDownloadId = null;
    let isDownloading = false;

    setStatus('ready', 'Ready to install', 'Click <em>Download Installer</em> to grab the latest package.');
    setDownloadLoading(false);
    setShowDownloads(false);

    downloadBtn.addEventListener('click', async () => {
        if (isDownloading) {
            return;
        }

        setDownloadLoading(true);
        setStatus('progress', 'Preparing download', 'Fetching the CupidBot installer and saving it to your downloads folder…');

        const response = await sendRuntimeMessage('startInstallerDownload', { source: 'popup' });

        setDownloadLoading(false);

        if (response?.success) {
            lastDownloadId = response.downloadId ?? null;
            setStatus(
                'success',
                'Installer downloaded',
                'Open your downloads folder and run the <code>cupidbot-installer</code> to finish setup.'
            );
            setShowDownloads(true);
        } else {
            const message = response?.message || 'Unable to start the download.';
            setStatus(
                'error',
                'Download failed',
                `${message} Please verify the installer URL or use the install guide.`
            );
            setShowDownloads(false);
        }
    });

    verifyBtn.addEventListener('click', async () => {
        if (isDownloading) {
            return;
        }

        if (!VERIFY_ENDPOINT || VERIFY_ENDPOINT.includes('example.com')) {
            setStatus(
                'error',
                'Verification not configured',
                'Provide a verification endpoint in <code>popup.js</code> or follow the troubleshooting guide below.'
            );
            return;
        }

        setStatus('progress', 'Verifying setup', 'Running CupidBot diagnostics and checking activation status…');

        try {
            const response = await fetch(VERIFY_ENDPOINT, { cache: 'no-store' });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            let data = {};
            try {
                data = await response.json();
            } catch (jsonError) {
                console.debug('Verification response was not JSON', jsonError);
            }

            const healthy = data?.healthy === true
                || data?.status === 'ok'
                || data?.valid === true;

            if (healthy) {
                setStatus(
                    'success',
                    'Verification passed',
                    'CupidBot dependencies are active and ready. You are good to go!'
                );
            } else {
                const reason = data?.message || 'CupidBot services did not respond as expected.';
                setStatus(
                    'error',
                    'Verification failed',
                    `${reason} Run the installer again or review the troubleshooting guide.`
                );
            }
        } catch (error) {
            console.debug('Verification error', error);
            setStatus(
                'error',
                'Verification unavailable',
                'We could not reach the verification endpoint. Check your connection or try again later.'
            );
        }
    });

    showDownloadsBtn.addEventListener('click', async () => {
        const response = await sendRuntimeMessage('showInstallerDownload', { downloadId: lastDownloadId });

        if (!response?.success) {
            setStatus(
                'error',
                'Unable to open downloads',
                'Open <code>chrome://downloads</code> manually and run the installer.'
            );
        }
    });

    openGuideBtn.addEventListener('click', () => {
        sendRuntimeMessage('openInstallGuide');
    });

    supportLink.addEventListener('click', () => {
        sendRuntimeMessage('openSupport');
    });

    troubleshootBtn.addEventListener('click', () => {
        sendRuntimeMessage('openTroubleshooting');
    });

    releaseNotesBtn.addEventListener('click', () => {
        sendRuntimeMessage('openReleaseNotes');
    });

    function setStatus(mode, title, message) {
        const modes = ['ready', 'progress', 'success', 'error'];
        modes.forEach((state) => statusPanel.classList.remove(`status--${state}`));
        statusPanel.classList.add(`status--${mode}`);

        const badgeLabel = {
            ready: 'Ready',
            progress: 'Working',
            success: 'Done',
            error: 'Check'
        }[mode] || 'Status';

        statusBadge.textContent = badgeLabel;
        statusTitle.textContent = title;
        statusMessage.innerHTML = message;
    }

    function setDownloadLoading(loading) {
        isDownloading = loading;
        if (loading) {
            downloadBtn.classList.add('loading', 'disabled');
            downloadBtn.disabled = true;
            downloadBtnText.textContent = DOWNLOAD_LABEL_PROGRESS;
        } else {
            downloadBtn.classList.remove('loading', 'disabled');
            downloadBtn.disabled = false;
            downloadBtnText.textContent = DOWNLOAD_LABEL_READY;
        }
    }

    function setShowDownloads(visible) {
        showDownloadsBtn.hidden = !visible;
    }

    function sendRuntimeMessage(action, payload = {}) {
        return new Promise((resolve) => {
            const canMessage = typeof chrome !== 'undefined'
                && chrome?.runtime
                && typeof chrome.runtime.sendMessage === 'function';

            if (!canMessage) {
                resolve({
                    success: false,
                    message: 'Runtime messaging unavailable in this browser.'
                });
                return;
            }

            chrome.runtime.sendMessage(
                { action, ...payload },
                (response) => {
                    if (chrome.runtime.lastError) {
                        resolve({
                            success: false,
                            message: chrome.runtime.lastError.message || 'chrome.runtime messaging error'
                        });
                    } else {
                        resolve(response || { success: true });
                    }
                }
            );
        });
    }
});
