import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Font, woff2 } from 'fonteditor-core';

export function activate(context: vscode.ExtensionContext) {
  console.log('Easy Font Convert extension is now active');

  // Initialize WOFF2 module
  try {
    if (woff2 && woff2.init) {
      woff2.init();
      console.log('WOFF2 module initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize WOFF2 module:', error);
    vscode.window.showWarningMessage(
      'WOFF2 support may not be available. WOFF conversion will still work.',
    );
  }

  const convertToWoff = vscode.commands.registerCommand(
    'easy-font-convert.convertToWoff',
    async (uri: vscode.Uri) => {
      await convertFont(uri, 'woff');
    },
  );

  const convertToWoff2 = vscode.commands.registerCommand(
    'easy-font-convert.convertToWoff2',
    async (uri: vscode.Uri) => {
      await convertFont(uri, 'woff2');
    },
  );

  const convertToBoth = vscode.commands.registerCommand(
    'easy-font-convert.convertToBoth',
    async (uri: vscode.Uri) => {
      await convertFont(uri, 'both');
    },
  );

  context.subscriptions.push(convertToWoff, convertToWoff2, convertToBoth);
}

async function convertFont(
  uri: vscode.Uri | undefined,
  format: 'woff' | 'woff2' | 'both',
) {
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
  const outputDir = config.get<string>('outputDirectory') || '';
  const enableHinting = config.get<boolean>('enableHinting') ?? true;
  const overwriteExisting = config.get<boolean>('overwriteExisting') ?? false;

  const outputPath = outputDir ? path.join(outputDir) : dir;

  // Create output directory if it doesn't exist
  await fs.ensureDir(outputPath);

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Converting ${path.basename(filePath)}...`,
        cancellable: false,
      },
      async progress => {
        progress.report({ increment: 0, message: 'Reading font file...' });

        const fontBuffer = await fs.readFile(filePath);

        progress.report({ increment: 30, message: 'Processing font data...' });

        const font = Font.create(fontBuffer, {
          type: fileExt === '.ttf' ? 'ttf' : 'otf',
          hinting: enableHinting,
        });

        const results: Array<{ format: string; path: string }> = [];

        if (format === 'woff' || format === 'both') {
          progress.report({ increment: 50, message: 'Converting to WOFF...' });

          try {
            const woffBuffer = font.write({
              type: 'woff',
              hinting: enableHinting,
            });

            const woffPath = path.join(outputPath, `${baseName}.woff`);
            const woffBufferData = Buffer.from(woffBuffer as any);

            if (!overwriteExisting && (await fs.pathExists(woffPath))) {
              const overwrite = await vscode.window.showWarningMessage(
                `${baseName}.woff already exists. Overwrite?`,
                'Yes',
                'No',
              );
              if (overwrite !== 'Yes') {
                results.push({ format: 'WOFF', path: woffPath + ' (skipped)' });
              } else {
                await fs.writeFile(woffPath, woffBufferData);
                results.push({ format: 'WOFF', path: woffPath });
              }
            } else {
              await fs.writeFile(woffPath, woffBufferData);
              results.push({ format: 'WOFF', path: woffPath });
            }
          } catch (error) {
            console.error('WOFF conversion error:', error);
            results.push({ format: 'WOFF', path: 'conversion failed' });
          }
        }

        if (format === 'woff2' || format === 'both') {
          progress.report({ increment: 80, message: 'Converting to WOFF2...' });

          try {
            // Check and initialize WOFF2 module if needed
            if (woff2 && woff2.init) {
              const isInited = woff2.isInited ? woff2.isInited() : false;
              if (!isInited) {
                woff2.init();
                console.log('WOFF2 module initialized on demand');
              }
            }

            const woff2Buffer = font.write({
              type: 'woff2',
              hinting: enableHinting,
            });

            const woff2Path = path.join(outputPath, `${baseName}.woff2`);
            const woff2BufferData = Buffer.from(woff2Buffer as any);

            if (!overwriteExisting && (await fs.pathExists(woff2Path))) {
              const overwrite = await vscode.window.showWarningMessage(
                `${baseName}.woff2 already exists. Overwrite?`,
                'Yes',
                'No',
              );
              if (overwrite !== 'Yes') {
                results.push({
                  format: 'WOFF2',
                  path: woff2Path + ' (skipped)',
                });
              } else {
                await fs.writeFile(woff2Path, woff2BufferData);
                results.push({ format: 'WOFF2', path: woff2Path });
              }
            } else {
              await fs.writeFile(woff2Path, woff2BufferData);
              results.push({ format: 'WOFF2', path: woff2Path });
            }
          } catch (error) {
            console.error('WOFF2 conversion error:', error);
            results.push({ format: 'WOFF2', path: 'conversion failed' });
            vscode.window.showErrorMessage(`WOFF2 conversion failed: ${error}`);
          }
        }

        progress.report({ increment: 100, message: 'Complete!' });

        const successfulResults = results.filter(
          r => !r.path.includes('failed'),
        );
        const failedResults = results.filter(r => r.path.includes('failed'));

        if (successfulResults.length > 0) {
          const message = successfulResults
            .map(r => `${r.format}: ${path.basename(r.path)}`)
            .join(', ');
          vscode.window.showInformationMessage(
            `✅ Font converted successfully! ${message}`,
          );
        }

        if (failedResults.length > 0) {
          const failedMessage = failedResults
            .map(r => `${r.format}`)
            .join(', ');
          vscode.window.showWarningMessage(
            `⚠️ Some conversions failed: ${failedMessage}`,
          );
        }
      },
    );

    const openFolder = await vscode.window.showInformationMessage(
      'Open containing folder?',
      'Yes',
      'No',
    );
    if (openFolder === 'Yes') {
      vscode.commands.executeCommand(
        'revealFileInOS',
        vscode.Uri.file(outputPath),
      );
    }
  } catch (error: any) {
    vscode.window.showErrorMessage(`❌ Conversion failed: ${error.message}`);
    console.error(error);
  }
}

export function deactivate() {}
