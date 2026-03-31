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
const fs = __importStar(require("fs-extra"));
const fonteditor_core_1 = require("fonteditor-core");
function activate(context) {
    console.log('Easy Font Convert extension is now active');
    // Initialize WOFF2 module
    try {
        if (fonteditor_core_1.woff2 && fonteditor_core_1.woff2.init) {
            fonteditor_core_1.woff2.init();
            console.log('WOFF2 module initialized successfully');
        }
    }
    catch (error) {
        console.error('Failed to initialize WOFF2 module:', error);
        vscode.window.showWarningMessage('WOFF2 support may not be available. WOFF conversion will still work.');
    }
    const convertToWoff = vscode.commands.registerCommand('easy-font-convert.convertToWoff', async (uri) => {
        await convertFont(uri, 'woff');
    });
    const convertToWoff2 = vscode.commands.registerCommand('easy-font-convert.convertToWoff2', async (uri) => {
        await convertFont(uri, 'woff2');
    });
    const convertToBoth = vscode.commands.registerCommand('easy-font-convert.convertToBoth', async (uri) => {
        await convertFont(uri, 'both');
    });
    context.subscriptions.push(convertToWoff, convertToWoff2, convertToBoth);
}
async function convertFont(uri, format) {
    if (!uri) {
        const files = await vscode.window.showOpenDialog({
            canSelectMany: false,
            filters: {
                'Font Files': ['ttf', 'otf'],
            },
            title: 'Select font file',
        });
        if (!files || files.length === 0) {
            return;
        }
        uri = files[0];
    }
    const filePath = uri.fsPath;
    const fileExt = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, fileExt);
    const config = vscode.workspace.getConfiguration('easyFontConvert');
    const outputDir = config.get('outputDirectory') || '';
    const enableHinting = config.get('enableHinting') ?? true;
    const overwriteExisting = config.get('overwriteExisting') ?? false;
    const outputPath = outputDir ? path.join(outputDir) : dir;
    // Create output directory if it doesn't exist
    await fs.ensureDir(outputPath);
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Converting ${path.basename(filePath)}...`,
            cancellable: false,
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Reading font file...' });
            const fontBuffer = await fs.readFile(filePath);
            progress.report({ increment: 30, message: 'Processing font data...' });
            const font = fonteditor_core_1.Font.create(fontBuffer, {
                type: fileExt === '.ttf' ? 'ttf' : 'otf',
                hinting: enableHinting,
            });
            const results = [];
            if (format === 'woff' || format === 'both') {
                progress.report({ increment: 50, message: 'Converting to WOFF...' });
                try {
                    const woffBuffer = font.write({
                        type: 'woff',
                        hinting: enableHinting,
                    });
                    const woffPath = path.join(outputPath, `${baseName}.woff`);
                    const woffBufferData = Buffer.from(woffBuffer);
                    if (!overwriteExisting && (await fs.pathExists(woffPath))) {
                        const overwrite = await vscode.window.showWarningMessage(`${baseName}.woff already exists. Overwrite?`, 'Yes', 'No');
                        if (overwrite !== 'Yes') {
                            results.push({ format: 'WOFF', path: woffPath + ' (skipped)' });
                        }
                        else {
                            await fs.writeFile(woffPath, woffBufferData);
                            results.push({ format: 'WOFF', path: woffPath });
                        }
                    }
                    else {
                        await fs.writeFile(woffPath, woffBufferData);
                        results.push({ format: 'WOFF', path: woffPath });
                    }
                }
                catch (error) {
                    console.error('WOFF conversion error:', error);
                    results.push({ format: 'WOFF', path: 'conversion failed' });
                }
            }
            if (format === 'woff2' || format === 'both') {
                progress.report({ increment: 80, message: 'Converting to WOFF2...' });
                try {
                    // Check and initialize WOFF2 module if needed
                    if (fonteditor_core_1.woff2 && fonteditor_core_1.woff2.init) {
                        const isInited = fonteditor_core_1.woff2.isInited ? fonteditor_core_1.woff2.isInited() : false;
                        if (!isInited) {
                            fonteditor_core_1.woff2.init();
                            console.log('WOFF2 module initialized on demand');
                        }
                    }
                    const woff2Buffer = font.write({
                        type: 'woff2',
                        hinting: enableHinting,
                    });
                    const woff2Path = path.join(outputPath, `${baseName}.woff2`);
                    const woff2BufferData = Buffer.from(woff2Buffer);
                    if (!overwriteExisting && (await fs.pathExists(woff2Path))) {
                        const overwrite = await vscode.window.showWarningMessage(`${baseName}.woff2 already exists. Overwrite?`, 'Yes', 'No');
                        if (overwrite !== 'Yes') {
                            results.push({
                                format: 'WOFF2',
                                path: woff2Path + ' (skipped)',
                            });
                        }
                        else {
                            await fs.writeFile(woff2Path, woff2BufferData);
                            results.push({ format: 'WOFF2', path: woff2Path });
                        }
                    }
                    else {
                        await fs.writeFile(woff2Path, woff2BufferData);
                        results.push({ format: 'WOFF2', path: woff2Path });
                    }
                }
                catch (error) {
                    console.error('WOFF2 conversion error:', error);
                    results.push({ format: 'WOFF2', path: 'conversion failed' });
                    vscode.window.showErrorMessage(`WOFF2 conversion failed: ${error}`);
                }
            }
            progress.report({ increment: 100, message: 'Complete!' });
            const successfulResults = results.filter(r => !r.path.includes('failed'));
            const failedResults = results.filter(r => r.path.includes('failed'));
            if (successfulResults.length > 0) {
                const message = successfulResults
                    .map(r => `${r.format}: ${path.basename(r.path)}`)
                    .join(', ');
                vscode.window.showInformationMessage(`✅ Font converted successfully! ${message}`);
            }
            if (failedResults.length > 0) {
                const failedMessage = failedResults
                    .map(r => `${r.format}`)
                    .join(', ');
                vscode.window.showWarningMessage(`⚠️ Some conversions failed: ${failedMessage}`);
            }
        });
        const openFolder = await vscode.window.showInformationMessage('Open containing folder?', 'Yes', 'No');
        if (openFolder === 'Yes') {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`❌ Conversion failed: ${error.message}`);
        console.error(error);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map