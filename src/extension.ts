import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Font, woff2 } from 'fonteditor-core';

// Helper functions
async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  return fs.promises
    .access(filePath)
    .then(() => true)
    .catch(() => false);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Easy Font Converter extension is now active');

  // Initialize WOFF2 module
  try {
    if (woff2 && woff2.init) {
      woff2.init();
      console.log('WOFF2 module initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize WOFF2 module:', error);
  }

  // Single file commands
  const convertToWoff = vscode.commands.registerCommand(
    'easy-font-converter.convertToWoff',
    async (uri: vscode.Uri) => {
      const file = uri || (await selectSingleFile());
      if (file) {
        await convertSingleFont(file, 'woff');
      }
    },
  );

  const convertToWoff2 = vscode.commands.registerCommand(
    'easy-font-converter.convertToWoff2',
    async (uri: vscode.Uri) => {
      const file = uri || (await selectSingleFile());
      if (file) {
        await convertSingleFont(file, 'woff2');
      }
    },
  );

  const convertToBoth = vscode.commands.registerCommand(
    'easy-font-converter.convertToBoth',
    async (uri: vscode.Uri) => {
      const file = uri || (await selectSingleFile());
      if (file) {
        await convertSingleFont(file, 'both');
      }
    },
  );

  // Group commands - використовуємо глобальне сховище VS Code
  const groupConvertToWoff = vscode.commands.registerCommand(
    'easy-font-converter.groupConvertToWoff',
    async () => {
      const uris = await getSelectedFilesFromExplorer();
      if (uris.length === 0) {
        vscode.window.showErrorMessage(
          'No font files selected. Please select files first.',
        );
        return;
      }
      await groupConvertFontsSimple(uris, 'woff');
    },
  );

  const groupConvertToWoff2 = vscode.commands.registerCommand(
    'easy-font-converter.groupConvertToWoff2',
    async () => {
      const uris = await getSelectedFilesFromExplorer();
      if (uris.length === 0) {
        vscode.window.showErrorMessage(
          'No font files selected. Please select files first.',
        );
        return;
      }
      await groupConvertFontsSimple(uris, 'woff2');
    },
  );

  const groupConvertToBoth = vscode.commands.registerCommand(
    'easy-font-converter.groupConvertToBoth',
    async () => {
      const uris = await getSelectedFilesFromExplorer();
      if (uris.length === 0) {
        vscode.window.showErrorMessage(
          'No font files selected. Please select files first.',
        );
        return;
      }
      await groupConvertFontsSimple(uris, 'both');
    },
  );

  context.subscriptions.push(
    convertToWoff,
    convertToWoff2,
    convertToBoth,
    groupConvertToWoff,
    groupConvertToWoff2,
    groupConvertToBoth,
  );
}

// Головна функція для отримання виділених файлів з Explorer
async function getSelectedFilesFromExplorer(): Promise<vscode.Uri[]> {
  try {
    // Спосіб 1: Використовуємо стандартну команду VS Code
    const selected = await vscode.commands.executeCommand<vscode.Uri[]>(
      'workbench.explorer.fileView.getSelection',
    );

    if (selected && selected.length > 0) {
      const fontUris = selected.filter(uri => {
        const ext = path.extname(uri.fsPath).toLowerCase();
        return ext === '.ttf' || ext === '.otf';
      });

      if (fontUris.length > 0) {
        console.log(
          'Selected files:',
          fontUris.map(u => path.basename(u.fsPath)),
        );
        return fontUris;
      }
    }
  } catch (error) {
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

async function selectSingleFile(): Promise<vscode.Uri | undefined> {
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
async function groupConvertFontsSimple(
  uris: vscode.Uri[],
  format: 'woff' | 'woff2' | 'both',
) {
  if (uris.length === 0) {
    vscode.window.showErrorMessage('No font files selected');
    return;
  }

  const formatNames = format === 'both' ? 'WOFF & WOFF2' : format.toUpperCase();

  // Підтвердження
  const confirmed = await vscode.window.showInformationMessage(
    `Convert ${uris.length} font file(s) to ${formatNames}?`,
    'Yes',
    'No',
  );

  if (confirmed !== 'Yes') {
    return;
  }

  let successCount = 0;
  let failCount = 0;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Converting ${uris.length} file(s) to ${formatNames}...`,
      cancellable: true,
    },
    async (progress, token) => {
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
        } catch (error: any) {
          failCount++;
          console.error(`❌ Failed to convert ${fileName}:`, error);
        }
      }
    },
  );

  // Результат
  if (successCount > 0) {
    if (failCount > 0) {
      vscode.window.showWarningMessage(
        `✅ Converted: ${successCount} files, ❌ Failed: ${failCount} files`,
      );
    } else {
      vscode.window.showInformationMessage(
        `✅ Successfully converted ${successCount} file(s) to ${formatNames}`,
      );
    }
  } else {
    vscode.window.showErrorMessage(
      `❌ Conversion failed for all ${failCount} file(s)`,
    );
  }
}

async function convertSingleFont(
  uri: vscode.Uri,
  format: 'woff' | 'woff2' | 'both',
  silent: boolean = false,
) {
  const filePath = uri.fsPath;
  const fileExt = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, fileExt);

  const config = vscode.workspace.getConfiguration('easyFontConverter');
  const outputDir = config.get<string>('outputDirectory') || '';
  const enableHinting = config.get<boolean>('enableHinting') ?? true;
  const overwriteExisting = config.get<boolean>('overwriteExisting') ?? false;

  const outputPath = outputDir ? path.join(outputDir) : dir;
  await ensureDir(outputPath);

  const fontBuffer = await fs.promises.readFile(filePath);

  const font = Font.create(fontBuffer, {
    type: fileExt === '.ttf' ? 'ttf' : 'otf',
    hinting: enableHinting,
  });

  if (format === 'woff' || format === 'both') {
    const woffBuffer = font.write({
      type: 'woff',
      hinting: enableHinting,
    });

    const woffPath = path.join(outputPath, `${baseName}.woff`);
    const woffBufferData = Buffer.from(woffBuffer as any);

    const exists = await pathExists(woffPath);
    if (!overwriteExisting && exists) {
      if (!silent) {
        const overwrite = await vscode.window.showWarningMessage(
          `${baseName}.woff already exists. Overwrite?`,
          'Yes',
          'No',
        );
        if (overwrite === 'Yes') {
          await fs.promises.writeFile(woffPath, woffBufferData);
        }
      }
    } else {
      await fs.promises.writeFile(woffPath, woffBufferData);
    }
  }

  if (format === 'woff2' || format === 'both') {
    if (woff2 && woff2.init) {
      const isInited = woff2.isInited ? woff2.isInited() : false;
      if (!isInited) {
        woff2.init();
      }
    }

    const woff2Buffer = font.write({
      type: 'woff2',
      hinting: enableHinting,
    });

    const woff2Path = path.join(outputPath, `${baseName}.woff2`);
    const woff2BufferData = Buffer.from(woff2Buffer as any);

    const exists = await pathExists(woff2Path);
    if (!overwriteExisting && exists) {
      if (!silent) {
        const overwrite = await vscode.window.showWarningMessage(
          `${baseName}.woff2 already exists. Overwrite?`,
          'Yes',
          'No',
        );
        if (overwrite === 'Yes') {
          await fs.promises.writeFile(woff2Path, woff2BufferData);
        }
      }
    } else {
      await fs.promises.writeFile(woff2Path, woff2BufferData);
    }
  }

  if (!silent) {
    vscode.window.showInformationMessage(`✅ Font converted: ${baseName}`);
  }
}

export function deactivate() {}
