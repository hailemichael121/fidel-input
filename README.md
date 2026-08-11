# Fidel Input (ፊደል)

<p align="center">
  <img src="media/logo.png" alt="Fidel Input Logo" width="160" />
</p>

<p align="center">
  <strong>Fast, real-time Amharic phonetic input and Ethiopic transliteration engine for Visual Studio Code.</strong>
</p>

<p align="center">
  <a href="#license">License</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#keyboard-shortcuts--commands">Shortcuts</a> &bull;
  <a href="#configuration">Configuration</a> &bull;
  <a href="#development--testing">Development</a>
</p>

---

## Overview

**Fidel Input** is a native Visual Studio Code extension designed for inputting Amharic text using a standard QWERTY keyboard. Rather than performing static string conversions, Fidel operates as a live **Input Method Editor (IME)**. It intercepts typing inside the active editor, maintains an active composition buffer, and updates text dynamically as phonetic syllables are constructed.

### Product Capabilities

* **Live Phonetic Interception**: Converts Latin inputs directly into Ethiopic (Ge'ez) script in real time as keypresses occur.
* **Composition Buffer Architecture**: Progressively recalculates the current word fragment without inserting extraneous characters or breaking backspace behavior.
* **Selection Transliteration**: Converts pre-existing Latin selections into Ethiopic script on demand without toggling global input mode.
* **Decoupled Core Engine**: Built on an independent TypeScript transliteration package that can be compiled for CLI, web, or editor targets.

---

## Demonstration & Media

### Video & Visual Preview

<p align="center">
  <!-- Product Demonstration Screenshot / Video -->
  <img src="media/fidel.png" alt="Fidel VS Code Extension Interface" width="700" />
</p>

```html
<!-- Recommended syntax for embedding product video recordings in GitHub / VS Code Marketplace -->
<video src="media/demo.mp4" controls="controls" width="100%">
  Your browser does not support HTML5 video streaming.
</video>
```

---

## Architecture & Core Features

### Real-Time Composition Engine

As phonetic inputs are entered, Fidel maintains buffer state and replaces active composition bounds:

```text
User input:   s   ->   e   ->   l   ->   a   ->   m   ->   SPACE
Buffer:      "s"      "se"     "sel"   "sela"   "selam"    ""
Rendered:    "ስ"      "ሰ"      "ሰል"    "ሰላ"     "ሰላም"     "ሰላም "
```

### Syllabary & Rule Coverage

* **33 Core Ethiopic Families**: Full mapping for all core base roots (ሀ through ፐ).
* **7 Vowel Orders**: Complete support across 1st (ግዕዝ), 2nd (ካዕብ), 3rd (ሣልስ), 4th (ራብዕ), 5th (ኃምስ), 6th (ሳድስ), and 7th (ሣብዕ) orders.
* **8th Order Labialized Forms (дикала / Diqala)**: Compound forms ending in `wa` or `oa` (e.g., `swa` -> `ሷ`, `lwa` -> `ሏ`, `gwa` -> `ጓ`).
* **Ethiopic Punctuation**: Configurable mapping for standard punctuation (`።`, `፤`, `፦`, `፧`, `፠`).

---

## Quick Start

1. Install the **Fidel Input** extension in Visual Studio Code.
2. Press **`Ctrl + Alt + A`** (or **`Cmd + Alt + A`** on macOS) to enable Amharic input mode.
3. Type phonetic Amharic:
   ```text
   selam yihun
   ->
   ሰላም ይሁን
   ```
4. Highlight any existing Latin text and press **`Ctrl + Alt + E`** to convert the selection directly into Ethiopic script.

---

## Keyboard Shortcuts & Commands

| Command | Shortcut (Windows/Linux) | Shortcut (macOS) | Context | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fidel.toggleInput` | **`Ctrl + Alt + A`** | **`Cmd + Alt + A`** | Editor Text Focus | Toggles Fidel Amharic input mode on or off |
| `fidel.convertSelection` | **`Ctrl + Alt + E`** | **`Cmd + Alt + E`** | Has Selection | Transliterates selected Latin text to Ethiopic script |
| `fidel.disableInput` | **`Escape`** | **`Escape`** | Fidel Input Active | Disables Fidel input mode instantly |
| `fidel.enableInput` | Command Palette | Command Palette | Global | Enables Fidel Amharic input mode |

---

## Phonetic Mapping Reference

Fidel maps Latin phonetic sequences onto the Ethiopic syllabary matrix:

| Order | Vowel Suffix | Example Input | `s` Family Output |
| :--- | :--- | :--- | :--- |
| **1st Order (ግዕዝ)** | `e` / `a` | `se` | **ሰ** |
| **2nd Order (ካዕብ)** | `u` | `su` | **ሱ** |
| **3rd Order (ሣልስ)** | `i` | `si` | **ሲ** |
| **4th Order (ራብዕ)** | `a` / `aa` | `sa` | **ሳ** |
| **5th Order (ኃምስ)** | `ee` / `ie` | `see` | **ሴ** |
| **6th Order (ሳድስ)** | Bare consonant | `s` | **ስ** |
| **7th Order (ሣብዕ)** | `o` | `so` | **ሶ** |
| **8th Order (ዲቃላ)** | `wa` / `oa` | `swa` | **ሷ** |

---

## Configuration

Extension settings can be configured via VS Code `settings.json`:

```json
{
  "fidel.enableByDefault": false,
  "fidel.convertPunctuation": false,
  "fidel.autoDisableOnEnter": false
}
```

* `fidel.enableByDefault`: Automatically enables Fidel Amharic input when VS Code starts.
* `fidel.convertPunctuation`: Converts Latin punctuation symbols to Ethiopic punctuation equivalents (`.` -> `።`, `,` -> `፤`, `:` -> `፡`).
* `fidel.autoDisableOnEnter`: Automatically turns off input mode after pressing Enter.

---

## Development & Testing

Fidel is built with [Bun](https://bun.sh), TypeScript, and esbuild.

```bash
# Type check TypeScript files
bun run check

# Bundle extension code
bun run build

# Run unit and integration tests
bun test
```

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Yihun Hailemichael.
