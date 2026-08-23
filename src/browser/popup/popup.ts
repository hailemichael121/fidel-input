import { BrowserStorageAdapter } from '../storage/storageAdapter';
import { Transliterator } from '../../engine/transliterator';

document.addEventListener('DOMContentLoaded', async () => {
  const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
  const statusBanner = document.getElementById('status-banner') as HTMLElement;
  const statusText = document.getElementById('status-text') as HTMLElement;

  const quickInput = document.getElementById('quick-input') as HTMLInputElement;
  const quickOutput = document.getElementById('quick-output') as HTMLElement;
  const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;

  const optNumbers = document.getElementById('opt-numbers') as HTMLInputElement;
  const optPunctuation = document.getElementById('opt-punctuation') as HTMLInputElement;
  const optCorrector = document.getElementById('opt-corrector') as HTMLInputElement;

  let currentSettings = await BrowserStorageAdapter.getSettings();
  let transliterator = new Transliterator({
    convertPunctuation: currentSettings.convertPunctuation,
    convertNumbers: currentSettings.convertNumbers,
    smartCorrection: currentSettings.smartCorrection,
    dictionary: currentSettings.dictionary
  });

  function updateUi(settings: typeof currentSettings) {
    currentSettings = settings;
    toggleEnabled.checked = settings.enabled;

    if (settings.enabled) {
      statusBanner.classList.remove('disabled');
      statusText.textContent = 'Fidel Input Active';
    } else {
      statusBanner.classList.add('disabled');
      statusText.textContent = 'Fidel Input Disabled';
    }

    optNumbers.checked = settings.convertNumbers;
    optPunctuation.checked = settings.convertPunctuation;
    optCorrector.checked = settings.smartCorrection;

    transliterator = new Transliterator({
      convertPunctuation: settings.convertPunctuation,
      convertNumbers: settings.convertNumbers,
      smartCorrection: settings.smartCorrection,
      dictionary: settings.dictionary
    });

    renderQuickTransliteration();
  }

  function renderQuickTransliteration() {
    const raw = quickInput.value;
    if (!raw.trim()) {
      quickOutput.textContent = 'ሰላም ይሁን';
      return;
    }
    const res = transliterator.transliterate(raw);
    quickOutput.textContent = res;
  }

  // Initial UI populate
  updateUi(currentSettings);

  // Main Toggle
  toggleEnabled.addEventListener('change', async () => {
    const updated = await BrowserStorageAdapter.saveSettings({ enabled: toggleEnabled.checked });
    chrome.runtime.sendMessage({ type: 'SET_ENABLED', enabled: updated.enabled });
    updateUi(updated);
  });

  // Quick Input Listener
  quickInput.addEventListener('input', renderQuickTransliteration);

  // Copy to clipboard
  btnCopy.addEventListener('click', async () => {
    const text = quickOutput.textContent || '';
    if (text) {
      await navigator.clipboard.writeText(text);
      btnCopy.textContent = '✅';
      setTimeout(() => {
        btnCopy.textContent = '📋';
      }, 1500);
    }
  });

  // Options toggles
  optNumbers.addEventListener('change', async () => {
    const updated = await BrowserStorageAdapter.saveSettings({ convertNumbers: optNumbers.checked });
    updateUi(updated);
  });

  optPunctuation.addEventListener('change', async () => {
    const updated = await BrowserStorageAdapter.saveSettings({ convertPunctuation: optPunctuation.checked });
    updateUi(updated);
  });

  optCorrector.addEventListener('change', async () => {
    const updated = await BrowserStorageAdapter.saveSettings({ smartCorrection: optCorrector.checked });
    updateUi(updated);
  });
});
