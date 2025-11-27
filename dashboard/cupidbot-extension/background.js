// CupidBot Assistant Background Service Worker

const INSTALLER_DOWNLOAD_URL = 'https://example.com/cupidbot/installer/latest.zip';
const INSTALLER_FILENAME = 'cupidbot-installer.zip';
const INSTALL_GUIDE_URL = 'https://cupidbot.org/install';
const SUPPORT_URL = 'https://cupidbot.org/contact.html';
const TROUBLESHOOT_URL = 'https://cupidbot.org/install/troubleshooting';
const RELEASE_NOTES_URL = 'https://cupidbot.org/install/release-notes';

let lastDownloadId = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log('CupidBot assistant installed and ready.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.action) {
        sendResponse?.({ success: false, message: 'No action specified.' });
        return;
    }

    if (request.action === 'startInstallerDownload') {
        if (!chrome?.downloads?.download) {
            sendResponse?.({
                success: false,
                message: 'Downloads API unavailable in this environment.'
            });
            return;
        }

        chrome.downloads.download(
            {
                url: INSTALLER_DOWNLOAD_URL,
                filename: INSTALLER_FILENAME,
                saveAs: true
            },
            (downloadId) => {
                if (chrome.runtime.lastError || !downloadId) {
                    console.debug('CupidBot installer download failed', chrome.runtime.lastError);
                    sendResponse?.({
                        success: false,
                        message: 'Unable to start download. Please verify the installer URL.',
                        error: chrome.runtime.lastError?.message || 'unknown_error'
                    });
                } else {
                    lastDownloadId = downloadId;
                    console.debug('CupidBot installer download started', { downloadId, source: request.source });
                    sendResponse?.({
                        success: true,
                        downloadId
                    });
                }
            }
        );
        return true;
    }

    if (request.action === 'showInstallerDownload') {
        const targetId = typeof request.downloadId === 'number' ? request.downloadId : lastDownloadId;

        if (typeof targetId === 'number' && chrome?.downloads?.show) {
            chrome.downloads.show(targetId);
            sendResponse?.({ success: true, downloadId: targetId });
        } else {
            chrome.tabs.create({ url: 'chrome://downloads/' }, () => {
                if (chrome.runtime.lastError) {
                    console.debug('Unable to open downloads page', chrome.runtime.lastError);
                    sendResponse?.({ success: false, message: chrome.runtime.lastError.message });
                } else {
                    sendResponse?.({ success: true });
                }
            });
            return true;
        }
        return;
    }

    if (request.action === 'openInstallGuide') {
        chrome.tabs.create({ url: INSTALL_GUIDE_URL }, () => {
            if (chrome.runtime.lastError) {
                sendResponse?.({ success: false, message: chrome.runtime.lastError.message });
            } else {
                sendResponse?.({ success: true });
            }
        });
        return true;
    }

    if (request.action === 'openSupport') {
        chrome.tabs.create({ url: SUPPORT_URL }, () => {
            if (chrome.runtime.lastError) {
                sendResponse?.({ success: false, message: chrome.runtime.lastError.message });
            } else {
                sendResponse?.({ success: true });
            }
        });
        return true;
    }

    if (request.action === 'openTroubleshooting') {
        chrome.tabs.create({ url: TROUBLESHOOT_URL }, () => {
            if (chrome.runtime.lastError) {
                sendResponse?.({ success: false, message: chrome.runtime.lastError.message });
            } else {
                sendResponse?.({ success: true });
            }
        });
        return true;
    }

    if (request.action === 'openReleaseNotes') {
        chrome.tabs.create({ url: RELEASE_NOTES_URL }, () => {
            if (chrome.runtime.lastError) {
                sendResponse?.({ success: false, message: chrome.runtime.lastError.message });
            } else {
                sendResponse?.({ success: true });
            }
        });
        return true;
    }

    if (request.action === 'connectToLoginClicked') {
        console.log('Connect To Login clicked', {
            from: sender?.tab?.url || 'extension'
        });
        sendResponse?.({ success: true });
        return;
    }

    sendResponse?.({ success: false, message: 'Unknown action.' });
});
