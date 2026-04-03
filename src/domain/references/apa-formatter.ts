import type {
  ReferenceAuthor,
  ReferenceEntry,
  ReferenceType,
} from '@domain/references/reference-entry';

export interface ReferenceFormattedSegment {
  text: string;
  italic: boolean;
}

// ---------------------------------------------------------------------------
// Author formatting helpers (APA 7th edition)
// ---------------------------------------------------------------------------

const formatAuthorName = (author: ReferenceAuthor): string => {
  if (author.isGroup) {
    return author.family;
  }

  const initials = author.given
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part[0]!.toUpperCase()}.`)
    .join(' ');

  return `${author.family}, ${initials}`;
};

const formatAuthors = (authors: ReferenceAuthor[]): string => {
  if (authors.length === 0) return '';
  if (authors.length === 1) return formatAuthorName(authors[0]!);

  if (authors.length === 2) {
    return `${formatAuthorName(authors[0]!)}, & ${formatAuthorName(authors[1]!)}`;
  }

  if (authors.length <= 20) {
    const allButLast = authors
      .slice(0, -1)
      .map(formatAuthorName)
      .join(', ');
    return `${allButLast}, & ${formatAuthorName(authors[authors.length - 1]!)}`;
  }

  // 21+ authors: first 19, then ellipsis, then last
  const first19 = authors.slice(0, 19).map(formatAuthorName).join(', ');
  return `${first19}, . . . ${formatAuthorName(authors[authors.length - 1]!)}`;
};

const formatEditors = (editors: ReferenceAuthor[]): string => {
  const names =
    editors.length === 1
      ? formatAuthorName(editors[0]!)
      : formatAuthors(editors);
  return editors.length === 1 ? `${names} (Ed.)` : `${names} (Eds.)`;
};

// ---------------------------------------------------------------------------
// Common field helpers
// ---------------------------------------------------------------------------

type Fields = Record<string, unknown>;

const str = (fields: Fields, key: string): string | null => {
  const value = fields[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const authors = (fields: Fields): ReferenceAuthor[] =>
  (Array.isArray(fields.authors) ? fields.authors : []) as ReferenceAuthor[];

const yearSegment = (fields: Fields): string => {
  const year = str(fields, 'year');
  return year ? ` (${year}). ` : ' (n.d.). ';
};

const doiOrUrl = (fields: Fields): string => {
  const doi = str(fields, 'doi');
  if (doi) return doi.startsWith('http') ? ` ${doi}` : ` https://doi.org/${doi}`;
  const url = str(fields, 'url');
  return url ? ` ${url}` : '';
};

// ---------------------------------------------------------------------------
// Per-type formatters
// Each returns an array of { text, italic } segments.
// ---------------------------------------------------------------------------

const formatJournalArticle = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: false });
  segs.push({ text: '. ', italic: false });

  const journal = str(fields, 'journalName') ?? '';
  const volume = str(fields, 'volume');
  const issue = str(fields, 'issue');
  const pages = str(fields, 'pages');

  // "Journal Name, Volume"  (italic)
  let journalPart = journal;
  if (volume) journalPart += `, ${volume}`;
  segs.push({ text: journalPart, italic: true });

  // "(issue)" not italic
  if (issue) segs.push({ text: `(${issue})`, italic: false });

  // ", pages."
  if (pages) segs.push({ text: `, ${pages}`, italic: false });
  segs.push({ text: '.', italic: false });

  const link = doiOrUrl(fields);
  if (link) segs.push({ text: link, italic: false });

  return segs;
};

const formatBook = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: true });

  const edition = str(fields, 'edition');
  if (edition) segs.push({ text: ` (${edition} ed.)`, italic: false });

  segs.push({ text: '. ', italic: false });

  const publisher = str(fields, 'publisher');
  if (publisher) segs.push({ text: `${publisher}.`, italic: false });

  const link = doiOrUrl(fields);
  if (link) segs.push({ text: link, italic: false });

  return segs;
};

