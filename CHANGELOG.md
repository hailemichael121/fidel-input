# Changelog

All notable changes to the **Fidel Input (ፊደል)** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-08-14

### Added
- **Segmented Incremental Composition Buffer**: Architectural rewrite of `CompositionEngine` using decoupled `lockedOutput` (immutable committed syllables) and `pendingFragment` (active bounded syllable matching), ensuring O(1) per-keystroke matching and zero full-word re-scanning.
- **Configurable Syllable Merge vs Standalone Mode (`fidel.defaultSyllableMerging`)**: Global setting (`"merge"` or `"standalone"`) controlling whether ambiguous consonant+vowel sequences like `te` default to merged syllable `ተ` or standalone pair `ትእ`.
- **Explicit Syllable Boundary (`-`) & Merge (`+`) Overrides**:
  - `"-"` (`fidel.compositionBoundaryChar`): Immediately commits the active syllable without inserting the character (e.g. `t-e` → `ትእ`, `t-a` → `ትአ`).
  - `"+"` (`fidel.compositionMergeChar`): Forces merging into a single syllable under standalone mode (e.g. `t+e` → `ተ`).
- **Capital Vowel Shorthand (`E`, `I`, `U`, `O`)**: Always-available, mode-independent shortcut for typing 6th-order consonant + standalone vowel splits without boundary keys (e.g. `tE` → `ትእ`, `gEz` → `ግእዝ`, `tEgst` → `ትእግስት`, `tI` → `ትኢ`, `tU` → `ትኡ`, `tO` → `ትኦ`).
- **Post-Commit Hover Disambiguation Provider (`AmbiguityHoverProvider`)**: Non-intrusive tooltip on ambiguous committed words offering a one-click action to swap interpretations (`[Use "ትእ" instead]`).
- **Completion Provider Disambiguation Candidate**: Live IntelliSense suggestion item for ambiguous syllables surfacing the standalone split alternative and shortcut tip.
- **Single-Character Exact Backspacing**: Guaranteed 1-character buffer pop per backspace press without output-comparison while loops or skipped characters.
- **Async Task Queue Serialization**: FIFO Promise queue in `InputInterceptor` serializing all `type` and `fidel.deleteLeft` commands to prevent concurrency races during fast typing.

### Changed & Fixed
- **Standalone Vowels Expansion Fix**: Fixed off-by-one vowel expansion where `ee` previously mapped to `እ` and `eee` to `ኤ`. Both small `e`/`ee` and capital `E`/`EE` now cleanly produce `እ`/`ኤ` with 100% mathematical symmetry.
- **8th-Order Labialized Direct Suffix (`w`)**: Direct `w` suffix mapping for 8th-order labialized letters (`sw` → `ሷ`, `lw` → `ሏ`, `mw` → `ሟ`, `kw` → `ኳ`), completely removing residual `wa`/`oa` duplicate keys.
- **Hot-Path Zero Allocations**: Extracted trie lookup helpers in `Transliterator`, eliminating runtime `new Transliterator(...)` allocations during smart correction.

---

## [0.2.1] - 2026-08-13

### Added
- **Homophone & Alternate Root Triggers**: Full support for quick SERA uppercase, apostrophe, and alternate root triggers to distinguish similar-sounding Ethiopic letters directly:
  - `A` / `ah` / `a'` → **ዐ** (vs `a` → **አ**)
  - `S` / `ss` / `s'` → **ሠ** (vs `s` → **ሰ**)
  - `C` / `CH` / `c'` → **ጨ** (vs `c` / `ch` → **ቸ**)
  - `T` / `t'` → **ጠ** (vs `t` → **ተ**)
  - `K` / `q` / `k'` / `Q` → **ቀ** (vs `k` → **ከ**) and `x` / `kh` / `X` → **ኸ**
  - `B` / `v` / `V` / `b'` → **ቨ** (vs `b` → **በ**)
  - `tz` / `TZ` / `ts'` → **ፀ** (vs `ts` / `Ts` / `Tz` → **ጸ**)
  - `P` / `p'` → **ጰ** (vs `p` → **ፐ**)
  - `Z` / `zh` / `z'` → **ዠ** (vs `z` → **ዘ**)
  - `N` / `ny` / `n'` → **ኘ** (vs `n` → **ነ**)
  - `H` / `hh` → **ሐ** and `xh` / `hx` / `h'` → **ኀ** (vs `h` → **ሀ**)
