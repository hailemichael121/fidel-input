import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { FidelBrowserSettings } from '../storage/types';
import { CompositionEngine } from '../../engine/composition';
import { FIDEL_FAMILIES } from '../../engine/mapping';

document.addEventListener('DOMContentLoaded', async () => {
  // Tab Elements
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Interactive Tester Elements
  const testInput = document.getElementById('test-typing-input') as HTMLInputElement;
  const testOutput = document.getElementById('test-typing-output') as HTMLElement;
  const testBreakdown = document.getElementById('test-typing-breakdown') as HTMLElement;

  // Mode Radio & Override inputs
  const modeRadios = document.querySelectorAll('input[name="syllable-mode"]') as NodeListOf<HTMLInputElement>;
  const boundaryChar = document.getElementById('boundary-char') as HTMLInputElement;
  const mergeChar = document.getElementById('merge-char') as HTMLInputElement;

  // Dictionary Elements
  const formDictAdd = document.getElementById('form-dict-add') as HTMLFormElement;
  const dictKey = document.getElementById('dict-key') as HTMLInputElement;
  const dictVal = document.getElementById('dict-val') as HTMLInputElement;
  const dictSearch = document.getElementById('dict-search') as HTMLInputElement;
  const dictRows = document.getElementById('dict-rows') as HTMLElement;
  const btnExportDict = document.getElementById('btn-export-dict') as HTMLButtonElement;
  const fileImportDict = document.getElementById('file-import-dict') as HTMLInputElement;

  // Syllabary Elements
  const syllabarySearch = document.getElementById('syllabary-search') as HTMLInputElement;
  const syllabaryTbody = document.getElementById('syllabary-tbody') as HTMLElement;

  // Rules Elements
  const checkNumbers = document.getElementById('check-numbers') as HTMLInputElement;
  const checkPunctuation = document.getElementById('check-punctuation') as HTMLInputElement;
  const checkCorrector = document.getElementById('check-corrector') as HTMLInputElement;
  const disabledDomains = document.getElementById('disabled-domains') as HTMLTextAreaElement;

  // Save elements
  const btnSaveAll = document.getElementById('btn-save-all') as HTMLButtonElement;
  const saveStatus = document.getElementById('save-status') as HTMLElement;

  let currentSettings: FidelBrowserSettings = await BrowserStorageAdapter.getSettings();
  let testEngine = new CompositionEngine({
    convertPunctuation: currentSettings.convertPunctuation,
    convertNumbers: currentSettings.convertNumbers,
    defaultSyllableMerging: currentSettings.defaultSyllableMerging,
    compositionBoundaryChar: currentSettings.compositionBoundaryChar,
    compositionMergeChar: currentSettings.compositionMergeChar,
    dictionary: currentSettings.dictionary
  });

  // 1. Tab Switching
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (!targetTab) return;

      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });

  // 2. Interactive Typing Tester
  function updateTestTyping() {
    const raw = testInput.value;
    testEngine.reset();
    let lastState = { raw: '', rendered: '', replaceLength: 0 };

    for (const ch of raw) {
      lastState = testEngine.feedChar(ch);
    }

    testOutput.textContent = lastState.rendered || '...';
    if (raw.length > 0) {
      testBreakdown.innerHTML = `<code>"${escapeHtml(raw)}" &rarr; ${escapeHtml(lastState.rendered)}</code>`;
    } else {
      testBreakdown.innerHTML = `<code>Live phoneme decomposition preview</code>`;
    }
  }

  testInput?.addEventListener('input', updateTestTyping);

  // 3. Populate Settings UI
  function populateUi(settings: FidelBrowserSettings) {
    currentSettings = settings;

    modeRadios.forEach((r) => {
      r.checked = r.value === settings.defaultSyllableMerging;
    });

    boundaryChar.value = settings.compositionBoundaryChar || '-';
    mergeChar.value = settings.compositionMergeChar || '+';

    checkNumbers.checked = settings.convertNumbers;
    checkPunctuation.checked = settings.convertPunctuation;
    checkCorrector.checked = settings.smartCorrection;

    disabledDomains.value = (settings.disabledDomains || []).join('\n');

    testEngine = new CompositionEngine({
      convertPunctuation: settings.convertPunctuation,
      convertNumbers: settings.convertNumbers,
      defaultSyllableMerging: settings.defaultSyllableMerging,
      compositionBoundaryChar: settings.compositionBoundaryChar,
      compositionMergeChar: settings.compositionMergeChar,
      dictionary: settings.dictionary
    });

    renderDictionaryTable();
    updateTestTyping();
  }

  // 4. Dictionary Table Rendering & Search
  function renderDictionaryTable(filter = '') {
    dictRows.innerHTML = '';
    const entries = Object.entries(currentSettings.dictionary || {});
    const filtered = entries.filter(([k, v]) => 
      k.toLowerCase().includes(filter.toLowerCase()) || v.includes(filter)
    );

    if (filtered.length === 0) {
      dictRows.innerHTML = `<tr><td colspan="3" class="table-empty">${filter ? 'No matching dictionary items.' : 'No custom mappings registered.'}</td></tr>`;
      return;
    }

    filtered.forEach(([key, val]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${escapeHtml(key)}</code></td>
        <td><strong class="font-ethiopic">${escapeHtml(val)}</strong></td>
        <td class="td-actions">
          <button class="btn-del" data-key="${escapeHtml(key)}" title="Delete entry">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      dictRows.appendChild(tr);
    });

    dictRows.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const key = (e.currentTarget as HTMLElement).getAttribute('data-key');
        if (key && currentSettings.dictionary[key]) {
          delete currentSettings.dictionary[key];
          await BrowserStorageAdapter.saveSettings({ dictionary: currentSettings.dictionary });
          renderDictionaryTable(dictSearch.value);
          showToast('Dictionary entry removed');
        }
      });
    });
  }

  dictSearch?.addEventListener('input', () => {
    renderDictionaryTable(dictSearch.value.trim());
  });

  formDictAdd?.addEventListener('submit', async (e) => {
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
      renderDictionaryTable(dictSearch.value);
      showToast(`Added mapping: ${key} → ${val}`);
    }
  });

  // Export JSON
  btnExportDict?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSettings.dictionary, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'fidel-dictionary.json');
    dlAnchor.click();
    dlAnchor.remove();
  });

  // Import JSON
  fileImportDict?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (typeof imported === 'object' && imported !== null) {
          currentSettings.dictionary = { ...currentSettings.dictionary, ...imported };
          await BrowserStorageAdapter.saveSettings({ dictionary: currentSettings.dictionary });
          renderDictionaryTable();
          showToast('Dictionary imported successfully!');
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  });

  // 5. Populate Syllabary Matrix
  const primaryFamilies = [
    { root: 'h', name: 'ሀ (Hoy)' },
    { root: 'l', name: 'ለ (Lawi)' },
    { root: 'H', name: 'ሐ (Hamer)' },
    { root: 'm', name: 'መ (May)' },
    { root: 'S', name: 'ሠ (Sawt)' },
    { root: 'r', name: 'ረ (Rees)' },
    { root: 's', name: 'ሰ (Sat)' },
    { root: 'sh', name: 'ሸ (Sha)' },
    { root: 'q', name: 'ቀ (Qaf)' },
    { root: 'b', name: 'በ (Bet)' },
    { root: 'v', name: 'ቨ (Ve)' },
    { root: 't', name: 'ተ (Taw)' },
    { root: 'ch', name: 'ቸ (Chaw)' },
    { root: 'hx', name: 'ኀ (Harm)' },
    { root: 'n', name: 'ነ (Nehas)' },
    { root: 'ny', name: 'ኘ (Nye)' },
    { root: "'", name: 'አ (Alef)' },
    { root: 'k', name: 'ከ (Kaf)' },
    { root: 'kh', name: 'ኸ (Kha)' },
    { root: 'w', name: 'ወ (Wawe)' },
    { root: 'A', name: 'ዐ (Ayn)' },
    { root: 'z', name: 'ዘ (Zey)' },
    { root: 'zh', name: 'ዠ (Zhe)' },
    { root: 'y', name: 'የ (Yaman)' },
    { root: 'd', name: 'ደ (Dent)' },
    { root: 'j', name: 'ጀ (Jent)' },
    { root: 'g', name: 'ገ (Geml)' },
    { root: 'T', name: 'ጠ (T' + "'" + 'ayt)' },
    { root: 'C', name: 'ጨ (Ch' + "'" + 'ayt)' },
    { root: 'P', name: 'ጰ (P' + "'" + 'ayt)' },
    { root: 'ts', name: 'ጸ (Tsedey)' },
    { root: 'tz', name: 'ፀ (Tseppa)' },
    { root: 'f', name: 'ፈ (Af)' },
    { root: 'p', name: 'ፐ (Psa)' }
  ];

  function renderSyllabary(filter = '') {
    syllabaryTbody.innerHTML = '';
    const q = filter.trim().toLowerCase();

    primaryFamilies.forEach(({ root, name }) => {
      const fam = FIDEL_FAMILIES[root];
      if (!fam) return;

      const fullText = `${name} ${root} ${fam.e} ${fam.u} ${fam.i} ${fam.a} ${fam.ee} ${fam['']} ${fam.o} ${fam.wa || ''}`.toLowerCase();
      if (q && !fullText.includes(q)) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${name} <span style="font-size:10px;color:var(--text-muted)">(${root})</span></td>
        <td><span class="syllabary-cell" data-char="${fam.e}">${fam.e}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.u}">${fam.u}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.i}">${fam.i}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.a}">${fam.a}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.ee}">${fam.ee}</span></td>
        <td><span class="syllabary-cell" data-char="${fam['']}">${fam['']}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.o}">${fam.o}</span></td>
        <td><span class="syllabary-cell" data-char="${fam.wa || '-'}">${fam.wa || '-'}</span></td>
      `;
      syllabaryTbody.appendChild(tr);
    });

    syllabaryTbody.querySelectorAll('.syllabary-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const ch = (e.currentTarget as HTMLElement).getAttribute('data-char');
        if (ch && ch !== '-') {
          await navigator.clipboard.writeText(ch);
          showToast(`Copied ${ch} to clipboard!`);
        }
      });
    });
  }

  syllabarySearch?.addEventListener('input', () => {
    renderSyllabary(syllabarySearch.value);
  });

  // 6. Save All Settings
  btnSaveAll?.addEventListener('click', async () => {
    let selectedMode: 'merge' | 'standalone' = 'merge';
    modeRadios.forEach((r) => {
      if (r.checked) selectedMode = r.value as 'merge' | 'standalone';
    });

    const domains = disabledDomains.value
      .split('\n')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const updated = await BrowserStorageAdapter.saveSettings({
      defaultSyllableMerging: selectedMode,
      compositionBoundaryChar: boundaryChar.value || '-',
      compositionMergeChar: mergeChar.value || '+',
      convertNumbers: checkNumbers.checked,
      convertPunctuation: checkPunctuation.checked,
      smartCorrection: checkCorrector.checked,
      disabledDomains: domains
    });

    populateUi(updated);
    showToast('All settings saved successfully! ✅');
  });

  function showToast(msg: string) {
    saveStatus.textContent = msg;
    setTimeout(() => {
      if (saveStatus.textContent === msg) saveStatus.textContent = '';
    }, 2500);
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

  // Initial Load
  populateUi(currentSettings);
  renderSyllabary();
});
