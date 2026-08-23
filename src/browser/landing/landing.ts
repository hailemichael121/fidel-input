import { CompositionEngine } from '../../engine/composition';
import { Transliterator } from '../../engine/transliterator';

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
  { name: "Cha (ቸ)", triggers: "ch, c", orders: ["ቸ (che/ce)", "蹰 (chu/cu)", "ቺ (chi/ci)", "ቻ (cha/ca)", "ቼ (chee/cee)", "ች (ch/c)", "ቾ (cho/co)", "ቿ (chwa/cwa)"] },
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

document.addEventListener('DOMContentLoaded', () => {
  const simInput = document.getElementById('sim-input') as HTMLElement;
  const simOutput = document.getElementById('sim-output') as HTMLElement;
  const simFamily = document.getElementById('sim-family') as HTMLElement;

  const sandboxInput = document.getElementById('sandbox-input') as HTMLTextAreaElement;
  const sandboxRendered = document.getElementById('sandbox-rendered') as HTMLElement;
  const btnCopySandbox = document.getElementById('btn-copy-sandbox') as HTMLButtonElement;
  const statChars = document.getElementById('stat-chars') as HTMLElement;
  const statSyllables = document.getElementById('stat-syllables') as HTMLElement;

  const matrixSearch = document.getElementById('matrix-search-input') as HTMLInputElement;
  const matrixTbody = document.getElementById('matrix-tbody') as HTMLElement;

  const transliterator = new Transliterator({
    convertPunctuation: true,
    convertNumbers: true,
    smartCorrection: true
  });

  // 1. Live Typing Simulator Animation
  const demoPhrases = [
    { text: 'selam yihun', desc: 'Family: s (Sat) → y (Yaman)' },
    { text: 'gEz qwanqwa', desc: 'Capital Vowel Split: gEz → ግእዝ' },
    { text: 't-e metahu', desc: 'Boundary Override: t-e → ትእ' },
    { text: "k'idus yared", desc: 'Glottal Stop: k\' → ቅ' },
    { text: 'enkwan des alachu', desc: '8th Order Diqala: kwa → ኳ' }
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const engine = new CompositionEngine();

  function tickSimulator() {
    const current = demoPhrases[phraseIdx];
    
    if (!isDeleting) {
      charIdx++;
      const sub = current.text.slice(0, charIdx);
      simInput.textContent = sub;

      engine.reset();
      for (const ch of sub) {
        engine.feedChar(ch);
      }
      simOutput.textContent = transliterator.transliterate(sub);
      simFamily.textContent = current.desc;

      if (charIdx === current.text.length) {
        isDeleting = true;
        setTimeout(tickSimulator, 2500);
        return;
      }
      setTimeout(tickSimulator, 110);
    } else {
      charIdx--;
      const sub = current.text.slice(0, charIdx);
      simInput.textContent = sub;
      simOutput.textContent = sub ? transliterator.transliterate(sub) : '...';

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % demoPhrases.length;
        setTimeout(tickSimulator, 400);
        return;
      }
      setTimeout(tickSimulator, 45);
    }
  }

  tickSimulator();

  // 2. Interactive Sandbox
  function updateSandbox() {
    const text = sandboxInput.value;
    if (!text.trim()) {
      sandboxRendered.textContent = 'ሰላም! እንኳን ወደ ፊደል በሰላም መጣሁ።';
      statChars.textContent = '0';
      statSyllables.textContent = '0';
      return;
    }

    const res = transliterator.transliterate(text);
    sandboxRendered.textContent = res;
    statChars.textContent = text.length.toString();
    statSyllables.textContent = res.length.toString();
  }

  sandboxInput?.addEventListener('input', updateSandbox);

  btnCopySandbox?.addEventListener('click', async () => {
    const text = sandboxRendered.textContent || '';
    if (text) {
      await navigator.clipboard.writeText(text);
      const span = btnCopySandbox.querySelector('span');
      if (span) span.textContent = 'Copied! ✓';
      setTimeout(() => {
        if (span) span.textContent = 'Copy';
      }, 1500);
    }
  });

  // 3. Render 33 Families Matrix
  function renderMatrix(filter = '') {
    matrixTbody.innerHTML = '';
    const q = filter.trim().toLowerCase();

    README_SYLLABARY_DATA.forEach((row) => {
      const fullText = `${row.name} ${row.triggers} ${row.orders.join(' ')}`.toLowerCase();
      if (q && !fullText.includes(q)) return;

      const tr = document.createElement('tr');
      const orderCells = row.orders.map((order) => {
        const parts = order.split(' ');
        const glyph = parts[0];
        const ph = parts.slice(1).join(' ');
        return `<td><span class="matrix-char-cell" data-char="${glyph}"><strong>${glyph}</strong> <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-sans)">${ph}</span></span></td>`;
      }).join('');

      tr.innerHTML = `
        <td><strong>${row.name}</strong></td>
        <td><code>${escapeHtml(row.triggers)}</code></td>
        ${orderCells}
      `;
      matrixTbody.appendChild(tr);
    });

    matrixTbody.querySelectorAll('.matrix-char-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const ch = (e.currentTarget as HTMLElement).getAttribute('data-char');
        if (ch && ch !== '—') {
          await navigator.clipboard.writeText(ch);
          (e.currentTarget as HTMLElement).style.color = '#ffffff';
          (e.currentTarget as HTMLElement).style.background = '#33333e';
          setTimeout(() => {
            (e.currentTarget as HTMLElement).style.color = '';
            (e.currentTarget as HTMLElement).style.background = '';
          }, 600);
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

  matrixSearch?.addEventListener('input', () => {
    renderMatrix(matrixSearch.value);
  });

  renderMatrix();

  // 4. Code snippet copy buttons
  document.querySelectorAll('.btn-copy-snippet').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-copy');
      if (code) {
        await navigator.clipboard.writeText(code);
        btn.innerHTML = '<span style="color:#ffffff;font-size:11px;">Copied!</span>';
        setTimeout(() => {
          btn.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        }, 1500);
      }
    });
  });
});
