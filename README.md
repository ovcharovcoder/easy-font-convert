# Easy Font Converter

<div align="center">
  
🚀 **Fast and high-quality font converter for VS Code**

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/vscode-1.85.0+-blue.svg)](https://code.visualstudio.com/)

Convert TTF and OTF fonts to web-optimized WOFF and WOFF2 formats with a single click.

</div>

---

## ✨ Features

| Feature                | Description                                |
| ---------------------- | ------------------------------------------ |
| 🔄 **Single or Group** | Convert one file or multiple files at once |
| 📁 **Context Menu**    | Right-click → convert                      |
| ⚙️ **Custom Output**   | Save to any folder (or same folder)        |
| 🎨 **Hinting**         | Better rendering on low-resolution screens |
| 📊 **Progress Bar**    | Real-time status for each file             |

---

## 🚀 Quick Start

1. **Install** from VS Code Marketplace
2. **Right-click** on `.ttf` or `.otf` file(s)
3. **Choose** conversion option
4. **Done!**

---

## 📝 Usage

### Single File

Right-click on one font → select:

- `Convert to WOFF` — creates only WOFF format
- `Convert to WOFF2` — creates only WOFF2 format
- `Convert to WOFF & WOFF2` — creates both formats

### Group Convert (Multiple Files)

Perfect when you need to convert several fonts at once:

1. **Select multiple** font files in VS Code Explorer:
   - `Ctrl+Click` (Windows/Linux) or `Cmd+Click` (macOS) — select individual files
   - `Shift+Click` — select a range of files

2. **Right-click** on any selected file → choose from **Group Convert** section:
   - `Group Convert to WOFF` — convert all selected to WOFF
   - `Group Convert to WOFF2` — convert all selected to WOFF2
   - `Group Convert to WOFF & WOFF2` — convert all selected to both formats

3. **Confirm** the selection in the file picker (all selected files will be pre-checked)

4. **Watch** the progress bar as files are converted one by one

5. **Done!** A summary shows how many files succeeded/failed

> 💡 **Tip:** You can cancel the conversion at any time. Files that were already converted will remain.

---

## ⌨️ Commands

| Command                         | Description            |
| ------------------------------- | ---------------------- |
| `Convert to WOFF`               | Single file → WOFF     |
| `Convert to WOFF2`              | Single file → WOFF2    |
| `Convert to WOFF & WOFF2`       | Single file → both     |
| `Group Convert to WOFF`         | Multiple files → WOFF  |
| `Group Convert to WOFF2`        | Multiple files → WOFF2 |
| `Group Convert to WOFF & WOFF2` | Multiple files → both  |

---

## ⚙️ Settings

Customize the extension behavior in VS Code settings (`File > Preferences > Settings` or `Ctrl+,`):

### Example Settings.json

```json
{
  "easyFontConverter.outputDirectory": "D:/Projects/website/fonts",
  "easyFontConverter.enableHinting": true,
  "easyFontConverter.overwriteExisting": false
}
```

---

## 👤 Author

<img
  src="https://raw.githubusercontent.com/ovcharovcoder/easy-font-convert/main/images/avatar.png"
  alt="Andrii Ovcharov"
  width="60"
/>

Andrii Ovcharov<br>
📧 ovcharovcoder@gmail.com

---

## ☕ Support

If you enjoy Easy Font Convert, consider supporting the author:
[Donate via PayPal](https://www.paypal.com/donate/?business=datoshcode@gmail.com)

---

## 🪪 License

Released under the [MIT License](https://raw.githubusercontent.com/ovcharovcoder/easy-font-convert/main/LICENSE)
