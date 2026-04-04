import { useEffect, useState } from 'react';
import { buildPrintPageViewModels, type PrintPageViewModel } from '@domain/papers/print-page-view-model';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { PrintPage } from '@renderer/print/PrintPage';

interface ExportData {
  aggregate: StoredPaperAggregate;
  references: ReferenceEntry[];
}

export const PrintRenderer = () => {
  const [pages, setPages] = useState<PrintPageViewModel[] | null>(null);

  useEffect(() => {
    const handler = (_event: unknown, raw: unknown) => {
      const data = raw as ExportData;
      const result = buildPrintPageViewModels({
        paper: data.aggregate.paper,
        paperContent: data.aggregate.paperContent,
        paperMeta: data.aggregate.paperMeta,
        references: data.references,
        language: data.aggregate.paper.language,
      });

      setPages(result);
    };

    window.electronPrintBridge?.onExportData(handler);

    // Signal that the renderer has mounted and is listening for export data.
    window.electronPrintBridge?.signalReady();

    return () => {
      window.electronPrintBridge?.removeExportDataListener(handler);
    };
  }, []);

  useEffect(() => {
    if (pages) {
      // Signal that rendering is complete and printToPDF can proceed.
      window.electronPrintBridge?.signalRendered();
    }
  }, [pages]);

  if (!pages) {
    return <div>Preparing export...</div>;
  }

  return (
    <div>
      {pages.map((page, index) => (
        <PrintPage key={index} page={page} />
      ))}
    </div>
  );
};
