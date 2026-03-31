# Easy Font Convert

<div align="center">
  
🚀 **Fast and high-quality font converter for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ovcharovcoder/easy-font-convert)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/vscode-1.85.0+-blue.svg)](https://code.visualstudio.com/)

Convert TTF and OTF fonts to web-optimized WOFF and WOFF2 formats with a single click.

</div>

---

## ✨ Features

| Feature                           | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| 🔄 **Multi-format Support**       | Convert TTF and OTF fonts to WOFF and WOFF2 formats               |
| 📁 **Context Menu Integration**   | Right-click any font file in Explorer for instant conversion      |
| ⚙️ **Custom Output Directory**    | Save converted fonts to any folder (or keep them with the source) |
| 🎨 **Font Hinting**               | Optimize font rendering for low-resolution screens                |
| 📊 **Progress Indicator**         | Real-time progress bar for large font files                       |
| 💾 **Smart Overwrite Protection** | Never accidentally overwrite existing files                       |
| 🚀 **One-click Conversion**       | No complex configuration needed - just click and convert          |
| 🖥️ **Command Palette Support**    | Use VS Code's command palette for keyboard-only workflow          |

---

## 🚀 Quick Start

1. **Install** the extension from VS Code Marketplace or VSIX file
2. **Right-click** on any `.ttf` or `.otf` file in VS Code Explorer
3. **Choose** your desired conversion option
4. **Done!** Your converted font appears in the same folder (or your custom output directory)

---

## 📝 Usage

### Method 1: Context Menu (Recommended)

1. Locate a `.ttf` or `.otf` file in VS Code's Explorer panel
2. Right-click on the file
3. Select from three conversion options:
   - **Convert to WOFF** — creates only the WOFF format
   - **Convert to WOFF2** — creates only the WOFF2 format
   - **Convert to WOFF & WOFF2** — creates both formats at once

### Method 2: Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Easy Font Convert"
3. Select your desired conversion command
4. Choose a font file when prompted

---

## ⌨️ Commands

| Command                                      | Shortcut | Description                                          |
| -------------------------------------------- | -------- | ---------------------------------------------------- |
| `Easy Font Convert: Convert to WOFF`         | —        | Convert selected font to WOFF format only            |
| `Easy Font Convert: Convert to WOFF2`        | —        | Convert selected font to WOFF2 format only           |
| `Easy Font Convert: Convert to WOFF & WOFF2` | —        | Convert selected font to both formats simultaneously |

---

## ⚙️ Settings

Customize the extension behavior in VS Code settings (`File > Preferences > Settings` or `Ctrl+,`):

### Example Settings.json

```json
{
  "easyFontConvert.outputDirectory": "D:/Projects/website/fonts",
  "easyFontConvert.enableHinting": true,
  "easyFontConvert.overwriteExisting": false
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

---
```
git clone https://github.com/ovcharovcoder/easy-font-convert.git
npm install
npm run compile
npm run package
```
