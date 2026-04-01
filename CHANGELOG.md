# Changelog

All notable changes to the **Easy Font Converter** VS Code extension will be documented in this file.

---

## [1.0.1] - 2026-04-01

### Added
- **Group Convert** – Convert multiple font files at once
  - Select multiple `.ttf` or `.otf` files in Explorer
  - Right-click and choose from Group Convert options:
    - `Group Convert to WOFF`
    - `Group Convert to WOFF2`
    - `Group Convert to WOFF & WOFF2`
  - Progress bar shows conversion status for each file
  - Summary report with success/failure counts
  - Cancel option for long conversions

### Improved
- Better handling of large font files with real-time progress indicators
- Enhanced error messages for failed conversions
- Optimized file selection flow for group operations

### Fixed
- Corrected WOFF2 module initialization to prevent runtime errors
- Fixed TypeScript compilation issues with ArrayBuffer conversion
- Improved stability for batch processing scenarios

---

## [1.0.0] - 2026-03-31

### Added
- Initial release of **Easy Font Converter**
- Convert TTF and OTF fonts to web-optimized formats
- Three conversion options:
  - `Convert to WOFF` – WOFF format only
  - `Convert to WOFF2` – WOFF2 format only
  - `Convert to WOFF & WOFF2` – both formats simultaneously

### Features
- **Context Menu Integration** – Right-click any `.ttf` or `.otf` file in VS Code Explorer for instant conversion
- **Custom Output Directory** – Save converted fonts to any folder (or keep them with source files)
- **Font Hinting** – Enable hinting for better rendering on low-resolution screens
- **Progress Indicator** – Visual feedback during conversion of large font files
- **Smart Overwrite Protection** – Prompt before overwriting existing files
- **Command Palette Support** – Access all commands via `Ctrl+Shift+P` / `Cmd+Shift+P`

### Settings
- `easyFontConverter.outputDirectory` – Custom output path (default: empty = same folder as source)
- `easyFontConverter.enableHinting` – Toggle font hinting (default: true)
- `easyFontConverter.overwriteExisting` – Auto-overwrite without prompts (default: false)

### Technical
- Built with TypeScript and `fonteditor-core` library
- Supports both TTF and OTF input formats
- Outputs WOFF and WOFF2 web font formats
- MIT Licensed – Open source forever
