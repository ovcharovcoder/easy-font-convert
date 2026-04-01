"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fonteditor_core_1 = require("fonteditor-core");
// Helper functions
async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
async function pathExists(filePath) {
    return fs.promises
        .access(filePath)
        .then(() => true)
        .catch(() => false);
}
function activate(context) {
    console.log('Easy Font Converter extension is now active');
    // Initialize WOFF2 module
    try {
        if (fonteditor_core_1.woff2 && fonteditor_core_1.woff2.init) {
            fonteditor_core_1.woff2.init();
            console.log('WOFF2 module initialized successfully');
        }
    }
    catch (error) {
        console.error('Failed to initialize WOFF2 module:', error);
    }
    // Single file commands
    const convertToWoff = vscode.commands.registerCommand('easy-font-converter.convertToWoff', async (uri) => {
        const file = uri || (await selectSingleFile());
        if (file) {
            await convertSingleFont(file, 'woff');
        }
    });
    const convertToWoff2 = vscode.commands.registerCommand('easy-font-converter.convertToWoff2', async (uri) => {
        const file = uri || (await selectSingleFile());
        if (file) {
            await convertSingleFont(file, 'woff2');
        }
    });
    const convertToBoth = vscode.commands.registerCommand('easy-font-converter.convertToBoth', async (uri) => {
        const file = uri || (await selectSingleFile());
        if (file) {
            await convertSingleFont(file, 'both');
        }
    });
    // Group commands - використовуємо глобальне сховище VS Code
    const groupConvertToWoff = vscode.commands.registerCommand('easy-font-converter.groupConvertToWoff', async () => {
        const uris = await getSelectedFilesFromExplorer();
        if (uris.length === 0) {
            vscode.window.showErrorMessage('No font files selected. Please select files first.');
            return;
        }
        await groupConvertFontsSimple(uris, 'woff');
    });
    const groupConvertToWoff2 = vscode.commands.registerCommand('easy-font-converter.groupConvertToWoff2', async () => {
        const uris = await getSelectedFilesFromExplorer();
        if (uris.length === 0) {
            vscode.window.showErrorMessage('No font files selected. Please select files first.');
            return;
        }
        await groupConvertFontsSimple(uris, 'woff2');
    });
    const groupConvertToBoth = vscode.commands.registerCommand('easy-font-converter.groupConvertToBoth', async () => {
        const uris = await getSelectedFilesFromExplorer();
        if (uris.length === 0) {
            vscode.window.showErrorMessage('No font files selected. Please select files first.');
            return;
        }
        await groupConvertFontsSimple(uris, 'both');
    });
    context.subscriptions.push(convertToWoff, convertToWoff2, convertToBoth, groupConvertToWoff, groupConvertToWoff2, groupConvertToBoth);
}
// Головна функція для отримання виділених файлів з Explorer
async function getSelectedFilesFromExplorer() {
    try {
        // Спосіб 1: Використовуємо стандартну команду VS Code
        const selected = await vscode.commands.executeCommand('workbench.explorer.fileView.getSelection');
        if (selected && selected.length > 0) {
            const fontUris = selected.filter(uri => {
                const ext = path.extname(uri.fsPath).toLowerCase();
                return ext === '.ttf' || ext === '.otf';
            });
            if (fontUris.length > 0) {
                console.log('Selected files:', fontUris.map(u => path.basename(u.fsPath)));
                return fontUris;
            }
        }
    }
    catch (error) {
        console.log('Could not get selection from explorer:', error);
    }
    // Спосіб 2: Якщо не вдалося, показуємо діалог
    const files = await vscode.window.showOpenDialog({
        canSelectMany: true,
        canSelectFiles: true,
        canSelectFolders: false,
        filters: {
            'Font Files': ['ttf', 'otf'],
        },
        title: 'Select font files to convert',
    });
    return files || [];
}
async function selectSingleFile() {
    const files = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: {
            'Font Files': ['ttf', 'otf'],
        },
        title: 'Select font file',
    });
    return files ? files[0] : undefined;
}
// Спрощена групова конвертація
async function groupConvertFontsSimple(uris, format) {
    if (uris.length === 0) {
        vscode.window.showErrorMessage('No font files selected');
        return;
    }
    const formatNames = format === 'both' ? 'WOFF & WOFF2' : format.toUpperCase();
    // Підтвердження
    const confirmed = await vscode.window.showInformationMessage(`Convert ${uris.length} font file(s) to ${formatNames}?`, 'Yes', 'No');
    if (confirmed !== 'Yes') {
        return;
    }
    let successCount = 0;
    let failCount = 0;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting ${uris.length} file(s) to ${formatNames}...`,
        cancellable: true,
    }, async (progress, token) => {
        for (let i = 0; i < uris.length; i++) {
            if (token.isCancellationRequested) {
                break;
            }
            const uri = uris[i];
            const fileName = path.basename(uri.fsPath);
            progress.report({
                increment: (i / uris.length) * 100,
                message: `[${i + 1}/${uris.length}] ${fileName}`,
            });
            try {
                await convertSingleFont(uri, format, true);
                successCount++;
                console.log(`✅ Converted: ${fileName}`);
            }
            catch (error) {
                failCount++;
                console.error(`❌ Failed to convert ${fileName}:`, error);
            }
        }
    });
    // Результат
    if (successCount > 0) {
        if (failCount > 0) {
            vscode.window.showWarningMessage(`✅ Converted: ${successCount} files, ❌ Failed: ${failCount} files`);
        }
        else {
            vscode.window.showInformationMessage(`✅ Successfully converted ${successCount} file(s) to ${formatNames}`);
        }
    }
    else {
        vscode.window.showErrorMessage(`❌ Conversion failed for all ${failCount} file(s)`);
    }
}
async function convertSingleFont(uri, format, silent = false) {
    const filePath = uri.fsPath;
    const fileExt = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, fileExt);
    const config = vscode.workspace.getConfiguration('easyFontConverter');
    const outputDir = config.get('outputDirectory') || '';
    const enableHinting = config.get('enableHinting') ?? true;
    const overwriteExisting = config.get('overwriteExisting') ?? false;
    const outputPath = outputDir ? path.join(outputDir) : dir;
    await ensureDir(outputPath);
    const fontBuffer = await fs.promises.readFile(filePath);
    const font = fonteditor_core_1.Font.create(fontBuffer, {
        type: fileExt === '.ttf' ? 'ttf' : 'otf',
        hinting: enableHinting,
    });
    if (format === 'woff' || format === 'both') {
        const woffBuffer = font.write({
            type: 'woff',
            hinting: enableHinting,
        });
        const woffPath = path.join(outputPath, `${baseName}.woff`);
        const woffBufferData = Buffer.from(woffBuffer);
        const exists = await pathExists(woffPath);
        if (!overwriteExisting && exists) {
            if (!silent) {
                const overwrite = await vscode.window.showWarningMessage(`${baseName}.woff already exists. Overwrite?`, 'Yes', 'No');
                if (overwrite === 'Yes') {
                    await fs.promises.writeFile(woffPath, woffBufferData);
                }
            }
        }
        else {
            await fs.promises.writeFile(woffPath, woffBufferData);
        }
    }
    if (format === 'woff2' || format === 'both') {
        if (fonteditor_core_1.woff2 && fonteditor_core_1.woff2.init) {
            const isInited = fonteditor_core_1.woff2.isInited ? fonteditor_core_1.woff2.isInited() : false;
            if (!isInited) {
                fonteditor_core_1.woff2.init();
            }
        }
        const woff2Buffer = font.write({
            type: 'woff2',
            hinting: enableHinting,
        });
        const woff2Path = path.join(outputPath, `${baseName}.woff2`);
        const woff2BufferData = Buffer.from(woff2Buffer);
        const exists = await pathExists(woff2Path);
        if (!overwriteExisting && exists) {
            if (!silent) {
                const overwrite = await vscode.window.showWarningMessage(`${baseName}.woff2 already exists. Overwrite?`, 'Yes', 'No');
                if (overwrite === 'Yes') {
                    await fs.promises.writeFile(woff2Path, woff2BufferData);
                }
            }
        }
        else {
            await fs.promises.writeFile(woff2Path, woff2BufferData);
        }
    }
    if (!silent) {
        vscode.window.showInformationMessage(`✅ Font converted: ${baseName}`);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map
