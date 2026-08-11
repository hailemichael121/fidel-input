# Fidel Input — ፊደል 🇪🇹

**Fidel Input** is a fast, intelligent, live Amharic phonetic input extension for Visual Studio Code. It converts Latin transliteration into Ethiopic (Ge'ez) script in real-time as you type, powered by a decoupled TypeScript phonetic composition engine.

---

## 🌟 Features

- **⚡ Real-Time Live Transliteration**: Type `selam yihun` → VS Code automatically renders `ሰላም ይሁን`.
- **🎹 Live Composition Buffer**: Progressively updates characters as you type (`s` → `ስ` → `se` → `ሰ` → `sel` → `ሰል` → `sela` → `ሰላ` → `selam` → `ሰላም`).
- **🔀 Selection Conversion Shortcuts**: Highlight any Latin text (e.g. `selam endemin`) and press **`Ctrl + Alt + E`** (or `Ctrl + Alt + F` / `Cmd + Alt + E` on macOS) to instantly convert it to Ethiopic script (`ሰላም እንደምን`).
- **📊 Status Bar & Activity Bar Integration**: Clear visual indicator (`$(keyboard) ፊደል: ON / OFF`) with 1-click toggles and quick access.
- **📚 Complete Amharic Ethiopic Syllabary**: Full support for all 33 core Ethiopic character families (ሀ-ፐ), 7 vowel orders (ግዕዝ-ሣብዕ), compound/labialized forms (ዲቃላ ፊደላት: ሏ, ሟ, ቋ, ዟ, etc.), and common word exceptions (`bet` → `ቤት`, `abebe` → `አበበ`, `ethiopia` → `ኢትዮጵያ`).
- **⚙️ Configurable Punctuation**: Optional conversion of Latin punctuation to Ethiopic punctuation (`.` → `።`, `:` → `፡`, `,` → `፤`, `:-` → `፦`).

---

## 🚀 Quick Start

1. **Install extension** in VS Code.
2. Press **`Ctrl + Alt + A`** (or `Cmd + Alt + A` on macOS) to enable **Fidel Amharic Input**.
3. Type phonetic Amharic:
   ```text
   selam yihun
   ↓
   ሰላም ይሁን
   ```
4. Highlight any existing Latin text and press **`Ctrl + Alt + E`** (or `Ctrl + Alt + F`) to convert selection into Ethiopic script without changing modes.

---

## ⌨️ Keybindings & Commands

| Command | Keybinding (Linux/Windows) | Keybinding (macOS) | Context | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fidel.toggleInput` | **`Ctrl + Alt + A`** | **`Cmd + Alt + A`** | Editor Text Focus | Toggles live Fidel Amharic input ON/OFF |
| `fidel.convertSelection` | **`Ctrl + Alt + E`** / **`Ctrl + Alt + F`** | **`Cmd + Alt + E`** / **`Cmd + Alt + F`** | Has Selection | Transliterates selected Latin text to Ethiopic script |
| `fidel.disableInput` | **`Escape`** | **`Escape`** | Fidel Input Active | Disables Fidel input mode instantly |
| `fidel.enableInput` | Command Palette | Command Palette | Global | Enables Fidel Amharic input mode |

---

## 📖 Phonetic Mapping Reference

Fidel Input maps 7 vowel orders and 8th-order labialized forms across Latin sequences:

| Order | Vowel Symbol | Latin Example | `s` Family Example |
| :--- | :--- | :--- | :--- |
| **1st Order (ግዕዝ)** | ä / e | `se` | **ሰ** |
| **2nd Order (ካዕብ)** | u | `su` | **ሱ** |
| **3rd Order (ሣልስ)** | i | `si` | **ሲ** |
| **4th Order (ራብዕ)** | a | `sa` / `saa` | **ሳ** |
| **5th Order (ኃምስ)** | ē | `see` / `sie` | **ሴ** |
| **6th Order (ሳድስ)** | ə / none | `s` | **ስ** |
| **7th Order (ሣብዕ)** | o | `so` | **ሶ** |
| **8th Order (ዲቃላ)** | wa | `swa` | **ሷ** |

---

## 🛠️ Development & Testing

Built with [Bun](https://bun.sh), TypeScript, and esbuild.

```bash
# Type check & build
bun run check
bun run build

# Run unit & integration test suite
bun test
```

---

## 📜 License

[MIT License](LICENSE) © 2026 Yihun
