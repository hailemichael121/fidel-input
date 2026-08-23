import { CompositionEngine } from '../../engine/composition';
import { Transliterator } from '../../engine/transliterator';
import { FIDEL_FAMILIES } from '../../engine/mapping';

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

      // Run through composition engine
      engine.reset();
      let state = { raw: '', rendered: '', replaceLength: 0 };
      for (const ch of sub) {
        state = engine.feedChar(ch);
      }
      simOutput.textContent = transliterator.transliterate(sub);
      simFamily.textContent = current.desc;

      if (charIdx === current.text.length) {
        isDeleting = true;
        setTimeout(tickSimulator, 2500); // Pause on completed word
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

  // 3. Render Matrix Table
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
    { root: 'T', name: 'ጠ (T\'ayt)' },
    { root: 'C', name: 'ጨ (Ch\'ayt)' },
    { root: 'P', name: 'ጰ (P\'ayt)' },
    { root: 'ts', name: 'ጸ (Tsedey)' },
    { root: 'tz', name: 'ፀ (Tseppa)' },
    { root: 'f', name: 'ፈ (Af)' },
    { root: 'p', name: 'ፐ (Psa)' }
  ];

  function renderMatrix(filter = '') {
    matrixTbody.innerHTML = '';
    const q = filter.trim().toLowerCase();

    primaryFamilies.forEach(({ root, name }) => {
      const fam = FIDEL_FAMILIES[root];
      if (!fam) return;

      const fullText = `${name} ${root} ${fam.e} ${fam.u} ${fam.i} ${fam.a} ${fam.ee} ${fam['']} ${fam.o} ${fam.wa || ''}`.toLowerCase();
      if (q && !fullText.includes(q)) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${name} <span style="font-size:10px;color:var(--text-muted);font-weight:normal;">(${root})</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.e}">${fam.e}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.u}">${fam.u}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.i}">${fam.i}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.a}">${fam.a}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.ee}">${fam.ee}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam['']}">${fam['']}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.o}">${fam.o}</span></td>
        <td><span class="matrix-char-cell" data-char="${fam.wa || '-'}">${fam.wa || '-'}</span></td>
      `;
      matrixTbody.appendChild(tr);
    });

    matrixTbody.querySelectorAll('.matrix-char-cell').forEach((cell) => {
      cell.addEventListener('click', async (e) => {
        const ch = (e.currentTarget as HTMLElement).getAttribute('data-char');
        if (ch && ch !== '-') {
          await navigator.clipboard.writeText(ch);
          (e.currentTarget as HTMLElement).style.color = '#38bdf8';
          setTimeout(() => {
            (e.currentTarget as HTMLElement).style.color = '';
          }, 600);
        }
      });
    });
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
        btn.innerHTML = '<span style="color:#10b981;font-size:11px;">Copied!</span>';
        setTimeout(() => {
          btn.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
        }, 1500);
      }
    });
  });
});
