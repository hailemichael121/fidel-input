# Fidel (ፊደል) — Technical Architecture and Product Plan

## Executive Summary

Fidel is a native Visual Studio Code extension designed for phonetic Amharic language input and Ethiopic script transliteration. Rather than acting as a static text conversion utility, Fidel is engineered as a live **Input Method Editor (IME)** powered by an independent, decoupled TypeScript composition engine.

---

## 1. System Architecture

```text
                    VS Code Text Editor Host
                               │
               ┌───────────────┴───────────────┐
               │                               │
    VS Code Integration Layer           User Interface & Commands
               │                               │
        InputInterceptor                 Status Bar Widget
               │                         Sidebar Tree View Provider
               │                         Dictionary Command Handlers
               ▼                               │
        CompositionEngine ◄────────────────────┘
               │
               ▼
         Transliterator ───► PersonalDictionary
               │          ───► SmartCorrector
        ┌──────┴───────┐  ───► SuggestionEngine
        │              │
    FidelTrie     FIDEL_FAMILIES
        │              │
        └──────┬───────┘
               ▼
        Ethiopic Unicode Output
```

The core engine components ([`src/engine/`](file:///home/yihun/Desktop/fidel/src/engine)) maintain no dependencies on VS Code APIs, allowing the transliteration system to be reused across web applications, desktop editors, command-line interfaces, or mobile software.

---

## 2. Directory Layout

```text
fidel-input/
├── docs/
│   └── plan.md                  # System architecture & engineering roadmap
├── src/
│   ├── engine/                  # Standalone Transliteration Engine
│   │   ├── types.ts             # Type definitions & match interfaces
│   │   ├── mapping.ts           # 33 Ethiopic families, orders & diqala rules
│   │   ├── numbers.ts           # Ethiopic numeral converter system
│   │   ├── dictionary.ts        # Personal dictionary manager
│   │   ├── corrector.ts         # Smart phonetic corrector
│   │   ├── suggestions.ts       # Candidate suggestion generator
│   │   ├── trie.ts              # Trie prefix data structure for O(K) lookup
│   │   ├── transliterator.ts    # Tokenizer & stream transliteration logic
│   │   └── composition.ts       # Live composition buffer state machine
│   │
│   ├── vscode/                  # VS Code Extension Integration Layer
│   │   ├── inputInterceptor.ts  # 'type' and 'deleteLeft' command interceptor
│   │   ├── statusBar.ts         # Status bar state indicator widget
│   │   ├── activityBar.ts       # Sidebar activity bar tree view provider
│   │   └── commands.ts          # Extension command handlers (Toggle, Convert Selection, Personal Dictionary)
│   │
│   └── extension.ts             # Extension lifecycle entry point
│
├── test/
│   ├── engine.test.ts           # Core transliterator unit tests
│   ├── mapping.test.ts          # Syllabary mapping verification
│   ├── composition.test.ts      # State machine buffer tests
│   ├── transliterator.test.ts   # Integration sentence tests
│   ├── exhaustive.test.ts       # Syllabary matrix & backspace regression tests
│   ├── phase2_phase3.test.ts    # Phase 2 & Phase 3 feature verification tests
│   └── phase4.test.ts           # Phase 4 dictionary, correction & suggestion tests
│
├── media/
│   ├── logo.png                 # Primary extension branding logo
│   ├── fidel.png                # Secondary extension icon
│   ├── fidel.svg                # Vector branding asset
│   └── activity-bar.svg         # Monochrome activity bar icon
│
├── LICENSE                      # MIT License file
├── esbuild.js                   # Extension bundler configuration
├── package.json                 # Manifest & contribution specifications
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # User documentation & reference guide
```

---

## 3. Subsystem Breakdown and Audit

### 3.1 Mapping & Numeral Engine ([`src/engine/mapping.ts`](file:///home/yihun/Desktop/fidel/src/engine/mapping.ts), [`src/engine/numbers.ts`](file:///home/yihun/Desktop/fidel/src/engine/numbers.ts))

Represents the complete Ethiopic script syllabary and numeric system:
* **33 Core Families**: Base root consonants from ሀ through ፐ.
* **7 Vowel Orders**: 1st (ግዕዝ), 2nd (ካዕብ), 3rd (ሣልስ), 4th (ራብዕ), 5th (ኃምስ), 6th (ሳድስ), 7th (ሣብዕ).
* **8th Order Labialized Forms**: Extended forms formed with `wa` or `oa` suffixes (e.g. `swa` -> `ሷ`, `lwa` -> `ሏ`).
* **Ethiopic Punctuation**: Mappings for `።`, `፤`, `፦`, `፧`, `፠`, and `፡`.
* **Ethiopic Numerals**: Positional numeral conversion (`፩`-`፺`, `፻`, `፼`).
* **Static Overrides**: Exception dictionaries for common words (`bet`, `yihun`, `ethiopia`, `abebe`).

### 3.2 Intelligence & Customization Layer ([`src/engine/dictionary.ts`](file:///home/yihun/Desktop/fidel/src/engine/dictionary.ts), [`src/engine/corrector.ts`](file:///home/yihun/Desktop/fidel/src/engine/corrector.ts), [`src/engine/suggestions.ts`](file:///home/yihun/Desktop/fidel/src/engine/suggestions.ts))

* **Personal Dictionary**: [`PersonalDictionary`](file:///home/yihun/Desktop/fidel/src/engine/dictionary.ts) allows user-defined custom term mappings (e.g., `myword` -> `ሚያቃልል`, `haile` -> `ኃይለ`) persisted in VS Code configuration (`fidel.dictionary`). Takes top priority during transliteration.
* **Smart Corrector**: [`SmartCorrector`](file:///home/yihun/Desktop/fidel/src/engine/corrector.ts) normalizes trailing repeated consonant spellings (e.g., `selamm` -> `ሰላም`).
* **Candidate Suggestions**: [`SuggestionEngine`](file:///home/yihun/Desktop/fidel/src/engine/suggestions.ts) generates ranked homophone candidate alternatives.

### 3.3 Trie Lookup Engine ([`src/engine/trie.ts`](file:///home/yihun/Desktop/fidel/src/engine/trie.ts))

Indexes flattened phonetic mapping sequences into a prefix tree (`FidelTrie`) to achieve $O(K)$ matching performance, resolving phonetic ambiguities such as `s` versus `sh` versus `shw`.

### 3.4 Composition Engine ([`src/engine/composition.ts`](file:///home/yihun/Desktop/fidel/src/engine/composition.ts))

Manages live typing state:
* Stores raw Latin input buffer and calculated rendered string.
* Calculates `replaceLength` delta for transactional editor replacement.
* Executes character-by-character backspace recalculation.
* Emits word boundary commit signals upon space or punctuation input (`/[\s.,!?;:()"]/`).

### 3.5 VS Code Interceptor ([`src/vscode/inputInterceptor.ts`](file:///home/yihun/Desktop/fidel/src/vscode/inputInterceptor.ts))

Overrides VS Code `type` and `deleteLeft` commands:
* Intercepts single-character inputs when input mode is enabled.
* Manages transactional Undo/Redo edit stack grouping (`undoStopBefore` and `undoStopAfter`).
* Handles multi-cursor typing safely.
* Tracks cursor movement (`lastCompositionPosition`) to safely reset the composition buffer when the cursor changes position via mouse click or arrow keys.

---

## 4. Phased Development Roadmap

### Phase 1 — Engine Foundation (Completed)
- Standalone TypeScript architecture.
- 33 core Ethiopic families, 7 orders, and labialized forms.
- Trie prefix matcher and stream transliterator.
- Live composition buffer and backspace tracker.
- VS Code command interceptor (`type` and `deleteLeft`).
- Status bar item and activity bar tree view interface.

### Phase 2 — Reliability and Testing (Completed)
- Exhaustive test suite (`test/exhaustive.test.ts`) validating 33 families × 7 orders.
- Multi-character consonant prefix disambiguation.
- Progressive backspace regression test suite.
- Expanded word boundary commit triggers for punctuation delimiters (`/[\s.,!?;:()"]/`).
- Inner-word glottal stop apostrophe parsing (`k'`, `t'`, `c'`, `p'`).

### Phase 3 — VS Code Native Experience (Completed)
- Configurable punctuation conversion (`fidel.convertPunctuation`).
- Ethiopic numeral conversion system (`src/engine/numbers.ts`) wired to `fidel.convertNumbers`.
- Native Undo/Redo edit stack transactional grouping (`undoStopBefore`, `undoStopAfter`).
- Multi-cursor safety handling.
- Full configuration schema in `package.json`.

### Phase 4 — Customization and Intelligence (Completed)
- Personal dictionary manager ([`src/engine/dictionary.ts`](file:///home/yihun/Desktop/fidel/src/engine/dictionary.ts)) with `fidel.dictionary` settings integration.
- Dictionary management commands (`Fidel: Add Personal Dictionary Entry`, `Fidel: Remove Personal Dictionary Entry`, `Fidel: Open Personal Dictionary Settings`).
- Smart phonetic corrector engine ([`src/engine/corrector.ts`](file:///home/yihun/Desktop/fidel/src/engine/corrector.ts)) for double-consonant typos.
- Candidate suggestion generator ([`src/engine/suggestions.ts`](file:///home/yihun/Desktop/fidel/src/engine/suggestions.ts)) for homophones.
- Phase 4 automated unit test suite (`test/phase4.test.ts`).

### Phase 5 — Multi-Language Profiles (Recommended Future Roadmap Expansion)
- Architectural profile infrastructure ([`src/engine/profiles.ts`](file:///home/yihun/Desktop/fidel/src/engine/profiles.ts)) prepared for future Ethiopic language expansions (Tigrinya, Ethiopic Oromo, Ge'ez liturgy).

### Phase 6 — Production Packaging and Marketplace Release (Completed)
- Clean production build (`bun run build`) with zero compilation or bundling errors.
- Comprehensive automated test suite (51 passing tests across 9 test files).
- Official release notes in [`CHANGELOG.md`](../CHANGELOG.md).
- High-contrast monochrome black-and-white extension branding iconography.
- Complete user documentation, keybinding guide, and configuration reference in [`README.md`](../README.md).
- Production package manifest configured for VS Code Marketplace publishing.

---

## 5. Author, Ownership & Software License

Fidel is created, owned, and maintained by **Yihun Shekuri** ([@Hailemichael121](https://github.com/Hailemichael121)).

It is licensed under the [MIT License](../LICENSE).

Copyright (c) 2026 Yihun Shekuri.