const formatEditedBookChapter = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: false });
  segs.push({ text: '. In ', italic: false });

  const editors = (Array.isArray(fields.editors) ? fields.editors : []) as ReferenceAuthor[];
  if (editors.length > 0) {
    segs.push({ text: `${formatEditors(editors)}, `, italic: false });
  }

  segs.push({ text: str(fields, 'bookTitle') ?? 'Untitled', italic: true });

  const pages = str(fields, 'pages');
  const edition = str(fields, 'edition');
  const parenthetical = [edition ? `${edition} ed.` : null, pages ? `pp. ${pages}` : null]
    .filter(Boolean)
    .join(', ');
  if (parenthetical) segs.push({ text: ` (${parenthetical})`, italic: false });

  segs.push({ text: '. ', italic: false });

  const publisher = str(fields, 'publisher');
  if (publisher) segs.push({ text: `${publisher}.`, italic: false });

  const link = doiOrUrl(fields);
  if (link) segs.push({ text: link, italic: false });

  return segs;
};

const formatWebsite = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: true });
  segs.push({ text: '. ', italic: false });

  const siteName = str(fields, 'siteName');
  if (siteName) segs.push({ text: `${siteName}. `, italic: false });

  const retrievalDate = str(fields, 'retrievalDate');
  const url = str(fields, 'url');
  if (retrievalDate && url) {
    segs.push({ text: `Retrieved ${retrievalDate}, from ${url}`, italic: false });
  } else if (url) {
    segs.push({ text: url, italic: false });
  }

  return segs;
};

const formatConferencePaper = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: true });

  const conference = str(fields, 'conferenceName');
  const location = str(fields, 'location');
  if (conference) {
    const locationSuffix = location ? `, ${location}` : '';
    segs.push({ text: ` [Paper presentation]. ${conference}${locationSuffix}.`, italic: false });
  } else {
    segs.push({ text: '.', italic: false });
  }

  const link = doiOrUrl(fields);
  if (link) segs.push({ text: link, italic: false });

  return segs;
};

const formatReport = (fields: Fields): ReferenceFormattedSegment[] => {
  const segs: ReferenceFormattedSegment[] = [];
  segs.push({ text: formatAuthors(authors(fields)) + yearSegment(fields), italic: false });
  segs.push({ text: str(fields, 'title') ?? 'Untitled', italic: true });

  const reportNumber = str(fields, 'reportNumber');
  if (reportNumber) segs.push({ text: ` (${reportNumber})`, italic: false });

  segs.push({ text: '. ', italic: false });

  const institution = str(fields, 'institution');
  if (institution) segs.push({ text: `${institution}.`, italic: false });

  const link = doiOrUrl(fields);
  if (link) segs.push({ text: link, italic: false });

  return segs;
};

// ---------------------------------------------------------------------------
// Main formatter dispatch
// ---------------------------------------------------------------------------

const formattersByType: Record<
  ReferenceType,
  (fields: Fields) => ReferenceFormattedSegment[]
> = {
  'journal-article': formatJournalArticle,
  'book': formatBook,
  'edited-book-chapter': formatEditedBookChapter,
  'website': formatWebsite,
  'conference-paper': formatConferencePaper,
  'report': formatReport,
};

export const formatReferenceApa = (
  entry: ReferenceEntry,
): ReferenceFormattedSegment[] => {
  const formatter = formattersByType[entry.referenceType];
  return formatter(entry.fields);
};

/**
 * Returns the APA-formatted reference as a single plain-text string
 * (without italic information). Useful for ghost-page rendering.
 */
export const formatReferenceApaPlainText = (entry: ReferenceEntry): string =>
  formatReferenceApa(entry)
    .map((seg) => seg.text)
    .join('');

/**
 * Returns a parenthetical APA in-text citation string for a reference.
 * Single author: (Smith, 2020)
 * Two authors:   (Smith & Jones, 2020)
 * Three+ authors:(Smith et al., 2020)
 */
export const formatInTextCitation = (entry: ReferenceEntry): string => {
  const a = (Array.isArray(entry.fields.authors) ? entry.fields.authors : []) as ReferenceAuthor[];
  const year = typeof entry.fields.year === 'string' && entry.fields.year.trim()
    ? entry.fields.year.trim()
    : 'n.d.';

  if (a.length === 0) return `(${year})`;
  if (a.length === 1) return `(${a[0]!.family}, ${year})`;
  if (a.length === 2) return `(${a[0]!.family} & ${a[1]!.family}, ${year})`;
  return `(${a[0]!.family} et al., ${year})`;
};
