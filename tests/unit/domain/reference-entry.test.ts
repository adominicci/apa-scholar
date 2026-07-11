import { describe, expect, it } from 'vitest';
import {
  computeReferenceSortKey,
  createReferenceInputSchema,
  parseReferenceFields,
  referenceAuthorSchema,
  referenceEntrySchema,
  referenceTypeSchema,
  updateReferenceInputSchema,
} from '@domain/references/reference-entry';

const validAuthor = { family: 'Smith', given: 'John' };
const validTimestamp = '2026-03-07T14:00:00.000Z';

describe('reference entry schemas', () => {
  it('parses all supported reference types', () => {
    const types = [
      'journal-article',
      'book',
      'edited-book-chapter',
      'website',
      'conference-paper',
      'report',
    ];

    for (const type of types) {
      expect(referenceTypeSchema.parse(type)).toBe(type);
    }
  });

  it('rejects an unsupported reference type', () => {
    expect(() => referenceTypeSchema.parse('newspaper')).toThrow(
      /reference type/i,
    );
  });

  it('parses a valid reference author', () => {
    const author = referenceAuthorSchema.parse({
      family: 'Rivera',
      given: 'Avery',
      isGroup: false,
    });

    expect(author.family).toBe('Rivera');
    expect(author.isGroup).toBe(false);
  });

  it('rejects an author with empty family name', () => {
    expect(() =>
      referenceAuthorSchema.parse({ family: '', given: 'Avery' }),
    ).toThrow(/family/i);
  });

  it('parses a persisted reference entry', () => {
    const entry = referenceEntrySchema.parse({
      id: 'ref-1',
      paperId: 'paper-1',
      referenceType: 'journal-article',
      fields: {
        authors: [validAuthor],
        year: '2020',
        title: 'A Study',
        journalName: 'Science',
      },
      sortKey: 'smith|2020|a study',
      createdAt: validTimestamp,
      updatedAt: validTimestamp,
    });

    expect(entry.referenceType).toBe('journal-article');
    expect(entry.sortKey).toBe('smith|2020|a study');
  });

  it('validates journal-article fields through parseReferenceFields', () => {
    const fields = parseReferenceFields('journal-article', {
      authors: [validAuthor],
      year: '2020',
      title: 'A Study on Effects',
      journalName: 'Journal of Psychology',
      volume: '42',
      issue: '3',
      pages: '100-115',
      doi: '10.1234/example',
    });

    expect(fields.title).toBe('A Study on Effects');
  });

  it('validates book fields', () => {
    const fields = parseReferenceFields('book', {
      authors: [validAuthor],
      year: '2019',
      title: 'Publication Manual',
      publisher: 'American Psychological Association',
      edition: '7th',
    });

    expect(fields.title).toBe('Publication Manual');
  });

  it('validates edited-book-chapter fields', () => {
    const fields = parseReferenceFields('edited-book-chapter', {
      authors: [validAuthor],
      year: '2021',
      title: 'Chapter Title',
      bookTitle: 'Handbook of Research',
      editors: [{ family: 'Editor', given: 'Jane' }],
      publisher: 'Academic Press',
      pages: '50-75',
    });

    expect(fields.title).toBe('Chapter Title');
  });

  it('validates website fields', () => {
    const fields = parseReferenceFields('website', {
      authors: [validAuthor],
      year: '2023',
      title: 'Article Title',
      url: 'https://example.com/article',
      siteName: 'Example Site',
    });

    expect(fields.title).toBe('Article Title');
  });

  it('validates conference-paper fields', () => {
    const fields = parseReferenceFields('conference-paper', {
      authors: [validAuthor],
      year: '2022',
      title: 'Paper Presentation',
      conferenceName: 'APA Annual Convention',
      location: 'Washington, DC',
    });

    expect(fields.title).toBe('Paper Presentation');
  });

  it('validates report fields', () => {
    const fields = parseReferenceFields('report', {
      authors: [validAuthor],
      year: '2021',
      title: 'Annual Report',
      institution: 'National Institute of Health',
      reportNumber: 'NIH-2021-01',
    });

    expect(fields.title).toBe('Annual Report');
  });

  it('rejects journal-article missing required journalName', () => {
    expect(() =>
      parseReferenceFields('journal-article', {
        authors: [validAuthor],
        year: '2020',
        title: 'A Study',
      }),
    ).toThrow(/journal/i);
  });

  it('rejects fields with no authors', () => {
    expect(() =>
      parseReferenceFields('book', {
        authors: [],
        year: '2020',
        title: 'Empty Authors',
        publisher: 'Some Press',
      }),
    ).toThrow(/author/i);
  });

  it('allows null year for references with no date', () => {
    const fields = parseReferenceFields('book', {
      authors: [validAuthor],
      year: null,
      title: 'Undated Work',
      publisher: 'Some Press',
    });

    expect(fields.year).toBeNull();
  });
});

describe('computeReferenceSortKey', () => {
  it('computes sort key from first author, year, and title', () => {
    const key = computeReferenceSortKey('journal-article', {
      authors: [{ family: 'Zeta', given: 'Alpha' }],
      year: '2020',
      title: 'Behavioral Effects',
      journalName: 'Science',
    });

    expect(key).toBe('zeta|2020|behavioral effects');
  });

  it('strips leading articles from title in sort key', () => {
    const key = computeReferenceSortKey('book', {
      authors: [validAuthor],
      year: '2019',
      title: 'The Publication Manual',
      publisher: 'APA',
    });

    expect(key).toBe('smith|2019|publication manual');
  });

  it('uses 9999 for null year so undated works sort last', () => {
    const key = computeReferenceSortKey('book', {
      authors: [validAuthor],
      year: null,
      title: 'Undated Work',
      publisher: 'APA',
    });

    expect(key).toContain('|9999|');
  });

  it('sorts alphabetically by author last name', () => {
    const keyA = computeReferenceSortKey('book', {
      authors: [{ family: 'Adams', given: 'A' }],
      year: '2020',
      title: 'Work',
      publisher: 'APA',
    });
    const keyZ = computeReferenceSortKey('book', {
      authors: [{ family: 'Zimmerman', given: 'Z' }],
      year: '2020',
      title: 'Work',
      publisher: 'APA',
    });

    expect(keyA < keyZ).toBe(true);
  });
});

describe('createReferenceInputSchema', () => {
  it('validates a valid create input', () => {
    const input = createReferenceInputSchema.parse({
      paperId: 'paper-1',
      referenceType: 'journal-article',
      fields: {
        authors: [validAuthor],
        year: '2020',
        title: 'A Study',
        journalName: 'Science',
      },
    });

    expect(input.paperId).toBe('paper-1');
    expect(input.referenceType).toBe('journal-article');
  });

  it('rejects create input with empty paperId', () => {
    expect(() =>
      createReferenceInputSchema.parse({
        paperId: '',
        referenceType: 'book',
        fields: {},
      }),
    ).toThrow(/paper/i);
  });
});

describe('updateReferenceInputSchema', () => {
  it('validates a partial update with only referenceType', () => {
    const input = updateReferenceInputSchema.parse({
      referenceType: 'book',
    });

    expect(input.referenceType).toBe('book');
  });

  it('rejects an empty update', () => {
    expect(() => updateReferenceInputSchema.parse({})).toThrow(/at least one/i);
  });
});
