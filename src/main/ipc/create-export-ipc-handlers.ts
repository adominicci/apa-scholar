import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { BrowserWindow, dialog, ipcMain } from 'electron';
import { exportPdfPayloadSchema, type ExportResult } from '@application/contracts/export-ipc';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type { ReferenceEntry } from '@domain/references/reference-entry';

const PRINT_WINDOW_TIMEOUT_MS = 15_000;

const getPrintWindowName = (): string =>
  typeof PRINT_WINDOW_VITE_NAME !== 'undefined'
    ? PRINT_WINDOW_VITE_NAME
    : 'print_window';

const getPrintWindowDevServerUrl = (): string | undefined =>
  typeof PRINT_WINDOW_VITE_DEV_SERVER_URL !== 'undefined'
    ? PRINT_WINDOW_VITE_DEV_SERVER_URL
    : undefined;

export const createExportPdfHandler = (deps: {
  getAggregate: (paperId: string) => StoredPaperAggregate | null;
  getReferences: (paperId: string) => ReferenceEntry[];
  printPreloadPath: string;
}) => async (payload: unknown): Promise<ExportResult> => {
  const { paperId } = exportPdfPayloadSchema.parse(payload);

  const aggregate = deps.getAggregate(paperId);
  if (!aggregate) return { status: 'error', message: 'Paper not found.' };

  const references = deps.getReferences(paperId);

  const focusedWindow = BrowserWindow.getFocusedWindow();
  const saveResult = await dialog.showSaveDialog(focusedWindow ?? BrowserWindow.getAllWindows()[0]!, {
    defaultPath: `${aggregate.paper.title || 'paper'}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return { status: 'cancelled' };
  }

  const filePath = saveResult.filePath;
  let printWindow: BrowserWindow | null = null;

  try {
    printWindow = new BrowserWindow({
      show: false,
      width: 816,
      height: 1056,
      webPreferences: {
        preload: deps.printPreloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    const devServerUrl = getPrintWindowDevServerUrl();
    if (devServerUrl) {
      await printWindow.loadURL(devServerUrl);
    } else {
      await printWindow.loadFile(
        path.join(__dirname, `../renderer/${getPrintWindowName()}/index.html`),
      );
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Print renderer timed out.'));
      }, PRINT_WINDOW_TIMEOUT_MS);

      ipcMain.once('export:ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      printWindow!.webContents.send('export:data', { aggregate, references });
    });

    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: false,
      pageSize: 'Letter',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await writeFile(filePath, pdfBuffer);

    return { status: 'success', filePath };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Export failed.',
    };
  } finally {
    if (printWindow && !printWindow.isDestroyed()) {
      printWindow.destroy();
    }
  }
};
