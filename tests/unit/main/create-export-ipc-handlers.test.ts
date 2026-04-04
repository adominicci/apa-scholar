import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type { ReferenceEntry } from '@domain/references/reference-entry';

const writeFile = vi.fn();
const showSaveDialog = vi.fn();

class MockBrowserWindow {
  static instances: MockBrowserWindow[] = [];

  static getFocusedWindow = vi.fn();
  static getAllWindows = vi.fn(() => MockBrowserWindow.instances);

  readonly webContents = {
    send: vi.fn(),
    printToPDF: vi.fn(async () => Buffer.from('pdf')),
  };

  readonly loadURL = vi.fn(async () => {});
  readonly loadFile = vi.fn(async () => {});

  private destroyed = false;

  constructor(_options: unknown) {
    MockBrowserWindow.instances.push(this);
  }

  isDestroyed() {
    return this.destroyed;
  }

  destroy() {
    this.destroyed = true;
  }
}

const ipcMain = new EventEmitter();

vi.mock('node:fs/promises', () => ({
  writeFile,
}));

vi.mock('electron', () => ({
  BrowserWindow: MockBrowserWindow,
  dialog: {
    showSaveDialog,
  },
  ipcMain,
}));

const buildAggregate = (): StoredPaperAggregate => ({
  paper: {
    id: 'paper-1',
    courseId: 'course-1',
    title: 'Test Paper',
    templateId: 'apa-student',
    paperType: 'student',
    language: 'en',
    status: 'draft',
    createdAt: '2026-04-04T00:00:00.000Z',
    updatedAt: '2026-04-04T00:00:00.000Z',
    archivedAt: null,
  },
  paperMeta: {
    paperId: 'paper-1',
    title: 'Test Paper',
    shortTitle: 'Test',
    authorName: 'Student Example',
    institution: 'APA Scholar',
    courseName: 'Writing 101',
    courseCode: 'WRIT-101',
    professorName: 'Professor Example',
    dueDate: '2026-05-01',
    runningHead: null,
    authorNote: null,
    abstractEnabled: false,
    createdAt: '2026-04-04T00:00:00.000Z',
    updatedAt: '2026-04-04T00:00:00.000Z',
  },
  paperContent: {
    paperId: 'paper-1',
    abstractDoc: {},
    bodyDoc: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Body copy for export.' }],
        },
      ],
    },
    createdAt: '2026-04-04T00:00:00.000Z',
    updatedAt: '2026-04-04T00:00:00.000Z',
  },
});

const buildReference = (): ReferenceEntry => ({
  id: 'reference-1',
  paperId: 'paper-1',
  referenceType: 'book',
  fields: {
    authors: [{ family: 'Doe', given: 'Jamie' }],
    year: '2024',
    title: 'Reference Title',
    publisher: 'Academic Press',
  },
  sortKey: 'doe|2024|reference title',
  createdAt: '2026-04-04T00:00:00.000Z',
  updatedAt: '2026-04-04T00:00:00.000Z',
});

describe('createExportPdfHandler', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    MockBrowserWindow.instances = [];
    MockBrowserWindow.getFocusedWindow.mockReset();
    MockBrowserWindow.getAllWindows.mockClear();
    ipcMain.removeAllListeners();
    showSaveDialog.mockReset();
    showSaveDialog.mockResolvedValue({
      canceled: false,
      filePath: '/tmp/test-paper.pdf',
    });
    writeFile.mockReset();
  });

  it('loads the print renderer entry html in development', async () => {
    vi.stubGlobal('PRINT_WINDOW_VITE_DEV_SERVER_URL', 'http://localhost:5173');

    const { createExportPdfHandler } = await import('@main/ipc/create-export-ipc-handlers');

    const handler = createExportPdfHandler({
      getAggregate: () => buildAggregate(),
      getReferences: () => [],
      printPreloadPath: '/tmp/print-preload.js',
    });

    const exportPromise = handler({ paperId: 'paper-1' });
    await vi.waitFor(() => {
      expect(MockBrowserWindow.instances).toHaveLength(1);
    });

    const printWindow = MockBrowserWindow.instances[0]!;
    expect(printWindow.loadURL).toHaveBeenCalledWith('http://localhost:5173/print.html');

    ipcMain.emit('export:ready', { sender: printWindow.webContents });
    ipcMain.emit('export:rendered', { sender: printWindow.webContents });

    await exportPromise;
  });

  it('loads the built print renderer html in production', async () => {
    const { createExportPdfHandler } = await import('@main/ipc/create-export-ipc-handlers');

    const handler = createExportPdfHandler({
      getAggregate: () => buildAggregate(),
      getReferences: () => [],
      printPreloadPath: '/tmp/print-preload.js',
    });

    const exportPromise = handler({ paperId: 'paper-1' });
    await vi.waitFor(() => {
      expect(MockBrowserWindow.instances).toHaveLength(1);
    });

    const printWindow = MockBrowserWindow.instances[0]!;
    expect(printWindow.loadFile).toHaveBeenCalledWith(
      expect.stringMatching(/renderer[\\/]print_window[\\/]print\.html$/),
    );

    ipcMain.emit('export:ready', { sender: printWindow.webContents });
    ipcMain.emit('export:rendered', { sender: printWindow.webContents });

    await exportPromise;
  });

  it('re-sends export data when the print renderer announces readiness again before rendering completes', async () => {
    const { createExportPdfHandler } = await import('@main/ipc/create-export-ipc-handlers');

    const aggregate = buildAggregate();
    const references = [buildReference()];
    const handler = createExportPdfHandler({
      getAggregate: () => aggregate,
      getReferences: () => references,
      printPreloadPath: '/tmp/print-preload.js',
    });

    const exportPromise = handler({ paperId: 'paper-1' });
    await vi.waitFor(() => {
      expect(ipcMain.listenerCount('export:ready')).toBeGreaterThan(0);
      expect(ipcMain.listenerCount('export:rendered')).toBeGreaterThan(0);
    });

    const printWindow = MockBrowserWindow.instances[0];
    expect(printWindow).toBeDefined();

    ipcMain.emit('export:ready', { sender: printWindow!.webContents });
    ipcMain.emit('export:ready', { sender: printWindow!.webContents });
    ipcMain.emit('export:rendered', { sender: printWindow!.webContents });

    await expect(exportPromise).resolves.toEqual({
      status: 'success',
      filePath: '/tmp/test-paper.pdf',
    });

    expect(printWindow!.webContents.send).toHaveBeenCalledTimes(2);
    expect(printWindow!.webContents.send).toHaveBeenNthCalledWith(1, 'export:data', {
      aggregate,
      references,
    });
    expect(printWindow!.webContents.send).toHaveBeenNthCalledWith(2, 'export:data', {
      aggregate,
      references,
    });
    expect(writeFile).toHaveBeenCalledWith('/tmp/test-paper.pdf', Buffer.from('pdf'));
  });
});
