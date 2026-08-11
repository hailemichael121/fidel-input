# Changelog

All notable changes to the **Fidel Input (ፊደል)** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **High-Contrast Branding**: Monochrome black and white extension logo and sidebar activity bar iconography.
- **Automated Test Suite**: 51 unit and integration tests passing cleanly across 9 test files.

---

## [0.1.0] - 2026-08-10

### Added
- Initial development preview release of Fidel Input.
- Decoupled TypeScript transliteration engine and prefix Trie matcher.
- Command interceptors for VS Code editor typing and backspace handling.
- Basic status bar indicator widget.
