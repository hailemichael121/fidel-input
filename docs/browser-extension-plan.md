# Fidel Browser Extension (ፊደል) — Technical Architecture & Implementation Roadmap

## Executive Summary

The **Fidel Browser Extension** brings real-time Amharic phonetic input (IME) and Ethiopic transliteration to web browsers (Google Chrome, Brave, Microsoft Edge, Mozilla Firefox) under **Manifest V3**.

By leveraging the zero-dependency, decoupled core engine in [`src/engine/`](../src/engine/), the browser extension maintains 100% phonetic parity with the VS Code extension while addressing the unique constraints of the browser DOM environment (React/Vue synthetic value trackers, `contenteditable` rich text trees, iframe isolation, and per-element focus sessions).

---

## 1. Browser Environment vs. VS Code: Core Architectural Differences

| Feature / Problem | VS Code Extension | Browser Extension (Manifest V3) |
| :--- | :--- | :--- |
| **Command Interception** | VS Code intercepts `"type"` and `"deleteLeft"` commands before buffer mutation. | Browser relies on `keydown` / `beforeinput` events. Must call `e.preventDefault()` and manually own 100% of DOM mutation and caret placement. |
| **Composition Scoping** | VS Code manages `fidel.hasComposition` when-clause context globally. | Browser has no native context. Must track per-element session state using a `WeakMap<Element, ElementSession>`. |
| **Framework State (React/Vue)** | Not applicable (Monaco editor buffer). | Direct `el.value = x` breaks React's `_valueTracker`. Must invoke native prototype setters (`HTMLInputElement.prototype`) and dispatch bubbling `InputEvent`s. |
| **Rich Text Editors (`contenteditable`)** | Monaco Editor line/column model. | Gmail, Slack, Notion, Twitter/X, Google Docs use tree DOM text nodes. Requires `Selection` / `Range` API manipulation or `document.execCommand('insertText')`. |
| **Multi-Frame Sandboxing** | Single host window. | Iframes run separate JS execution contexts. Requires `all_frames: true` in manifest with isolated per-frame `WeakMap` sessions. |
| **Configuration & Persistence** | `vscode.workspace.getConfiguration('fidel')`. | `chrome.storage.sync` / `chrome.storage.local` with asynchronous change listeners. |

---

## 2. System Architecture

```text
                               Chrome / Browser Tab
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
   [ Content Script ]         [ Background Worker ]           [ Extension UI ]
 (Injected in all frames)      (MV3 Service Worker)       (Popup & Options Pages)
           │                            │                            │
 ┌─────────┴─────────┐                  │                            │
 │ Session Manager   │         - Global ON/OFF state        - Global toggle switch
 │ WeakMap<Element>  │         - Badge text ("ፊ" / "EN")    - Quick text converter
 └─────────┬─────────┘         - Keyboard shortcuts         - Personal dictionary UI
           │                   - Context menus              - Phonetic cheatsheet
 ┌─────────┴─────────┐         - chrome.storage sync                 │
 │ Input Interceptor │                  │                            │
 ├───────────────────┤                  │                            │
 │ • <input>/<text>  │ ◄────────────────┴────────────────────────────┘
 │ • contenteditable │
 │ • React setter fix│
 └─────────┬─────────┘
           │
           ▼
 ┌───────────────────┐
 │ CompositionEngine │ ◄── [ Shared Engine Core (src/engine/) ]
 ├───────────────────┤     • Transliterator & FidelTrie
 │ • Feed / Backspace│     • Mapping & Syllable Rules
 │ • Replace Length  │     • SmartCorrector & Suggestions
 └───────────────────┘
```

---

## 3. Directory Layout

```text
fidel-input/
├── src/
│   ├── engine/                  # SHARED CORE ENGINE (Zero dependencies)
│   │   ├── types.ts             # Composition types & tokens
│   │   ├── mapping.ts           # 33 Ethiopic families, orders & diqala
│   │   ├── numbers.ts           # Ethiopic numeral system
│   │   ├── trie.ts              # O(K) prefix tree
│   │   ├── transliterator.ts    # Tokenizer & stream transliteration
│   │   ├── composition.ts       # State machine composition buffer
│   │   ├── dictionary.ts        # Custom dictionary manager
│   │   ├── corrector.ts         # Smart phonetic typo corrector
│   │   └── suggestions.ts       # Homophone candidate generator
│   │
│   ├── vscode/                  # VS CODE INTEGRATION LAYER
│   │
│   └── browser/                 # BROWSER EXTENSION (MANIFEST V3)
│       ├── manifest.json        # Manifest V3 specification
│       ├── background/          # Service Worker
│       │   └── serviceWorker.ts # Lifecycle, badge icon, shortcut dispatch
│       │
│       ├── content/             # In-page DOM scripts (all_frames: true)
│       │   ├── index.ts         # Content script entry point
│       │   ├── sessionManager.ts# WeakMap<Element, ElementSession>
│       │   ├── standardInput.ts # <input> and <textarea> handler (React setter fix)
│       │   ├── contentEditable.ts# Rich text & contenteditable Range handler
│       │   ├── inPageIndicator.ts# Floating input badge / status indicator
│       │   └── suggestionsUi.ts # In-page candidate suggestion dropdown
│       │
│       ├── popup/               # Extension Toolbar Popup
│       │   ├── popup.html
│       │   ├── popup.ts
│       │   └── popup.css
│       │
│       ├── options/             # Settings & Dictionary Manager Page
│       │   ├── options.html
│       │   ├── options.ts
│       │   └── options.css
│       │
│       └── storage/             # Browser Storage Adapter
│           └── storageAdapter.ts# Sync with chrome.storage.sync
│
├── dist/
│   ├── extension.cjs            # VS Code extension bundle
│   └── browser/                 # Browser extension unpacked build
│       ├── manifest.json
│       ├── background.js
│       ├── content.js
│       ├── popup.html, popup.js, popup.css
│       ├── options.html, options.js, options.css
│       └── icons/
│
└── esbuild.js                   # Dual-target build bundler (VS Code + Browser)
```

