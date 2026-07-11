import type { PrintPageViewModel } from '@domain/papers/print-page-view-model';
import { PrintBlock } from '@renderer/print/PrintBlock';

export const PrintPage = ({ page }: { page: PrintPageViewModel }) => (
  <article className="print-page">
    <div className="print-header">
      {page.header.left ? (
        <span className="print-header-left">{page.header.left}</span>
      ) : (
        <span />
      )}
      <span>{page.header.right}</span>
    </div>
    <div
      className={`print-blocks${page.kind === 'title-page' ? ' print-blocks--title-page' : ''}`}
    >
      {page.blocks.map((block, index) => (
        <PrintBlock block={block} key={index} />
      ))}
    </div>
  </article>
);
