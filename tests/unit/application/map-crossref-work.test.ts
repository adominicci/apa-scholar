import { describe, expect, it } from 'vitest';
import { mapCrossRefWork } from '@application/services/map-crossref-work';

const validJournalArticleEnvelope = {
  status: 'ok',
  message: {
    DOI: '10.1234/example.2026',
    author: [{ family: 'Rivera', given: 'Avery' }],
    'container-title': ['Journal of Academic Writing'],
    issue: '2',
    page: '10-24',
    published: { 'date-parts': [[2026, 4, 1]] },
    title: ['Guided Academic Writing'],
    type: 'journal-article',
    volume: '8',
  },
};

describe('mapCrossRefWork', () => {
  it('maps a validated supported CrossRef work into normalized reference metadata', () => {
    expect(mapCrossRefWork(validJournalArticleEnvelope)).toEqual({
      metadata: {
        authors: [{ family: 'Rivera', given: 'Avery' }],
        doi: 'https://doi.org/10.1234/example.2026',
        issue: '2',
        journalName: 'Journal of Academic Writing',
        pages: '10-24',
        referenceType: 'journal-article',
        title: 'Guided Academic Writing',
        volume: '8',
        year: '2026',
      },
      ok: true,
    });
  });

  it('normalizes an organizational CrossRef author as a group author', () => {
    expect(
      mapCrossRefWork({
        ...validJournalArticleEnvelope,
        message: {
          ...validJournalArticleEnvelope.message,
          author: [{ name: 'World Health Organization' }],
        },
      }),
    ).toMatchObject({
      metadata: {
        authors: [
          {
            family: 'World Health Organization',
            given: '',
            isGroup: true,
          },
        ],
      },
      ok: true,
    });
  });

  it('preserves a personal CrossRef author when the given name is absent', () => {
    expect(
      mapCrossRefWork({
        ...validJournalArticleEnvelope,
        message: {
          ...validJournalArticleEnvelope.message,
          author: [{ family: 'Rivera' }],
        },
      }),
    ).toMatchObject({
      metadata: {
        authors: [{ family: 'Rivera', given: '' }],
      },
      ok: true,
    });
  });

  it('normalizes organizational and family-only CrossRef editors', () => {
    expect(
      mapCrossRefWork({
        ...validJournalArticleEnvelope,
        message: {
          ...validJournalArticleEnvelope.message,
          'container-title': ['Handbook of Academic Writing'],
          editor: [{ name: 'APA Editorial Board' }, { family: 'Santiago' }],
          publisher: 'Academic Press',
          type: 'book-chapter',
        },
      }),
    ).toMatchObject({
      metadata: {
        editors: [
          { family: 'APA Editorial Board', given: '', isGroup: true },
          { family: 'Santiago', given: '' },
        ],
      },
      ok: true,
    });
  });

  it('rejects a CrossRef contributor without a family or organization name', () => {
    expect(
      mapCrossRefWork({
        ...validJournalArticleEnvelope,
        message: {
          ...validJournalArticleEnvelope.message,
          author: [{ given: 'Avery' }],
        },
      }),
    ).toEqual({
      ok: false,
      reason: 'invalid-response',
    });
  });

  it.each([
    null,
    {},
    { message: {} },
    { message: { title: ['Missing fields'] } },
  ])(
    'returns a controlled invalid-response failure for malformed input %#',
    (input: unknown) => {
      expect(mapCrossRefWork(input)).toEqual({
        ok: false,
        reason: 'invalid-response',
      });
    },
  );

  it('returns a controlled failure for an unsupported CrossRef work type', () => {
    expect(
      mapCrossRefWork({
        ...validJournalArticleEnvelope,
        message: {
          ...validJournalArticleEnvelope.message,
          type: 'dataset',
        },
      }),
    ).toEqual({
      ok: false,
      reason: 'unsupported-type',
    });
  });
});
