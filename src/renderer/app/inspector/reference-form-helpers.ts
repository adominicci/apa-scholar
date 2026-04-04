import type {
  ReferenceAuthor,
  ReferenceEntry,
  ReferenceType,
} from '@domain/references/reference-entry';
import { supportedReferenceTypes } from '@domain/references/reference-entry';

export interface ReferenceFormState {
  referenceType: ReferenceType;
  authors: ReferenceAuthor[];
  year: string;
  yearUnknown: boolean;
  title: string;
  doi: string;
  url: string;
  // Journal article
  journalName: string;
  volume: string;
  issue: string;
  pages: string;
  // Book
  publisher: string;
  edition: string;
  // Edited book chapter
  bookTitle: string;
  editors: ReferenceAuthor[];
  // Website
  siteName: string;
  retrievalDate: string;
  // Conference paper
  conferenceName: string;
  location: string;
  // Report
  institution: string;
  reportNumber: string;
}

export interface FieldDefinition {
  key: keyof ReferenceFormState;
  label: string;
  required: boolean;
}

const baseFields: FieldDefinition[] = [
  { key: 'title', label: 'referenceForm.fieldTitle', required: true },
  { key: 'doi', label: 'referenceForm.fieldDoi', required: false },
  { key: 'url', label: 'referenceForm.fieldUrl', required: false },
];

const fieldsByType: Record<ReferenceType, FieldDefinition[]> = {
  'journal-article': [
    ...baseFields,
    { key: 'journalName', label: 'referenceForm.fieldJournalName', required: true },
    { key: 'volume', label: 'referenceForm.fieldVolume', required: false },
    { key: 'issue', label: 'referenceForm.fieldIssue', required: false },
    { key: 'pages', label: 'referenceForm.fieldPages', required: false },
  ],
  'book': [
    ...baseFields,
    { key: 'publisher', label: 'referenceForm.fieldPublisher', required: true },
    { key: 'edition', label: 'referenceForm.fieldEdition', required: false },
  ],
  'edited-book-chapter': [
    ...baseFields,
    { key: 'bookTitle', label: 'referenceForm.fieldBookTitle', required: true },
    { key: 'publisher', label: 'referenceForm.fieldPublisher', required: true },
    { key: 'pages', label: 'referenceForm.fieldPages', required: false },
    { key: 'edition', label: 'referenceForm.fieldEdition', required: false },
  ],
  'website': [
    ...baseFields,
    { key: 'siteName', label: 'referenceForm.fieldSiteName', required: false },
    { key: 'retrievalDate', label: 'referenceForm.fieldRetrievalDate', required: false },
  ],
  'conference-paper': [
    ...baseFields,
    { key: 'conferenceName', label: 'referenceForm.fieldConferenceName', required: true },
    { key: 'location', label: 'referenceForm.fieldLocation', required: false },
  ],
  'report': [
    ...baseFields,
    { key: 'institution', label: 'referenceForm.fieldInstitution', required: true },
    { key: 'reportNumber', label: 'referenceForm.fieldReportNumber', required: false },
  ],
};

export const getFieldsForType = (referenceType: ReferenceType): FieldDefinition[] =>
  fieldsByType[referenceType];

export const typeLabelKeys: Record<ReferenceType, string> = {
  'journal-article': 'referenceForm.typeJournalArticle',
  'book': 'referenceForm.typeBook',
  'edited-book-chapter': 'referenceForm.typeEditedBookChapter',
  'website': 'referenceForm.typeWebsite',
  'conference-paper': 'referenceForm.typeConferencePaper',
  'report': 'referenceForm.typeReport',
};

export const emptyAuthor = (): ReferenceAuthor => ({ family: '', given: '' });

export const createEmptyFormState = (): ReferenceFormState => ({
  referenceType: 'journal-article',
  authors: [emptyAuthor()],
  year: '',
  yearUnknown: false,
  title: '',
  doi: '',
  url: '',
  journalName: '',
  volume: '',
  issue: '',
  pages: '',
  publisher: '',
  edition: '',
  bookTitle: '',
  editors: [emptyAuthor()],
  siteName: '',
  retrievalDate: '',
  conferenceName: '',
  location: '',
  institution: '',
  reportNumber: '',
});

