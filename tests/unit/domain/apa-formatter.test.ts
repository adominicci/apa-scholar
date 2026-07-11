import { describe, expect, it } from 'vitest';
import {
  formatInTextCitation,
  formatReferenceApa,
  formatReferenceApaPlainText,
} from '@domain/references/apa-formatter';
import type { ReferenceEntry } from '@domain/references/reference-entry';

const timestamp = '2026-03-07T14:00:00.000Z';

const makeEntry = (
  referenceType: ReferenceEntry['referenceType'],
  fields: Record<string, unknown>,
): ReferenceEntry => ({
  id: 'ref-1',
  paperId: 'paper-1',
  referenceType,
  fields,
  sortKey: 'test',
  createdAt: timestamp,
  updatedAt: timestamp,
});

describe('formatReferenceApa', () => {
  it('formats a journal article with all fields', () => {
    const entry = makeEntry('journal-article', {
      authors: [{ family: 'Smith', given: 'John' }],
      year: '2020',
      title: 'Effective strategies for APA formatting',
      journalName: 'Journal of Writing Studies',
      volume: '12',
      issue: '3',
      pages: '45-67',
      doi: '10.1234/jws.2020.001',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Smith, J.');
    expect(text).toContain('(2020)');
    expect(text).toContain('Effective strategies for APA formatting');
    expect(text).toContain('Journal of Writing Studies');
    expect(text).toContain('12');
    expect(text).toContain('(3)');
    expect(text).toContain('45-67');
    expect(text).toContain('https://doi.org/10.1234/jws.2020.001');
  });

  it('formats a journal article with italicised journal name', () => {
    const entry = makeEntry('journal-article', {
      authors: [{ family: 'Doe', given: 'Jane' }],
      year: '2021',
      title: 'A study',
      journalName: 'Nature',
      volume: '5',
    });

    const segments = formatReferenceApa(entry);
    const italicSegments = segments.filter((s) => s.italic);
    expect(italicSegments.some((s) => s.text.includes('Nature'))).toBe(true);
  });

  it('formats a book', () => {
    const entry = makeEntry('book', {
      authors: [{ family: 'Brown', given: 'Alice Marie' }],
      year: '2019',
      title: 'Academic writing essentials',
      publisher: 'University Press',
      edition: '3rd',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Brown, A. M.');
    expect(text).toContain('(2019)');
    expect(text).toContain('Academic writing essentials');
    expect(text).toContain('(3rd ed.)');
    expect(text).toContain('University Press');
  });

  it('formats an edited book chapter', () => {
    const entry = makeEntry('edited-book-chapter', {
      authors: [{ family: 'Lee', given: 'Sam' }],
      year: '2018',
      title: 'Chapter on methodology',
      bookTitle: 'Research Methods Handbook',
      editors: [{ family: 'Chen', given: 'Wei' }],
      publisher: 'Academic Press',
      pages: '100-120',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Lee, S.');
    expect(text).toContain('In');
    expect(text).toContain('Chen, W. (Ed.)');
    expect(text).toContain('Research Methods Handbook');
    expect(text).toContain('pp. 100-120');
    expect(text).toContain('Academic Press');
  });

  it('formats a website with retrieval date', () => {
    const entry = makeEntry('website', {
      authors: [{ family: 'Garcia', given: 'Maria' }],
      year: '2022',
      title: 'Understanding APA style',
      siteName: 'APA Style Blog',
      retrievalDate: 'March 10, 2026',
      url: 'https://apastyle.apa.org/style',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Garcia, M.');
    expect(text).toContain('APA Style Blog');
    expect(text).toContain(
      'Retrieved March 10, 2026, from https://apastyle.apa.org/style',
    );
  });

  it('formats a conference paper', () => {
    const entry = makeEntry('conference-paper', {
      authors: [{ family: 'Kim', given: 'Hana' }],
      year: '2023',
      title: 'New approaches to citation analysis',
      conferenceName: 'International Writing Conference',
      location: 'Chicago, IL',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Kim, H.');
    expect(text).toContain('[Paper presentation]');
    expect(text).toContain('International Writing Conference');
    expect(text).toContain('Chicago, IL');
  });

  it('formats a report', () => {
    const entry = makeEntry('report', {
      authors: [{ family: 'Williams', given: 'Robert' }],
      year: '2021',
      title: 'Annual education outcomes',
      institution: 'Department of Education',
      reportNumber: 'Report No. 42',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Williams, R.');
    expect(text).toContain('Annual education outcomes');
    expect(text).toContain('(Report No. 42)');
    expect(text).toContain('Department of Education');
  });

  it('handles n.d. when year is null', () => {
    const entry = makeEntry('book', {
      authors: [{ family: 'Anon', given: 'A' }],
      year: null,
      title: 'Timeless wisdom',
      publisher: 'Old Press',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('(n.d.)');
  });

  it('formats two authors with ampersand', () => {
    const entry = makeEntry('book', {
      authors: [
        { family: 'Smith', given: 'John' },
        { family: 'Doe', given: 'Jane' },
      ],
      year: '2020',
      title: 'Co-authored work',
      publisher: 'Publisher',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('Smith, J., & Doe, J.');
  });

  it('formats organizational and family-only authors without dangling punctuation', () => {
    const entry = makeEntry('book', {
      authors: [
        {
          family: 'World Health Organization',
          given: '',
          isGroup: true,
        },
        { family: 'Santiago', given: '' },
      ],
      year: '2026',
      title: 'Global writing guidance',
      publisher: 'Academic Press',
    });

    expect(formatReferenceApaPlainText(entry)).toMatch(
      /^World Health Organization, & Santiago \(2026\)\./,
    );
  });

  it('formats organizational and family-only editors without dangling punctuation', () => {
    const entry = makeEntry('edited-book-chapter', {
      authors: [{ family: 'Rivera', given: 'Avery' }],
      year: '2026',
      title: 'A chapter',
      bookTitle: 'A handbook',
      editors: [
        { family: 'APA Editorial Board', given: '', isGroup: true },
        { family: 'Santiago', given: '' },
      ],
      publisher: 'Academic Press',
    });

    expect(formatReferenceApaPlainText(entry)).toContain(
      'APA Editorial Board, & Santiago (Eds.)',
    );
  });

  it('formats three authors with Oxford comma', () => {
    const entry = makeEntry('book', {
      authors: [
        { family: 'A', given: 'One' },
        { family: 'B', given: 'Two' },
        { family: 'C', given: 'Three' },
      ],
      year: '2020',
      title: 'Triple threat',
      publisher: 'Publisher',
    });

    const text = formatReferenceApaPlainText(entry);
    expect(text).toContain('A, O., B, T., & C, T.');
  });
});

describe('formatInTextCitation', () => {
  it('formats a single author citation', () => {
    const entry = makeEntry('book', {
      authors: [{ family: 'Smith', given: 'John' }],
      year: '2020',
      title: 'Test',
      publisher: 'Test',
    });

    expect(formatInTextCitation(entry)).toBe('(Smith, 2020)');
  });

  it('formats a two-author citation', () => {
    const entry = makeEntry('book', {
      authors: [
        { family: 'Smith', given: 'John' },
        { family: 'Doe', given: 'Jane' },
      ],
      year: '2021',
      title: 'Test',
      publisher: 'Test',
    });

    expect(formatInTextCitation(entry)).toBe('(Smith & Doe, 2021)');
  });

  it('formats a three+ author citation with et al.', () => {
    const entry = makeEntry('book', {
      authors: [
        { family: 'A', given: 'One' },
        { family: 'B', given: 'Two' },
        { family: 'C', given: 'Three' },
      ],
      year: '2022',
      title: 'Test',
      publisher: 'Test',
    });

    expect(formatInTextCitation(entry)).toBe('(A et al., 2022)');
  });

  it('uses n.d. when year is null', () => {
    const entry = makeEntry('book', {
      authors: [{ family: 'X', given: 'Y' }],
      year: null,
      title: 'Test',
      publisher: 'Test',
    });

    expect(formatInTextCitation(entry)).toBe('(X, n.d.)');
  });
});
