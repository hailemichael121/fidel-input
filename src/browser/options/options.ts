import { BrowserStorageAdapter } from '../storage/storageAdapter';
import type { FidelBrowserSettings } from '../storage/types';
import { CompositionEngine } from '../../engine/composition';

export const README_SYLLABARY_DATA = [
  { name: "Ha (ሀ)", triggers: "h", orders: ["ሀ (ha)", "ሁ (hu)", "ሂ (hi)", "ሃ (haa)", "ሄ (he/hee)", "ህ (h)", "ሆ (ho)", "ኋ (hwa)"] },
  { name: "La (ለ)", triggers: "l", orders: ["ለ (le)", "ሉ (lu)", "ሊ (li)", "ላ (la/laa)", "ሌ (lee)", "ል (l)", "ሎ (lo)", "ሏ (lwa)"] },
  { name: "HHa (ሐ)", triggers: "H, hh", orders: ["ሐ (Ha/hha)", "ሑ (Hu/hhu)", "ሒ (Hi/hhi)", "ሓ (Haa/hhaa)", "ሔ (He/hhe/Hee)", "ሕ (H/hh)", "ሖ (Ho/hho)", "ሗ (Hwa/hhwa)"] },
  { name: "Ma (መ)", triggers: "m", orders: ["መ (me)", "ሙ (mu)", "ሚ (mi)", "ማ (ma/maa)", "ሜ (mee)", "ም (m)", "ሞ (mo)", "ሟ (mwa)"] },
  { name: "SSa (ሠ)", triggers: "S, ss, s'", orders: ["ሠ (Se/sse)", "ሡ (Su/ssu)", "ሢ (Si/ssi)", "ሣ (Sa/ssa)", "ሤ (See/ssee)", "ሥ (S/ss)", "ሦ (So/sso)", "ሧ (Swa/sswa)"] },
  { name: "Ra (ረ)", triggers: "r", orders: ["ረ (re)", "ሩ (ru)", "ሪ (ri)", "ራ (ra/raa)", "ሬ (ree)", "ር (r)", "ሮ (ro)", "ሯ (rwa)"] },
  { name: "Sa (ሰ)", triggers: "s", orders: ["ሰ (se)", "ሱ (su)", "ሲ (si)", "ሳ (sa/saa)", "ሴ (see)", "ስ (s)", "ሶ (so)", "ሷ (swa)"] },
  { name: "Sha (ሸ)", triggers: "sh, Sh", orders: ["ሸ (she)", "ሹ (shu)", "ሺ (shi)", "ሻ (sha/shaa)", "ሼ (shee)", "ሽ (sh)", "ሾ (sho)", "ሿ (shwa)"] },
  { name: "Qa (ቀ)", triggers: "q, k', K, Q", orders: ["ቀ (qe/Ke)", "ቁ (qu/Ku)", "ቂ (qi/Ki)", "ቃ (qa/Ka)", "ቄ (qee/Kee)", "ቅ (q/K)", "ቆ (qo/Ko)", "ቋ (qwa/Kwa)"] },
  { name: "Ba (በ)", triggers: "b", orders: ["በ (be)", "ቡ (bu)", "ቢ (bi)", "ባ (ba/baa)", "ቤ (bee)", "ብ (b)", "ቦ (bo)", "ቧ (bwa)"] },
  { name: "Va (ቨ)", triggers: "v, V, B, b'", orders: ["ቨ (ve/Be)", "ቩ (vu/Bu)", "ቪ (vi/Bi)", "ቫ (va/Ba)", "ቬ (vee/Bee)", "ቭ (v/B)", "ቮ (vo/Bo)", "ቯ (vwa/Bwa)"] },
  { name: "Ta (ተ)", triggers: "t", orders: ["ተ (te)", "ቱ (tu)", "ቲ (ti)", "ታ (ta/taa)", "ቴ (tee)", "ት (t)", "ቶ (to)", "ቷ (twa)"] },
  { name: "Cha (ቸ)", triggers: "ch, c", orders: ["ቸ (che/ce)", "ቹ (chu/cu)", "ቺ (chi/ci)", "ቻ (cha/ca)", "ቼ (chee/cee)", "ች (ch/c)", "ቾ (cho/co)", "ቿ (chwa/cwa)"] },
  { name: "H'a (ኀ)", triggers: "h', xh, hx", orders: ["ኀ (xha/h'a)", "ኁ (xhu/h'u)", "ኂ (xhi/h'i)", "ኃ (xhaa/h'aa)", "ኄ (xhe/h'e)", "ኅ (xh/h')", "ኆ (xho/h'o)", "ኋ (xhwa/h'wa)"] },
  { name: "Na (ነ)", triggers: "n", orders: ["ነ (ne)", "ኑ (nu)", "ኒ (ni)", "ና (na/naa)", "ኔ (nee)", "ን (n)", "ኖ (no)", "ኗ (nwa)"] },
  { name: "Nya (ኘ)", triggers: "ny, N, GN, n'", orders: ["ኘ (nye/Ne)", "ኙ (nyu/Nu)", "ኚ (nyi/Ni)", "ኛ (nya/Na)", "ጜ (nyee/Nee)", "ኝ (ny/N)", "ኞ (nyo/No)", "፝ (nywa/Nwa)"] },
  { name: "A (አ)", triggers: "a, '", orders: ["አ (a)", "ኡ (u)", "ኢ (i)", "ኣ (aa)", "ኤ (ee)", "እ (e)", "ኦ (o)", "ኧ (wa)"] },
  { name: "Ka (ከ)", triggers: "k", orders: ["ከ (ke)", "ኩ (ku)", "ኪ (ki)", "ካ (ka/kaa)", "ኬ (kee)", "ክ (k)", "ኮ (ko)", "ኳ (kwa)"] },
  { name: "KHa (ኸ)", triggers: "kh, x, X", orders: ["ኸ (khe/xe)", "ኹ (khu/xu)", "ኺ (khi/xi)", "ኻ (kha/xa)", "ኼ (khee/xee)", "ኽ (kh/x)", "ኾ (kho/xo)", "ዃ (khwa/xwa)"] },
  { name: "Wa (ወ)", triggers: "w", orders: ["ወ (we)", "ዉ (wu)", "ዊ (wi)", "ዋ (wa/waa)", "ዌ (wee)", "ው (w)", "ዎ (wo)", "—"] },
  { name: "AHa (ዐ)", triggers: "A, ah, a'", orders: ["ዐ (Aa/aha)", "ዑ (Au/ahu)", "ዒ (Ai/ahi)", "ዓ (Aaa/ahaa)", "ዔ (Ae/ahe)", "ዕ (A/ah)", "ዖ (Ao/aho)", "—"] },
  { name: "Za (ዘ)", triggers: "z", orders: ["ዘ (ze)", "ዙ (zu)", "ዚ (zi)", "ዛ (za)", "ዜ (zee)", "ዝ (z)", "ዞ (zo)", "ዟ (zwa)"] },
  { name: "ZHa (ዠ)", triggers: "zh, Z, z'", orders: ["ዠ (zhe/Ze)", "ዡ (zhu/Zu)", "ዢ (zhi/Zi)", "ዣ (zha/Za)", "ዤ (zhee/Zee)", "ዥ (zh/Z)", "ዦ (zho/Zo)", "ዧ (zhwa/Zwa)"] },
  { name: "Ya (የ)", triggers: "y", orders: ["የ (ye)", "ዩ (yu)", "ይ (yi)", "ያ (ya)", "ዬ (yee)", "ይ (y)", "ዮ (yo)", "—"] },
  { name: "Da (ደ)", triggers: "d", orders: ["ደ (de)", "ዱ (du)", "ዲ (di)", "ዳ (da)", "ዴ (dee)", "ድ (d)", "ዶ (do)", "ዷ (dwa)"] },
  { name: "Ja (ጀ)", triggers: "j", orders: ["ጀ (je)", "ጁ (ju)", "ጂ (ji)", "ጃ (ja)", "ጄ (jee)", "ጅ (j)", "ጆ (jo)", "ጇ (jwa)"] },
  { name: "Ga (ገ)", triggers: "g", orders: ["ገ (ge)", "ጉ (gu)", "ጊ (gi)", "ጋ (ga)", "ጌ (gee)", "ግ (g)", "ጎ (go)", "ጓ (gwa)"] },
  { name: "T'a (ጠ)", triggers: "T, t'", orders: ["ጠ (Te/t'e)", "ጡ (Tu/t'u)", "ጢ (Ti/t'i)", "ጣ (Ta/t'a)", "ጤ (Tee/t'ee)", "ጥ (T/t')", "ጦ (To/t'o)", "ጧ (Twa/t'wa)"] },
  { name: "C'a (ጨ)", triggers: "C, CH, c'", orders: ["ጨ (Ce/c'e)", "ጩ (Cu/c'u)", "ጪ (Ci/c'i)", "ጫ (Ca/c'a)", "ጬ (Cee/c'ee)", "ጭ (C/c')", "ጮ (Co/c'o)", "ጯ (Cwa/c'wa)"] },
  { name: "P'a (ጰ)", triggers: "P, p'", orders: ["ጰ (Pe/p'e)", "ጱ (Pu/p'u)", "ጲ (Pi/p'i)", "ጳ (Pa/p'a)", "ጴ (Pee/p'ee)", "ጵ (P/p')", "ጶ (Po/p'o)", "ጷ (Pwa/p'wa)"] },
  { name: "TSa (ጸ)", triggers: "ts, Ts, Tz, S'", orders: ["ጸ (tse)", "ጹ (tsu)", "ጺ (tsi)", "ጻ (tsa)", "ጼ (tsee)", "ጽ (ts)", "ጾ (tso)", "ጿ (tswa)"] },
  { name: "TZa (ፀ)", triggers: "tz, TZ, ts'", orders: ["ፀ (tze/TZe)", "ፁ (tzu/TZu)", "ፂ (tzi/TZi)", "ፃ (tza/TZa)", "ፄ (tzee/TZee)", "ፅ (tz/TZ)", "ፆ (tzo/TZo)", "—"] },
  { name: "Fa (ፈ)", triggers: "f", orders: ["ፈ (fe)", "ፉ (fu)", "ፊ (fi)", "ፋ (fa)", "ፌ (fee)", "ፍ (f)", "ፎ (fo)", "ፏ (fwa)"] },
  { name: "Pa (ፐ)", triggers: "p", orders: ["ፐ (pe)", "ፑ (pu)", "ፒ (pi)", "ፓ (pa)", "ፔ (pee)", "ፕ (p)", "ፖ (po)", "ፗ (pwa)"] }
];

