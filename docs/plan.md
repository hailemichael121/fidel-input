# Fidel Input (ፊደል) — Technical Architecture & Development Plan

## Overview
**Fidel Input (ፊደል)** is a high-performance, live phonetic Amharic transliteration extension for Visual Studio Code, powered by a decoupled, standalone TypeScript transliteration engine. It converts Latin phonetic Amharic inputs into Ethiopic (Ge'ez) script in real time as the user types (e.g., `selam yihun` → `ሰላም ይሁን`).

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                       VS Code Text Editor                       │
│                                                                 │
│                   User Types: "selam yihun"                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code Input Interceptor                    │
│   - Intercepts 'type' command when Fidel mode is active         │
│   - Manages selection edits & composition buffer lifecycle       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Composition Engine                        │
│   - State machine tracking latin buffer & pending replacements   │
│   - Handles backspace, space, enter, and cursor moves           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Phonetic Transliteration Engine                 │
│   - Trie-based longest prefix matcher                           │
│   - Decoupled mapping specification (Core 33 families + Diqala) │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VS Code Document Edit                      │
│   - Inserts/Replaces target text range: "ሰላም ይሁን"              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Component Layout

```text
fidel-input/
├── docs/
│   └── plan.md                  # Comprehensive architectural blueprint
├── src/
│   ├── engine/                  # Decoupled Core Transliteration Engine
│   │   ├── types.ts             # System types & match interfaces
│   │   ├── mapping.ts           # Rule mappings (Ethiopic 33 families + labialized forms)
│   │   ├── trie.ts              # Prefix tree data structure for O(K) lookup
│   │   ├── transliterator.ts    # Word & text transliteration algorithms
│   │   └── composition.ts       # Live composition buffer state machine
│   │
│   ├── vscode/                  # VS Code Extension Integration Layer
│   │   ├── inputInterceptor.ts  # 'type' command interceptor & composition controller
│   │   ├── statusBar.ts         # Custom status bar item showing Fidel mode status
│   │   └── commands.ts          # Extension command handlers (Toggle, Convert Selection)
│   │
│   └── extension.ts             # Main extension entry point & lifecycle hooks
│
├── test/
│   ├── mapping.test.ts          # Syllabary & mapping unit tests
│   ├── transliterator.test.ts   # Text transliteration integration tests
│   └── composition.test.ts      # Composition state machine buffer tests
│
├── media/
│   └── fidel.svg                # Activity bar & extension branding icon
├── esbuild.js                   # Bundler script targeting VS Code extension host
├── package.json                 # Extension manifest & contribution specifications
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # User guide, keybindings, & mapping documentation
```

---

## 3. Transliteration Mapping Specification

The Amharic phonetic engine uses a 7-order vowel system mapped onto Latin transliterated inputs:

| Order | Vowel Symbol | Example Suffix | `s` Family Example |
| :--- | :--- | :--- | :--- |
| **1st Order (ግዕዝ)** | ä / e | `e` / `a` | ሰ (se) |
| **2nd Order (ካዕብ)** | u | `u` | ሱ (su) |
| **3rd Order (ሣልስ)** | i | `i` | ሲ (si) |
| **4th Order (ራብዕ)** | a | `a` / `aa` | ሳ (sa) |
| **5th Order (ኃምስ)** | ē | `ee` / `ie` | ሴ (see) |
| **6th Order (ሳድስ)** | ə / (consonant) | `""` / `` | ስ (s) |
| **7th Order (ሣብዕ)** | o | `o` | ሶ (so) |
| **8th Order (ዲቃላ/Labialized)** | wa | `wa` | ሷ (swa) |

### Supported Consonant Base Roots (33 Core Families + Diqala Forms):
- **h** (ሀ), **l** (ለ), **H** / **hh** (ሐ), **m** (መ), **ss** (ሠ), **r** (ረ), **s** (ሰ), **sh** / **S** (ሸ)
- **q** / **k'** (ቀ), **b** (በ), **v** (ቨ), **t** (ተ), **ch** / **c** (ቸ), **h'** (ኀ), **n** (ነ), **ny** / **GN** (ኘ)
- **a** / **e** / **i** / **u** / **o** (አ family & standalone vowels), **k** (ከ), **kh** (ኸ), **w** (ወ), **A** / **ah** (ዐ)
- **z** (ዘ), **zh** / **Z** (ዠ), **y** (የ), **d** (ደ), **j** (ጀ), **g** (ገ), **T** / **t'** (ጠ), **CH** / **c'** (ጨ)
- **P** / **p'** (ጰ), **ts** / **Tz** (ጸ), **tz** (ፀ), **f** (ፈ), **p** (ፐ)

---

## 4. Key Implementation Components

### A. Core Engine (`src/engine`)
- **Trie (`TrieNode`)**: Pre-indexes all phonetic rules (e.g. `s`, `se`, `see`, `swa`, `sh`, `she`, `shwa`). Returns `MATCH`, `PREFIX`, or `INVALID`.
- **Transliterator**: Splits incoming Latin strings into tokens, matching longest valid phonetic sequences.
- **Composition Engine**: Stores uncommitted character buffer. For example, typing `s` -> `e` -> `l` -> `a` -> `m`:
  1. `s` → `ስ` (Buffer: `s`)
  2. `e` → `ሰ` (Buffer: `se`)
  3. `l` → `ሰል` (Buffer: `sel`)
  4. `a` → `ሰላ` (Buffer: `sela`)
  5. `m` → `ሰላም` (Buffer: `selam`)

### B. VS Code Extension Layer (`src/vscode`)
- **Input Interceptor**: Overrides VS Code `type` command. When Fidel mode is enabled (`fidel.inputEnabled = true`), intercepts keypresses, calculates composition delta, and applies `TextEditor.edit`.
- **Selection Converter (`fidel.convertSelection`)**: Converts selected Latin text into Ethiopic script in batch.
- **Status Bar Item**: Displays `ፊደል: ON` / `ፊedeል: OFF` with toggle shortcuts (`ctrl+alt+a`).

---

## 5. Development Roadmap & Phased Execution

- [x] **Phase 1: Environment & Setup** — Bun workspace setup, TypeScript config, esbuild bundler configuration.
- [x] **Phase 2: Core Engine & Trie** — Data-driven syllabary mapping, Trie prefix matcher, transliterator algorithms.
- [x] **Phase 3: Composition Buffer** — Live composition state engine handling replacement bounds & backspace.
- [x] **Phase 4: VS Code Integration** — Command interceptor, selection transformer, status bar widget, tree view indicator.
- [x] **Phase 5: Automated Testing** — Comprehensive unit tests for mapping, transliteration, composition, and edge cases.
- [x] **Phase 6: Documentation & Packaging** — `docs/plan.md`, `README.md`, package manifest metadata.