---

## 4. Phased Implementation Roadmap

### Phase 1: Architecture, Manifest V3 Setup & Build Pipeline
- **Goal**: Scaffold the extension directory structure, configure dual-target `esbuild.js`, build Manifest V3 manifest, and initialize the background service worker.
- **Deliverables**:
  1. `src/browser/manifest.json`: Manifest V3 spec with `"storage"`, `"activeTab"`, `"contextMenus"`, `"commands"`, and `"all_frames: true"`.
  2. `esbuild.js`: Add `bundleBrowser()` target compiling background worker, content script, popup, and options into `dist/browser/`.
  3. `package.json`: Add scripts `"build:browser"`, `"watch:browser"`, `"package:browser"`.
  4. `src/browser/background/serviceWorker.ts`: Global state management (`enabled: boolean`), dynamic badge text (`"ፊ"` vs `"EN"`), and message listener.
  5. `src/browser/storage/storageAdapter.ts`: Typed settings wrapper for `chrome.storage.sync`.
  6. `src/browser/popup/`: Minimal popup with ON/OFF switch and status view.

---

### Phase 2: Standard DOM Input Interceptor (`<input>` & `<textarea>`)
- **Goal**: Flawless phonetic composition inside standard HTML input elements and React/Vue/Angular controlled inputs.
- **Deliverables**:
  1. `src/browser/content/sessionManager.ts`:
     - `WeakMap<Element, ElementSession>` ensuring isolated composition buffers per input element across the page.
  2. `src/browser/content/standardInput.ts`:
     - `keydown` listener intercepting printable characters and `Backspace`.
     - `preventDefault()` logic when composition is active.
     - **React/Vue Prototype Value Setter Bypass**:
       ```ts
       const nativeSetter = Object.getOwnPropertyDescriptor(
         el instanceof HTMLTextAreaElement
           ? window.HTMLTextAreaElement.prototype
           : window.HTMLInputElement.prototype,
         'value'
       )?.set;
       nativeSetter?.call(el, updatedValue);
       el.dispatchEvent(new Event('input', { bubbles: true }));
       ```
     - Caret preservation using `selectionStart` and `selectionEnd`.
     - Blur and click-outside listeners to safely commit active compositions.

---

### Phase 3: Rich Text & `contenteditable` Engine
- **Goal**: Reliable typing support for modern rich text editors (Gmail, Notion, Slack, Twitter/X, ChatGPT, WhatsApp Web).
- **Deliverables**:
  1. `src/browser/content/contentEditable.ts`:
     - Detection of `contenteditable="true"` or `role="textbox"`.
     - Transactional text replacement using `document.execCommand('insertText', false, text)` for maximum compatibility with host undo/redo stacks.
     - `Range` & `Selection` API fallback for elements where `execCommand` is blocked.
     - Tree-traversal boundary protection preventing cursor jumping across nested formatting spans (`<b>`, `<span>`, `<a>`).

---

### Phase 4: In-Page UI, Floating Status & Candidate Suggestions
- **Goal**: Visual feedback directly where the user types.
- **Deliverables**:
  1. `src/browser/content/inPageIndicator.ts`:
     - Subtle, non-intrusive floating indicator icon (ፊ) near the active input caret.
  2. `src/browser/content/suggestionsUi.ts`:
     - Lightweight candidate popup for homophone selection (e.g. `s` → `ሰ` vs `ሠ`) positioned under the active cursor.
  3. `src/browser/content/disambiguationTooltip.ts`:
     - Post-commit hover / click tooltip offering standalone vs merged swaps (e.g. `[Use "ትእ" instead]`).

---

### Phase 5: Global Shortcuts, Context Menus & Options Manager
- **Goal**: Full productivity features for browsing and reading.
- **Deliverables**:
  1. Global keyboard shortcut (`Alt + Shift + A` / `Cmd + Shift + A`) to toggle Fidel anywhere.
  2. Context Menu action: *"Transliterate selection to Amharic (ፊደል)"*.
  3. `src/browser/options/`: Full-featured Options Page for managing Personal Dictionary entries, homophone preferences, and domain whitelisting/blacklisting.

---

### Phase 6: Cross-Browser Packaging & Store Releases
- **Goal**: Publish to Chrome Web Store, Microsoft Edge Add-ons, and Firefox Add-ons.
- **Deliverables**:
  1. Automated extension packaging script (`bun run package:browser`).
  2. Firefox Manifest V2/V3 compatibility check (`web-ext`).
  3. Store promotional assets, icons (16px, 32px, 48px, 128px), and screenshots.