- **Distinct Ethiopic Punctuation Keyboard Triggers**: Dedicated 1-to-1 keys for all authentic Ethiopic punctuation marks, eliminating multi-character collision issues:
  - `.` → **።** (*Arat Neteb* / Full Stop)
  - `,` → **፣** (*Netela Serez* / Comma)
  - `;` → **፤** (*Derb Serez* / Semicolon)
  - `:` → **፡** (*Hulat Neteb* / Wordspace)
  - `?` → **፧** (*Yimer* / Question Mark)
  - `|` → **፥** (*Sost Neteb* / Colon)
  - `>` → **፦** (*Meqereya* / Preface Colon)
  - `@` → **፠** (*Ayne T'ila* / Section Mark)
  - `#` → **፨** (*Yieti* / Paragraph Separator)
  - `~` → **፟** (*T'ebiq* / Gemination Mark)

### Changed & Fixed
- **Phonetic Vowel Order Alignment**:
  - For standard consonants (`m`, `l`, `s`, `k`, `d`, `t`, `b`, etc.): `e` produces 1st Order (e.g. `me` → **መ**, `le` → **ለ**, `se` → **ሰ**), `a` / `aa` produces 4th Order (e.g. `ma` → **ማ**, `la` → **ላ**, `sa` → **ሳ**), and `ee` produces 5th Order (`mee` → **ሜ**).
  - For guttural families (`h`, `H`, `h'`, `A`): `ha` produces 1st Order (**ሀ**), `haa` produces 4th Order (**ሃ**), and `he` / `hee` produces 5th Order (**ሄ**).
- **Activity Bar Vector Icon**: Converted Activity Bar container icon to a clean 24x24 monochrome SVG (`media/activity-bar.svg`) with `currentColor` and `fill-rule="evenodd"` for seamless theme masking.
- **Packaging Rules**: Fixed `.vscodeignore` to bundle SVG vector assets into releases while ignoring dev scratch and test files.
- **Marketplace & Open VSX Media Rendering**: Converted all relative media paths in `README.md` to raw GitHub URLs for proper image/video rendering on extension detail pages.
- **Trie Singleton Performance Optimization**: Pre-built shared lookup trie singleton reducing keystroke latency and memory overhead.

---

## [0.2.0] - 2026-08-12

### Added
- **Temporary Transliteration Skip (Latin Bypass Mode)**: Dedicated `Alt + X` or `Ctrl + Alt + B` (`Cmd + Alt + X` / `Cmd + Alt + B` on macOS) shortcut to temporarily pause transliteration and type raw Latin text without disabling Fidel.
- **Escape Prefix Typing**: Support for typing a backtick (`` ` ``) before any character or word to skip transliteration (`fidel.enableEscapePrefix`).
- **Marketplace SVG Compliance**: Configured proper fallback assets for Visual Studio Marketplace security requirements.

---

## [0.1.1] - 2026-08-12

### Added
- **Live Composition Buffer Engine**: Intercepts typing inside active editors, dynamically recalculating and replacing active composition fragments without forcing manual backspacing.
- **Complete Ethiopic Syllabary**: Full coverage across 33 core Ethiopic consonant families (ሀ through ፐ), 7 vowel orders, and 8th-order labialized forms (`wa` / `oa`).
- **Punctuation & Boundary Delimiters**: Automatic composition commits on whitespace and punctuation marks (`.`, `,`, `!`, `?`, `;`, `:`). Includes configurable Latin-to-Ethiopic punctuation conversion (`fidel.convertPunctuation`).
- **Ethiopic Numeral Converter**: Traditional additive Ethiopic numeral conversion (`፩`-`፺`, `፻`, `፼`) for single digits, tens, hundreds, and thousands (`fidel.convertNumbers`).
- **Glottal Stop Apostrophe Parsing**: Support for typing ejectives and glottalized roots with trailing apostrophes (`k'a` -> `ቃ`, `t'a` -> `ጣ`, `c'a` -> `ጫ`, `p'e` -> `ጰ`).
- **Personal Dictionary System**: Support for user-defined custom word mappings (`fidel.dictionary`) with dedicated management commands (`fidel.addDictionaryEntry`, `fidel.removeDictionaryEntry`, `fidel.openDictionary`).
- **Smart Phonetic Correction**: Normalizes trailing double consonants and English digraph typos (`selamm` -> `ሰላም`, `yihunn` -> `ይሁን`, `amhariph` -> `አማሪፍ`).
- **Homophone Candidate Suggestions**: Dual UI modes for inspecting candidate spellings—IntelliSense completion dropdown directly beneath the cursor (`fidel.suggestions`) and interactive QuickPick command palette (`fidel.showSuggestions`).
- **Selection Transliteration Shortcut**: Dedicated `Ctrl + Alt + F` (`Cmd + Alt + F` on macOS) shortcut to convert highlighted Latin text into Ethiopic script.
- **High-Contrast Branding & Media Showcase**: Integrated high-definition video demonstration (`media/demo.mp4`), interface screenshot (`media/screenshot.png`), and extension detail page preview assets.
- **Automated Test Suite**: 52 unit and integration tests passing cleanly across 9 test files.

---

## [0.1.0] - 2026-08-10

### Added
- Initial development preview release of Fidel Input.
- Decoupled TypeScript transliteration engine and prefix Trie matcher.
- Command interceptors for VS Code editor typing and backspace handling.
- Basic status bar indicator widget.
