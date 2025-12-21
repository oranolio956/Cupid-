    document.addEventListener('DOMContentLoaded', () => {
      const STORAGE_KEY = 'cupidbot-ofm-install-progress';
      
      const stepButtons = Array.from(document.querySelectorAll('[data-step-selector]'));
      const stepPanels = Array.from(document.querySelectorAll('[data-step-panel]'));
      const progressFill = document.querySelector('[data-progress-fill]');
      const progressLabel = document.querySelector('[data-progress-label]');
      const progressSecondary = document.querySelector('[data-progress-secondary]');
      const completionBanner = document.querySelector('[data-completion]');
      const completionButtons = Array.from(document.querySelectorAll('[data-complete-step]')).reduce((acc, button) => {
        acc[Number(button.dataset.completeStep)] = button;
        return acc;
      }, {});
      const envCards = {
        browser: document.querySelector('[data-env-card="browser"]'),
        os: document.querySelector('[data-env-card="os"]'),
        dev: document.querySelector('[data-env-card="dev"]')
      };
      const envElements = {
        browserValue: document.querySelector('[data-env-browser]'),
        browserBadge: document.querySelector('[data-env-browser-badge]'),
        browserMeta: document.querySelector('[data-env-browser-meta]'),
        osValue: document.querySelector('[data-env-os]'),
        osBadge: document.querySelector('[data-env-os-badge]'),
        osMeta: document.querySelector('[data-env-os-meta]'),
        devValue: document.querySelector('[data-env-dev]'),
        devBadge: document.querySelector('[data-env-dev-badge]')
      };
      const osButtons = Array.from(document.querySelectorAll('[data-os-button]'));
      const osPanels = Array.from(document.querySelectorAll('[data-os-panel]'));

      const totalSteps = stepPanels.length;
      const completedSteps = new Set();
      let activeStep = 0;
      let environmentInfo = null;

      // localStorage persistence functions
      function saveProgress() {
        try {
          const progress = {
            activeStep,
            completedSteps: Array.from(completedSteps),
            timestamp: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
          console.warn('Failed to save install progress:', error);
        }
      }

      function loadProgress() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (!saved) return false;
          
          const progress = JSON.parse(saved);
          const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
          
          if (Date.now() - progress.timestamp > MAX_AGE) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
          }
          
          activeStep = progress.activeStep || 0;
          progress.completedSteps.forEach(step => completedSteps.add(step));
          return true;
        } catch (error) {
          console.warn('Failed to load install progress:', error);
          return false;
        }
      }

      function clearProgress() {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.warn('Failed to clear install progress:', error);
        }
      }

      function setStatusState(card, state) {
        if (!card) return;
        card.classList.remove('is-success', 'is-warning', 'is-pending');
        card.classList.add(state);
      }

      function detectEnvironment() {
        try {
          const uaData = navigator.userAgentData;
          const ua = navigator.userAgent || '';
          let version = null;

          if (uaData && Array.isArray(uaData.brands)) {
            const brandEntry = uaData.brands.find((item) => /Chrom(e|ium)/i.test(item.brand));
            if (brandEntry && brandEntry.version) {
              version = parseInt(brandEntry.version, 10);
            }
          }
          if (!version) {
            const chromeMatch = ua.match(/Chrome\/(\d+)/);
            if (chromeMatch && chromeMatch[1]) {
              version = parseInt(chromeMatch[1], 10);
            }
          }

          const isEdge = /Edg\//.test(ua);
          const isOpera = /OPR\//.test(ua) || /Opera\//.test(ua);
          const isBrave = typeof navigator.brave !== 'undefined';
          const isChrome = !isEdge && !isOpera && !!version && /Chrome\//.test(ua) && !isBrave;

          const platform = (uaData && uaData.platform) || navigator.platform || ua;
          let osName = 'Unknown';
          let osKey = 'mac';
          if (/mac/i.test(platform)) {
            osName = 'macOS';
            osKey = 'mac';
          } else if (/win/i.test(platform)) {
            osName = 'Windows';
            osKey = 'windows';
          } else if (/linux/i.test(platform)) {
            osName = 'Linux';
            osKey = 'linux';
          } else if (/iphone|ipad|ipod/i.test(ua)) {
            osName = 'iOS / iPadOS';
            osKey = 'mobile';
          } else if (/android/i.test(platform) || /android/i.test(ua)) {
            osName = 'Android';
            osKey = 'mobile';
          }

          const fallbackBrand = (uaData && Array.isArray(uaData.brands))
            ? uaData.brands.map((item) => `${item.brand} ${item.version}`).join(', ')
            : '';
          const browserLabel = isChrome && version ? `Chrome ${version}` : fallbackBrand || (navigator.userAgent.split(' ')[0] || 'Browser detected');
          const isSupported = isChrome && version && version >= 114;

          return {
            isChrome,
            version,
            browserLabel,
            osName,
            osKey,
            isSupported,
            error: null
          };
        } catch (error) {
          console.error('Environment detection failed:', error);
          return {
            isChrome: false,
            version: null,
            browserLabel: 'Detection failed',
            osName: 'Unknown',
            osKey: 'mac',
            isSupported: false,
            error: error.message || 'Unable to detect browser environment'
          };
        }
      }

      function activateOsPanel(targetKey) {
        const resolvedKey = targetKey === 'windows' ? 'windows' : 'mac';
        osButtons.forEach((button) => {
          const key = button.dataset.osButton;
          const isActive = key === resolvedKey;
          const panelId = `os-panel-${key}`;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
          button.setAttribute('aria-selected', String(isActive));
          button.setAttribute('aria-controls', panelId);
        });
        osPanels.forEach((panel) => {
          const key = panel.dataset.osPanel;
          const isActive = key === resolvedKey;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
          panel.setAttribute('aria-hidden', String(!isActive));
        });
      }

      function renderEnvironment(info) {
        if (!info) {
          console.error('No environment info provided to renderEnvironment');
          return;
        }
        
        const chromeDownloadLink = '<a href="https://www.google.com/chrome/" target="_blank" rel="noopener">Download Chrome</a>';

        if (envCards.dev && envElements.devBadge && envElements.devValue) {
          envElements.devValue.textContent = 'Warm-up goes live in Step 3';
          envElements.devBadge.textContent = 'Pending';
          setStatusState(envCards.dev, 'is-pending');
        }

        // Handle detection errors
        if (info.error) {
          if (envElements.browserValue) {
            envElements.browserValue.textContent = 'Detection error';
          }
          if (envElements.browserBadge) {
            envElements.browserBadge.textContent = 'Error';
          }
          if (envElements.browserMeta) {
            envElements.browserMeta.innerHTML = `${info.error}. Try refreshing the page or use desktop Chrome. ${chromeDownloadLink}`;
          }
          setStatusState(envCards.browser, 'is-warning');
          
          if (envElements.osValue) {
            envElements.osValue.textContent = 'Detection error';
          }
          if (envElements.osBadge) {
            envElements.osBadge.textContent = 'Error';
          }
          if (envElements.osMeta) {
            envElements.osMeta.textContent = 'Unable to detect operating system. Please ensure you are using a modern browser.';
          }
          setStatusState(envCards.os, 'is-warning');
          return;
        }

        if (envElements.browserValue) {
          envElements.browserValue.textContent = info.browserLabel;
        }
        if (envElements.browserBadge) {
          envElements.browserBadge.textContent = info.isSupported ? 'Ready' : 'Update required';
        }
        if (envElements.browserMeta) {
          const message = info.isSupported
            ? 'Great—Chrome is ready for the OFM workspace.'
            : info.isChrome
              ? `Update to the latest desktop Chrome build before continuing. ${chromeDownloadLink}`
              : `Open this page in desktop Chrome to continue the install. ${chromeDownloadLink}`;
          envElements.browserMeta.innerHTML = message;
        }
        setStatusState(envCards.browser, info.isSupported ? 'is-success' : 'is-warning');

        if (envElements.osValue) {
          envElements.osValue.textContent = info.osName;
        }
        if (envElements.osBadge) {
          envElements.osBadge.textContent = info.osKey === 'mobile'
            ? 'Switch device'
            : info.osKey === 'linux'
              ? 'Heads up'
              : 'Detected';
        }
        if (envElements.osMeta) {
          envElements.osMeta.textContent = info.osKey === 'mobile'
            ? 'Install from a desktop environment—Chrome mobile does not support developer mode.'
            : info.osKey === 'linux'
              ? 'Linux works, though our hotline primarily supports macOS and Windows.'
              : 'You are on a supported desktop OS.';
        }
        const osState = info.osKey === 'mobile' || info.osKey === 'linux' ? 'is-warning' : 'is-success';
        setStatusState(envCards.os, osState);

        const stepZeroStatus = document.querySelector('[data-step-selector="0"] [data-step-status]');
        if (stepZeroStatus) {
          if (info.isSupported) {
            stepZeroStatus.textContent = `Ready · ${info.browserLabel}`;
          } else if (info.isChrome) {
            stepZeroStatus.textContent = `Update Chrome (current ${info.version || 'unknown'})`;
          } else {
            stepZeroStatus.textContent = 'Switch to desktop Chrome';
          }
        }

        activateOsPanel(info.osKey === 'windows' ? 'windows' : 'mac');
        updateCompletionButtons();
      }

      function canActivateStep(index) {
        if (index === activeStep) return true;
        if (index === 0) return true;
        if (!environmentInfo?.isSupported) return false;
        for (let i = 0; i < index; i += 1) {
          if (!completedSteps.has(i)) {
            return false;
          }
        }
        return true;
      }

      function updateCompletionButtons() {
        if (completionButtons[0]) {
          const ready = environmentInfo?.isSupported;
          completionButtons[0].disabled = !ready;
          completionButtons[0].setAttribute('aria-disabled', String(!ready));
          completionButtons[0].classList.toggle('is-disabled', !ready);
        }
        if (completionButtons[1]) {
          const ready = environmentInfo?.isSupported && completedSteps.has(0);
          completionButtons[1].disabled = !ready;
          completionButtons[1].setAttribute('aria-disabled', String(!ready));
          completionButtons[1].classList.toggle('is-disabled', !ready);
        }
        if (completionButtons[2]) {
          const ready = completedSteps.has(1);
          completionButtons[2].disabled = !ready;
          completionButtons[2].setAttribute('aria-disabled', String(!ready));
          completionButtons[2].classList.toggle('is-disabled', !ready);
        }
        if (completionButtons[3]) {
          const ready = completedSteps.has(2);
          completionButtons[3].disabled = !ready;
          completionButtons[3].setAttribute('aria-disabled', String(!ready));
          completionButtons[3].classList.toggle('is-disabled', !ready);
        }
      }

      function updateStepStatuses() {
        stepButtons.forEach((button, index) => {
          const status = button.querySelector('[data-step-status]');
          const isActive = index === activeStep;
          const isCompleted = completedSteps.has(index);
          const allowed = canActivateStep(index);

          button.classList.toggle('active', isActive);
          button.classList.toggle('completed', isCompleted);

          if (isActive) {
            button.setAttribute('aria-current', 'step');
          } else {
            button.removeAttribute('aria-current');
          }

          if (!isActive) {
            button.disabled = !allowed;
            button.classList.toggle('is-disabled', !allowed);
            button.setAttribute('aria-disabled', String(!allowed));
          } else {
            button.disabled = false;
            button.classList.remove('is-disabled');
            button.removeAttribute('aria-disabled');
          }

          if (status) {
            if (isCompleted) {
              status.textContent = 'Complete';
            } else if (isActive) {
              status.textContent = 'In progress';
            } else if (!allowed && index > 0) {
              status.textContent = 'Locked';
            } else {
              status.textContent = 'Ready';
            }
          }
        });
      }

      function updatePanels() {
        stepPanels.forEach((panel, index) => {
          const isActive = index === activeStep;
          panel.classList.toggle('active', isActive);
          panel.hidden = !isActive;
        });
      }

      function updateProgress() {
        const completedCount = completedSteps.size;
        const activeProgress = ((activeStep + 1) / totalSteps) * 100;
        const completionProgress = (completedCount / totalSteps) * 100;
        const width = Math.max(activeProgress, completionProgress);

        if (progressFill) {
          progressFill.style.width = `${width}%`;
        }
        if (progressLabel) {
          progressLabel.textContent = `Step ${activeStep + 1} of ${totalSteps}`;
        }
        if (progressSecondary) {
          progressSecondary.textContent = `${completedCount} step${completedCount === 1 ? '' : 's'} complete`;
        }
        if (completionBanner) {
          completionBanner.classList.toggle('visible', completedCount === totalSteps);
        }
      }

      function setActiveStep(index) {
        activeStep = Math.min(Math.max(index, 0), totalSteps - 1);
        updateStepStatuses();
        updatePanels();
        updateProgress();
        updateCompletionButtons();
        saveProgress();
      }

      stepButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const nextStep = Number(button.dataset.stepSelector);
          if (!canActivateStep(nextStep)) {
            return;
          }
          setActiveStep(nextStep);
        });
      });

      osButtons.forEach((button) => {
        button.addEventListener('click', () => {
          activateOsPanel(button.dataset.osButton);
        });
      });

      // Load saved progress before initialization
      const progressRestored = loadProgress();
      
      environmentInfo = detectEnvironment();
      renderEnvironment(environmentInfo);
      updateCompletionButtons();
      
      // Restore UI state if progress was loaded
      if (progressRestored) {
        updateStepStatuses();
        updatePanels();
        updateProgress();
      }

      document.querySelectorAll('[data-complete-step]').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.disabled) {
            return;
          }
          const stepIndex = Number(button.dataset.completeStep);
          completedSteps.add(stepIndex);
          const targetStep = stepIndex + 1 < totalSteps ? stepIndex + 1 : stepIndex;
          updateCompletionButtons();
          setActiveStep(targetStep);
          if (stepIndex === 2 && envCards.dev && envElements.devValue && envElements.devBadge) {
            envElements.devValue.textContent = 'Developer mode enabled';
            envElements.devBadge.textContent = 'Complete';
            setStatusState(envCards.dev, 'is-success');
            
            // Show celebration for completing step 3 (hardest step)
            button.textContent = '🎉 Extension loaded!';
            button.style.background = 'linear-gradient(135deg, rgba(102, 255, 203, 0.2) 0%, rgba(102, 255, 203, 0.1) 100%)';
            button.style.borderColor = 'rgba(102, 255, 203, 0.4)';
            button.style.color = 'var(--install-success)';
          }
          
          // Clear progress when all steps complete
          if (completedSteps.size === totalSteps) {
            // Celebration!
            if (completionBanner) {
              completionBanner.innerHTML = `
                <strong style="font-size: 18px;">🎉 ✓ Installation Complete!</strong>
                <p>CupidBot OFM is now active in your Chrome browser. Pin the extension icon from the puzzle menu (top-right) for quick access.</p>
              `;
            }
            setTimeout(() => clearProgress(), 5000); // Extended for celebration
          }
        });
      });

      // Crypto payment functionality - global scope
      const cryptoAddresses = {
        SOL: '5fWnYrWxZfui8286spcNe3nxFhzLEQfgbVSrU1v1qPog',
        ETH: '0x322Fbbf5cC94C80674958b53C677b2e09921270c',
        BTC: 'bc1qu2kh6dn2sea37qcjmtkdwhfa77vx2fdvlhrrpr',
        LTC: 'ltc1q3etys8n57hpe0468xrs3qg547v0a5uvq8zmqd0'
      };

      let selectedCoin = 'SOL'; // Default to SOL
      let countdownInterval = null;
      let countdownTime = 900; // 15 minutes in seconds
      let paymentStarted = false;

      function formatCountdown(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownTime = 900; // Reset to 15 minutes

        // Show countdown and status
        const countdownContainer = document.getElementById('countdown-container');
        const statusContainer = document.getElementById('status-container');
        if (countdownContainer) countdownContainer.style.display = 'block';
        if (statusContainer) statusContainer.style.display = 'block';

        countdownInterval = setInterval(() => {
          countdownTime--;
          const countdownElement = document.getElementById('countdown-timer');
          if (countdownElement) {
            countdownElement.textContent = formatCountdown(countdownTime) + ' to complete payment';
          }

          if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            const countdownElement = document.getElementById('countdown-timer');
            if (countdownElement) {
              countdownElement.textContent = '00:00 - Payment expired';
            }
          }
        }, 1000);
      }

      function updateCryptoPayment(coin) {
        console.log('Updating crypto payment for:', coin); // Debug log
        selectedCoin = coin;

        // Update active coin button
        document.querySelectorAll('.coin-card').forEach(btn => {
          const isActive = btn.dataset.coin === coin;
          btn.classList.toggle('active', isActive);
          console.log(`Coin ${btn.dataset.coin}: ${isActive ? 'active' : 'inactive'}`); // Debug log
        });

        // Update address display
        const address = cryptoAddresses[coin];
        const walletAddressElement = document.getElementById('wallet-address');
        if (walletAddressElement) {
          walletAddressElement.textContent = address;
        }

        // Update selected coin name
        const coinNameElement = document.getElementById('selected-coin-name');
        if (coinNameElement) {
          coinNameElement.textContent = coin;
        }

        // Update warning coin
        const warningCoinElement = document.getElementById('warning-coin');
        if (warningCoinElement) {
          warningCoinElement.textContent = coin;
        }
      }

      // Initialize with SOL
      updateCryptoPayment('SOL');

      const startGuide = document.getElementById('startGuide');
      if (startGuide) {
        startGuide.addEventListener('click', (event) => {
          event.preventDefault();
          document.getElementById('installGuide')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveStep(0);
      });
      }

      // Coin selection - available from page load
      document.getElementById('coin-options').addEventListener('click', function(e) {
        e.preventDefault();
        const coinCard = e.target.closest('.coin-card');
        if (coinCard && !paymentStarted) {
          const selectedCoinValue = coinCard.dataset.coin;
          console.log('Coin selected:', selectedCoinValue); // Debug log
          updateCryptoPayment(selectedCoinValue);
        }
      });

      // Purchase button - starts the payment process
      document.querySelector('.access-submit').addEventListener('click', function(e) {
        e.preventDefault();
        paymentStarted = true;
        console.log('Payment started for coin:', selectedCoin); // Debug log

        // Change button text and add spinner
        const button = e.target;
        button.innerHTML = '<div class="button-spinner"></div> Waiting for confirmations...';
        button.disabled = true;

        // Disable coin selection after payment starts
        document.querySelectorAll('.coin-card').forEach(btn => {
          btn.classList.add('disabled');
        });

        // Start countdown and show payment UI
        startCountdown();
      });

      // Copy address functionality
      document.getElementById('copy-address').addEventListener('click', function() {
        const address = cryptoAddresses[selectedCoin];
        navigator.clipboard.writeText(address).then(function() {
          const button = document.getElementById('copy-address');
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy: ', err);
        });
      });

      const downloadPackage = document.getElementById('downloadPackage');
      if (downloadPackage) {
        downloadPackage.addEventListener('click', (event) => {
          const original = downloadPackage.textContent;
          downloadPackage.textContent = 'Downloading…';
          
          // Enhanced: Provide immediate next-step guidance
          setTimeout(() => {
            downloadPackage.textContent = '✓ Downloaded';
            
            // Show enhanced instructions
            const instructionBox = document.createElement('div');
            instructionBox.className = 'install-panel_callout';
            instructionBox.style.marginTop = '16px';
            instructionBox.style.animation = 'fadeIn 0.3s ease-in';
            instructionBox.setAttribute('role', 'status');
            instructionBox.setAttribute('aria-live', 'polite');
            instructionBox.innerHTML = `
              <strong>📦 Next Steps</strong>
              <ol style="margin: 12px 0 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li>Find the downloaded ZIP file (usually in your <strong>Downloads</strong> folder)</li>
                <li>Right-click the ZIP → <strong>Extract All</strong> (Windows) or double-click (Mac)</li>
                <li>Move the extracted <code>cupidbot-extension</code> folder to your Desktop or Documents</li>
                <li>Click "Package ready" below to continue to Step 3</li>
              </ol>
            `;
            
            // Insert after download button's parent
            const parentActions = downloadPackage.closest('.install-panel_actions');
            if (parentActions && parentActions.nextElementSibling) {
              parentActions.parentNode.insertBefore(instructionBox, parentActions.nextElementSibling);
            }
          }, 900);
          
          setTimeout(() => {
            downloadPackage.textContent = original;
          }, 8000); // Extended time for user to read instructions
        });
      }

      document.querySelectorAll('[data-open-settings]').forEach((button) => {
        button.addEventListener('click', () => {
          window.open('chrome://settings/help', '_blank');
        });
      });

      document.querySelectorAll('[data-open-extensions]').forEach((button) => {
        button.addEventListener('click', () => {
          window.open('chrome://extensions/', '_blank');
          const original = button.textContent;
          button.textContent = '✓ Opened - Check new tab';
          
          // Show enhanced visual guide
          const panel = button.closest('.install-panel');
          if (panel) {
            let guideBox = panel.querySelector('.enhanced-guide');
            if (!guideBox) {
              guideBox = document.createElement('div');
              guideBox.className = 'install-panel_callout enhanced-guide';
              guideBox.style.marginTop = '20px';
              guideBox.style.animation = 'fadeIn 0.4s ease-in';
              guideBox.setAttribute('role', 'status');
              guideBox.setAttribute('aria-live', 'polite');
              guideBox.innerHTML = `
                <strong>🎯 In the new chrome://extensions tab:</strong>
                <ol style="margin: 12px 0 0; padding-left: 20px; font-size: 15px; line-height: 2; color: var(--install-text-primary);">
                  <li>Make sure <strong>Developer mode</strong> is ON (top-right toggle)</li>
                  <li>Click the <strong>"Load unpacked"</strong> button (top-left)</li>
                  <li>Navigate to and select the <strong>cupidbot-extension</strong> folder</li>
                  <li>Click <strong>"Select Folder"</strong></li>
                </ol>
                <p style="margin-top: 12px; padding: 12px; background: rgba(102, 255, 203, 0.08); border-left: 3px solid var(--install-success); font-size: 13px; border-radius: 6px;">
                  💡 <strong>Tip:</strong> The extension will appear in your extensions list immediately after selecting the folder. Come back here and click "Extension is loaded" to continue!
                </p>
              `;
              panel.appendChild(guideBox);
            }
          }
          
          setTimeout(() => {
            button.textContent = original;
          }, 4000);
        });
      });

      document.querySelectorAll('[data-open-release]').forEach((button) => {
        button.addEventListener('click', () => {
          window.open('../cupidbot-extension/manifest.json', '_blank');
        });
      });

        setActiveStep(0);
    });