export const referenceToFormState = (entry: ReferenceEntry): ReferenceFormState => {
  const fields = entry.fields as Record<string, unknown>;
  const authors = (fields.authors as ReferenceAuthor[] | undefined) ?? [emptyAuthor()];
  const editors = (fields.editors as ReferenceAuthor[] | undefined) ?? [emptyAuthor()];
  const year = fields.year as string | null;

  return {
    referenceType: entry.referenceType,
    authors: authors.length > 0 ? authors : [emptyAuthor()],
    year: year ?? '',
    yearUnknown: year === null,
    title: (fields.title as string) ?? '',
    doi: (fields.doi as string) ?? '',
    url: (fields.url as string) ?? '',
    journalName: (fields.journalName as string) ?? '',
    volume: (fields.volume as string) ?? '',
    issue: (fields.issue as string) ?? '',
    pages: (fields.pages as string) ?? '',
    publisher: (fields.publisher as string) ?? '',
    edition: (fields.edition as string) ?? '',
    bookTitle: (fields.bookTitle as string) ?? '',
    editors: editors.length > 0 ? editors : [emptyAuthor()],
    siteName: (fields.siteName as string) ?? '',
    retrievalDate: (fields.retrievalDate as string) ?? '',
    conferenceName: (fields.conferenceName as string) ?? '',
    location: (fields.location as string) ?? '',
    institution: (fields.institution as string) ?? '',
    reportNumber: (fields.reportNumber as string) ?? '',
  };
};

const trimOrNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const formStateToFields = (
  form: ReferenceFormState,
): Record<string, unknown> => {
  const validAuthors = form.authors.filter(
    (a) => a.family.trim().length > 0 && a.given.trim().length > 0,
  );

  const base: Record<string, unknown> = {
    authors: validAuthors.length > 0 ? validAuthors : form.authors,
    year: form.yearUnknown ? null : trimOrNull(form.year),
    title: form.title.trim(),
    doi: trimOrNull(form.doi),
    url: trimOrNull(form.url),
  };

  switch (form.referenceType) {
    case 'journal-article':
      return {
        ...base,
        journalName: form.journalName.trim(),
        volume: trimOrNull(form.volume),
        issue: trimOrNull(form.issue),
        pages: trimOrNull(form.pages),
      };
    case 'book':
      return {
        ...base,
        publisher: form.publisher.trim(),
        edition: trimOrNull(form.edition),
      };
    case 'edited-book-chapter': {
      const validEditors = form.editors.filter(
        (e) => e.family.trim().length > 0 && e.given.trim().length > 0,
      );
      return {
        ...base,
        bookTitle: form.bookTitle.trim(),
        editors: validEditors.length > 0 ? validEditors : form.editors,
        publisher: form.publisher.trim(),
        pages: trimOrNull(form.pages),
        edition: trimOrNull(form.edition),
      };
    }
    case 'website':
      return {
        ...base,
        siteName: trimOrNull(form.siteName),
        retrievalDate: trimOrNull(form.retrievalDate),
      };
    case 'conference-paper':
      return {
        ...base,
        conferenceName: form.conferenceName.trim(),
        location: trimOrNull(form.location),
      };
    case 'report':
      return {
        ...base,
        institution: form.institution.trim(),
        reportNumber: trimOrNull(form.reportNumber),
      };
  }
};

export const validateFormState = (
  form: ReferenceFormState,
  t: (key: string, options?: Record<string, string>) => string,
): string | null => {
  const validAuthors = form.authors.filter(
    (a) => a.family.trim().length > 0,
  );

  if (validAuthors.length === 0) {
    return t('validation.authorRequired');
  }

  const partialAuthors = form.authors.filter(
    (a) =>
      (a.family.trim().length > 0 && a.given.trim().length === 0) ||
      (a.family.trim().length === 0 && a.given.trim().length > 0),
  );

  if (partialAuthors.length > 0) {
    return t('validation.authorIncomplete');
  }

  if (!form.title.trim()) {
    return t('validation.titleRequired');
  }

  if (!form.yearUnknown && form.year.trim().length > 0 && !/^\d{4}$/.test(form.year.trim())) {
    return t('validation.yearInvalid');
  }

  const requiredFields = getFieldsForType(form.referenceType).filter((f) => f.required);

  for (const field of requiredFields) {
    if (field.key === 'title') continue;
    const value = form[field.key];

    if (typeof value === 'string' && !value.trim()) {
      return t('validation.fieldRequired', { label: t(field.label) });
    }
  }

  if (form.referenceType === 'edited-book-chapter') {
    const validEditors = form.editors.filter((e) => e.family.trim().length > 0);

    if (validEditors.length === 0) {
      return t('validation.editorRequired');
    }
  }

  return null;
};

export { supportedReferenceTypes };