async function initOptions() {
  // Theme Management
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('fidel_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fidel_theme', next);
  });

  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  const testInput = document.getElementById('test-typing-input') as HTMLInputElement;
  const testOutput = document.getElementById('test-typing-output') as HTMLElement;
  const testBreakdown = document.getElementById('test-typing-breakdown') as HTMLElement;

  const modeRadios = document.querySelectorAll('input[name="syllable-mode"]') as NodeListOf<HTMLInputElement>;
  const boundaryChar = document.getElementById('boundary-char') as HTMLInputElement;
  const mergeChar = document.getElementById('merge-char') as HTMLInputElement;

  const formDictAdd = document.getElementById('form-dict-add') as HTMLFormElement;
  const dictKey = document.getElementById('dict-key') as HTMLInputElement;
  const dictVal = document.getElementById('dict-val') as HTMLInputElement;
  const dictSearch = document.getElementById('dict-search') as HTMLInputElement;
  const dictRows = document.getElementById('dict-rows') as HTMLElement;
  const btnExportDict = document.getElementById('btn-export-dict') as HTMLButtonElement;
  const fileImportDict = document.getElementById('file-import-dict') as HTMLInputElement;

  const syllabarySearch = document.getElementById('syllabary-search') as HTMLInputElement;
  const syllabaryTbody = document.getElementById('syllabary-tbody') as HTMLElement;

  const checkNumbers = document.getElementById('check-numbers') as HTMLInputElement;
  const checkPunctuation = document.getElementById('check-punctuation') as HTMLInputElement;
  const checkCorrector = document.getElementById('check-corrector') as HTMLInputElement;
  const disabledDomains = document.getElementById('disabled-domains') as HTMLTextAreaElement;

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

  // Tab Navigation
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

  // Interactive Typing Tester
  function updateTestTyping() {
    if (!testInput || !testOutput) return;
    const raw = testInput.value;
    testEngine.reset();
    let lastState = { raw: '', rendered: '', replaceLength: 0 };

    for (const ch of raw) {
      lastState = testEngine.feedChar(ch);
    }

    testOutput.textContent = lastState.rendered || '...';
    if (!testBreakdown) return;
    const code = document.createElement('code');
    if (raw.length > 0) {
      code.append(`"${raw}"`, ' → ', lastState.rendered);
    } else {
      code.textContent = 'Live phoneme decomposition preview';
    }
    testBreakdown.replaceChildren(code);
  }

  testInput?.addEventListener('input', updateTestTyping);

  function populateUi(settings: FidelBrowserSettings) {
    currentSettings = settings;

    modeRadios.forEach((r) => {
      r.checked = r.value === settings.defaultSyllableMerging;
    });

    if (boundaryChar) boundaryChar.value = settings.compositionBoundaryChar || '-';
    if (mergeChar) mergeChar.value = settings.compositionMergeChar || '+';

    if (checkNumbers) checkNumbers.checked = settings.convertNumbers;
    if (checkPunctuation) checkPunctuation.checked = settings.convertPunctuation;
    if (checkCorrector) checkCorrector.checked = settings.smartCorrection;

    if (disabledDomains) disabledDomains.value = (settings.disabledDomains || []).join('\n');

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

  // Dictionary Management
  function renderDictionaryTable(filter = '') {
    if (!dictRows) return;
    dictRows.replaceChildren();
    const entries = Object.entries(currentSettings.dictionary || {});
    const filtered = entries.filter(([k, v]) => 
      k.toLowerCase().includes(filter.toLowerCase()) || v.includes(filter)
    );

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.className = 'table-empty';
      td.textContent = filter ? 'No matching dictionary items.' : 'No custom mappings registered.';
      tr.appendChild(td);
      dictRows.appendChild(tr);
      return;
    }

    filtered.forEach(([key, val]) => {
      const tr = document.createElement('tr');

      const keyCell = document.createElement('td');
      const keyCode = document.createElement('code');
      keyCode.textContent = key;
      keyCell.appendChild(keyCode);

      const valCell = document.createElement('td');
      const valStrong = document.createElement('strong');
      valStrong.className = 'font-ethiopic';
      valStrong.textContent = val;
      valCell.appendChild(valStrong);

      const actionCell = document.createElement('td');
      actionCell.className = 'td-actions';
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-del';
      delBtn.dataset.key = key;
      delBtn.title = 'Delete entry';
      delBtn.appendChild(trashIcon());
      actionCell.appendChild(delBtn);

      tr.append(keyCell, valCell, actionCell);
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

  // 33 Families Syllabary Renderer with Click-to-Copy Notice
  function renderSyllabary(filter = '') {
    if (!syllabaryTbody) return;
    syllabaryTbody.replaceChildren();
    const q = filter.trim().toLowerCase();

    README_SYLLABARY_DATA.forEach((row) => {
      const fullText = `${row.name} ${row.triggers} ${row.orders.join(' ')}`.toLowerCase();
      if (q && !fullText.includes(q)) return;

      const tr = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.className = 'family-name-cell';
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = row.name;
      nameCell.appendChild(nameStrong);

      const triggerCell = document.createElement('td');
      triggerCell.className = 'family-trigger-cell';
      const triggerCode = document.createElement('code');
      triggerCode.textContent = row.triggers;
      triggerCell.appendChild(triggerCode);

      tr.append(nameCell, triggerCell);
      for (const order of row.orders) {
        tr.appendChild(syllabaryOrderCell(order));
      }
      syllabaryTbody.appendChild(tr);
    });

    syllabaryTbody.querySelectorAll('.syllabary-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const targetBtn = (e.currentTarget as HTMLElement);
        const ch = targetBtn.getAttribute('data-char');
        if (ch && ch !== '—') {
          await navigator.clipboard.writeText(ch);
          targetBtn.classList.add('copied');
          setTimeout(() => {
            targetBtn.classList.remove('copied');
          }, 1200);

          if (testInput) {
            testInput.value = ch;
            updateTestTyping();
          }
          showToast(`Copied ${ch} to clipboard! ✓`);
        }
      });
    });
  }

  syllabarySearch?.addEventListener('input', () => {
    renderSyllabary(syllabarySearch.value);
  });

  // Save Settings
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
    showToast('All settings saved successfully! ✓');
  });

  function showToast(msg: string) {
    if (!saveStatus) return;
    saveStatus.textContent = msg;
    setTimeout(() => {
      if (saveStatus.textContent === msg) saveStatus.textContent = '';
    }, 2500);
  }

  function trashIcon(): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'btn-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '3 6 5 6 21 6');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2');
    svg.append(polyline, path);
    return svg;
  }

  function syllabaryOrderCell(order: string): HTMLTableCellElement {
    const parts = order.split(' ');
    const glyph = parts[0] ?? '';
    const ph = parts.slice(1).join(' ');
    const td = document.createElement('td');
    if (glyph === '—') {
      const dash = document.createElement('span');
      dash.className = 'matrix-dash';
      dash.textContent = '—';
      td.appendChild(dash);
      return td;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'syllabary-cell';
    button.dataset.char = glyph;
    button.title = `Click to copy ${glyph}`;
    const glyphSpan = document.createElement('span');
    glyphSpan.className = 'cell-glyph';
    glyphSpan.textContent = glyph;
    const phSpan = document.createElement('span');
    phSpan.className = 'cell-ph';
    phSpan.textContent = ph;
    const toast = document.createElement('span');
    toast.className = 'cell-toast';
    toast.textContent = 'Copied! ✓';
    button.append(glyphSpan, phSpan, toast);
    td.appendChild(button);
    return td;
  }

  // Initial populate
  populateUi(currentSettings);
  renderSyllabary();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOptions);
} else {
  initOptions();
}
