import { BrowserStorageAdapter } from '../storage/storageAdapter';
import { Transliterator } from '../../engine/transliterator';

document.addEventListener('DOMContentLoaded', async () => {
  // Theme Management
  const themeToggleBtn = document.getElementById('popup-theme-toggle') as HTMLButtonElement;
  const savedTheme = localStorage.getItem('fidel_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fidel_theme', next);
  });

  const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
  const statusBanner = document.getElementById('status-banner') as HTMLElement;
  const statusLabel = document.getElementById('status-label') as HTMLElement;

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
      statusLabel.textContent = 'Active • Amharic Mode';
    } else {
      statusBanner.classList.add('disabled');
      statusLabel.textContent = 'Disabled • Latin Passthrough';
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

  // Initial population
  updateUi(currentSettings);

  // Toggle switch listener
  toggleEnabled.addEventListener('change', async () => {
    const updated = await BrowserStorageAdapter.saveSettings({ enabled: toggleEnabled.checked });
    chrome.runtime.sendMessage({ type: 'SET_ENABLED', enabled: updated.enabled });
    updateUi(updated);
  });

  // Live input
  quickInput.addEventListener('input', renderQuickTransliteration);

  // Copy with SVG checkmark animation
  btnCopy.addEventListener('click', async () => {
    const text = quickOutput.textContent || '';
    if (text) {
      await navigator.clipboard.writeText(text);
      btnCopy.classList.add('copied');
      setTimeout(() => {
        btnCopy.classList.remove('copied');
      }, 1500);
    }
  });

  // Quick settings toggles
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
