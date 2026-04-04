import type { PrintPageBlock } from '@domain/papers/print-page-view-model';

export const PrintBlock = ({ block }: { block: PrintPageBlock }) => {
  if (block.kind === 'body-html') {
    return (
      <div
        className="print-block--body-html"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  return (
    <p
      className={`print-block--${block.kind}`}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
};
