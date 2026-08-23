import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { FidelBrowserSettings } from '../storage/types';

document.addEventListener('DOMContentLoaded', async () => {
  const syllableMerging = document.getElementById('syllable-merging') as HTMLSelectElement;
  const boundaryChar = document.getElementById('boundary-char') as HTMLInputElement;
  const mergeChar = document.getElementById('merge-char') as HTMLInputElement;

  const checkNumbers = document.getElementById('check-numbers') as HTMLInputElement;
  const checkPunctuation = document.getElementById('check-punctuation') as HTMLInputElement;
  const checkCorrector = document.getElementById('check-corrector') as HTMLInputElement;

  const formAddDict = document.getElementById('form-add-dict') as HTMLFormElement;
  const dictKey = document.getElementById('dict-key') as HTMLInputElement;
  const dictVal = document.getElementById('dict-val') as HTMLInputElement;
  const dictTableBody = document.getElementById('dict-table-body') as HTMLElement;

  const disabledDomains = document.getElementById('disabled-domains') as HTMLTextAreaElement;

  const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
  const saveStatus = document.getElementById('save-status') as HTMLElement;

  let currentSettings: FidelBrowserSettings = await BrowserStorageAdapter.getSettings();

  function renderDictionaryTable() {
    dictTableBody.innerHTML = '';
    const entries = Object.entries(currentSettings.dictionary || {});

    if (entries.length === 0) {
      dictTableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No custom entries yet.</td></tr>';
      return;
    }

    entries.forEach(([key, val]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${escapeHtml(key)}</code></td>
        <td><strong>${escapeHtml(val)}</strong></td>
        <td><button class="btn-danger-sm" data-key="${escapeHtml(key)}">Delete</button></td>
      `;
      dictTableBody.appendChild(tr);
    });

    dictTableBody.querySelectorAll('.btn-danger-sm').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-key');
        if (key && currentSettings.dictionary[key]) {
          delete currentSettings.dictionary[key];
          await BrowserStorageAdapter.saveSettings({ dictionary: currentSettings.dictionary });
          renderDictionaryTable();
          showStatus('Dictionary updated!');
        }
      });
    });
  }

  function escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m));
  }

  function showStatus(msg: string) {
    saveStatus.textContent = msg;
    setTimeout(() => {
      if (saveStatus.textContent === msg) saveStatus.textContent = '';
    }, 2500);
  }

  // Populate initial values
  syllableMerging.value = currentSettings.defaultSyllableMerging || 'merge';
  boundaryChar.value = currentSettings.compositionBoundaryChar || '-';
  mergeChar.value = currentSettings.compositionMergeChar || '+';

  checkNumbers.checked = currentSettings.convertNumbers;
  checkPunctuation.checked = currentSettings.convertPunctuation;
  checkCorrector.checked = currentSettings.smartCorrection;

  disabledDomains.value = (currentSettings.disabledDomains || []).join('\n');

  renderDictionaryTable();

  // Add dictionary entry
  formAddDict.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = dictKey.value.trim().toLowerCase();
    const val = dictVal.value.trim();

    if (key && val) {
      currentSettings.dictionary = {
        ...(currentSettings.dictionary || {}),
        [key]: val
      };
      await BrowserStorageAdapter.saveSettings({ dictionary: currentSettings.dictionary });
      dictKey.value = '';
      dictVal.value = '';
      renderDictionaryTable();
      showStatus('Added to dictionary!');
    }
  });

  // Save full settings
  btnSave.addEventListener('click', async () => {
    const domains = disabledDomains.value
      .split('\n')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const updated = await BrowserStorageAdapter.saveSettings({
      defaultSyllableMerging: syllableMerging.value as 'merge' | 'standalone',
      compositionBoundaryChar: boundaryChar.value || '-',
      compositionMergeChar: mergeChar.value || '+',
      convertNumbers: checkNumbers.checked,
      convertPunctuation: checkPunctuation.checked,
      smartCorrection: checkCorrector.checked,
      disabledDomains: domains
    });

    currentSettings = updated;
    showStatus('All settings saved successfully! ✅');
  });
});
