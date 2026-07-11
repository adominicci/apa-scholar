import { describe, expect, it } from 'vitest';
import { mapCrossRefWork } from '@application/services/map-crossref-work';
import { parseReferenceFields } from '@domain/references/reference-entry';
import type { ReferenceFormState } from '@renderer/app/inspector/reference-form-helpers';
import {
  createEmptyFormState,
  formStateToFields,
  validateFormState,
} from '@renderer/app/inspector/reference-form-helpers';

const translate = (key: string): string => key;

const mergeMappedWorkIntoForm = (input: unknown): ReferenceFormState => {
  const result = mapCrossRefWork(input);

  if (!result.ok) {
    throw new Error(`Expected mapped CrossRef work, received ${result.reason}`);
  }

  return {
    ...createEmptyFormState(),
    ...result.metadata,
  };
};

const validateAndParse = (form: ReferenceFormState) => {
  expect(validateFormState(form, translate)).toBeNull();

  const fields = formStateToFields(form);
  const parsed = parseReferenceFields(form.referenceType, fields);

  return { fields, parsed };
};

const journalEnvelope = {
  message: {
    DOI: '10.1234/example.2026',
    'container-title': ['Journal of Academic Writing'],
    published: { 'date-parts': [[2026, 4, 1]] },
    title: ['Guided Academic Writing'],
    type: 'journal-article',
  },
};

describe('CrossRef reference integration', () => {
  it('preserves an organizational author through form validation and domain parsing', () => {
    const form = mergeMappedWorkIntoForm({
      message: {
        ...journalEnvelope.message,
        author: [
          { name: 'World Health Organization' },
          { family: 'Rivera', given: 'Avery' },
        ],
      },
    });

    const { fields, parsed } = validateAndParse(form);
    const expectedAuthors = [
      {
        family: 'World Health Organization',
        given: '',
        isGroup: true,
      },
      { family: 'Rivera', given: 'Avery' },
    ];

    expect(fields.authors).toEqual(expectedAuthors);
    expect(parsed.authors).toEqual(expectedAuthors);
  });

  it('preserves a family-only author through form validation and domain parsing', () => {
    const form = mergeMappedWorkIntoForm({
      message: {
        ...journalEnvelope.message,
        author: [{ family: 'Santiago' }, { family: 'Rivera', given: 'Avery' }],
      },
    });

    const { fields, parsed } = validateAndParse(form);
    const expectedAuthors = [
      { family: 'Santiago', given: '' },
      { family: 'Rivera', given: 'Avery' },
    ];

    expect(fields.authors).toEqual(expectedAuthors);
    expect(parsed.authors).toEqual(expectedAuthors);
  });

  it('preserves organizational and family-only editors through form validation and domain parsing', () => {
    const form = mergeMappedWorkIntoForm({
      message: {
        DOI: '10.1234/chapter.2026',
        author: [{ family: 'Rivera', given: 'Avery' }],
        'container-title': ['Handbook of Academic Writing'],
        editor: [
          { name: 'APA Editorial Board' },
          { family: 'Santiago' },
          { family: 'Chen', given: 'Wei' },
        ],
        published: { 'date-parts': [[2026]] },
        publisher: 'Academic Press',
        title: ['Guided Chapter Writing'],
        type: 'book-chapter',
      },
    });

    const { fields, parsed } = validateAndParse(form);
    const expectedEditors = [
      { family: 'APA Editorial Board', given: '', isGroup: true },
      { family: 'Santiago', given: '' },
      { family: 'Chen', given: 'Wei' },
    ];

    expect(fields.editors).toEqual(expectedEditors);
    expect('editors' in parsed ? parsed.editors : undefined).toEqual(
      expectedEditors,
    );
  });
});
