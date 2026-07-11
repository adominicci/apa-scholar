// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from 'i18next';
import type { ReferenceFormState } from '@renderer/app/inspector/reference-form-helpers';
import {
  createEmptyFormState,
  formStateToFields,
  validateFormState,
} from '@renderer/app/inspector/reference-form-helpers';
import { ReferenceFormModal } from '@renderer/app/inspector/ReferenceFormModal';

afterEach(cleanup);

const renderModal = (
  overrides: Partial<Parameters<typeof ReferenceFormModal>[0]> = {},
) => {
  const props = {
    isOpen: true,
    form: createEmptyFormState(),
    editingReferenceId: null,
    errorMessage: null,
    isSubmitting: false,
    onFormChange: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };

  return { ...render(<ReferenceFormModal {...props} />), props };
};

describe('ReferenceFormModal', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <ReferenceFormModal
        isOpen={false}
        form={createEmptyFormState()}
        editingReferenceId={null}
        onFormChange={vi.fn()}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders add-mode heading when not editing', () => {
    renderModal();

    expect(screen.getByText('Add a reference to your list')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add reference' })).toBeVisible();
  });

  it('renders edit-mode heading when editing', () => {
    renderModal({ editingReferenceId: 'ref-1' });

    expect(screen.getByText('Update reference details')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeVisible();
  });

  it('renders the reference type selector with all types', () => {
    const { container } = renderModal();

    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!;
    const select = within(dialog).getByRole('combobox');
    expect(select).toBeVisible();

    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options.map((opt) => opt.textContent)).toEqual([
      'Journal article',
      'Book',
      'Edited book chapter',
      'Website',
      'Conference paper',
      'Report',
    ]);
  });

  it('renders journal-article fields by default', () => {
    renderModal();

    expect(screen.getByPlaceholderText('e.g. 2024')).toBeVisible();

    const labels = screen.getAllByText(
      /Title|Journal name|Volume|Issue|Pages|DOI|URL/,
    );
    const labelTexts = labels.map((el) =>
      el.textContent?.replace(/\s*\*$/, '').trim(),
    );
    expect(labelTexts).toContain('Title');
    expect(labelTexts).toContain('Journal name');
    expect(labelTexts).toContain('Volume');
    expect(labelTexts).toContain('DOI');
    expect(labelTexts).toContain('URL');
  });

  it('renders book fields when type is book', () => {
    const form = createEmptyFormState();
    form.referenceType = 'book';

    renderModal({ form });

    const labels = screen.getAllByText(/Publisher|Edition/);
    const labelTexts = labels.map((el) =>
      el.textContent?.replace(/\s*\*$/, '').trim(),
    );
    expect(labelTexts).toContain('Publisher');
    expect(labelTexts).toContain('Edition');
  });

  it('renders edited-book-chapter fields including editors', () => {
    const form = createEmptyFormState();
    form.referenceType = 'edited-book-chapter';

    renderModal({ form });

    const labels = screen.getAllByText(/Book title|Publisher/);
    const labelTexts = labels.map((el) =>
      el.textContent?.replace(/\s*\*$/, '').trim(),
    );
    expect(labelTexts).toContain('Book title');
    expect(labelTexts).toContain('Publisher');
    expect(screen.getByText('Editors')).toBeVisible();
  });

  it('renders author rows with family and given name inputs', () => {
    renderModal();

    expect(screen.getByLabelText('Authors 1 family name')).toBeVisible();
    expect(screen.getByLabelText('Authors 1 given name')).toBeVisible();
  });

  it('shows error message when provided', () => {
    renderModal({ errorMessage: 'Title is required.' });

    expect(screen.getByText('Title is required.')).toBeVisible();
  });

  it('disables year input when yearUnknown is checked', () => {
    const form = createEmptyFormState();
    form.yearUnknown = true;

    renderModal({ form });

    const yearInput = screen.getByPlaceholderText('e.g. 2024');
    expect(yearInput).toBeDisabled();
  });

  it('calls onSubmit when submit button is clicked', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel is clicked', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows submitting text when isSubmitting is true', () => {
    renderModal({ isSubmitting: true });
    expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();
  });

  it('shows saving text when editing and submitting', () => {
    renderModal({ isSubmitting: true, editingReferenceId: 'ref-1' });
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});

describe('validateFormState', () => {
  const validForm = (): ReferenceFormState => ({
    ...createEmptyFormState(),
    authors: [{ family: 'Smith', given: 'John' }],
    title: 'Test Title',
    year: '2024',
    journalName: 'Test Journal',
  });

  it('returns null for a valid journal-article form', () => {
    expect(validateFormState(validForm(), i18n.t.bind(i18n))).toBeNull();
  });

  it('requires at least one author with a family name', () => {
    const form = validForm();
    form.authors = [{ family: '', given: '' }];

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/author/i);
  });

  it('requires title', () => {
    const form = validForm();
    form.title = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/title/i);
  });

  it('validates year format', () => {
    const form = validForm();
    form.year = 'abc';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/year/i);
  });

  it('allows empty year', () => {
    const form = validForm();
    form.year = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toBeNull();
  });

  it('allows yearUnknown with any year value', () => {
    const form = validForm();
    form.yearUnknown = true;
    form.year = 'abc';

    expect(validateFormState(form, i18n.t.bind(i18n))).toBeNull();
  });

  it('requires journal name for journal-article', () => {
    const form = validForm();
    form.journalName = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/journal name/i);
  });

  it('requires publisher for book', () => {
    const form = validForm();
    form.referenceType = 'book';
    form.publisher = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/publisher/i);
  });

  it('requires conference name for conference-paper', () => {
    const form = validForm();
    form.referenceType = 'conference-paper';
    form.conferenceName = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(
      /conference name/i,
    );
  });

  it('requires institution for report', () => {
    const form = validForm();
    form.referenceType = 'report';
    form.institution = '';

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/institution/i);
  });

  it('requires editors for edited-book-chapter', () => {
    const form = validForm();
    form.referenceType = 'edited-book-chapter';
    form.bookTitle = 'Book';
    form.publisher = 'Press';
    form.editors = [{ family: '', given: '' }];

    expect(validateFormState(form, i18n.t.bind(i18n))).toMatch(/editor/i);
  });
});

describe('formStateToFields', () => {
  it('builds journal-article fields', () => {
    const form = createEmptyFormState();
    form.authors = [{ family: 'Smith', given: 'John' }];
    form.year = '2020';
    form.title = 'Test Article';
    form.journalName = 'Nature';
    form.volume = '42';
    form.issue = '3';
    form.pages = '1-10';
    form.doi = '10.1234/test';

    const fields = formStateToFields(form);

    expect(fields.authors).toEqual([{ family: 'Smith', given: 'John' }]);
    expect(fields.year).toBe('2020');
    expect(fields.title).toBe('Test Article');
    expect(fields.journalName).toBe('Nature');
    expect(fields.volume).toBe('42');
    expect(fields.issue).toBe('3');
    expect(fields.pages).toBe('1-10');
    expect(fields.doi).toBe('10.1234/test');
  });

  it('sets year to null when yearUnknown is true', () => {
    const form = createEmptyFormState();
    form.authors = [{ family: 'Smith', given: 'John' }];
    form.title = 'Test';
    form.journalName = 'J';
    form.yearUnknown = true;
    form.year = '2020';

    const fields = formStateToFields(form);
    expect(fields.year).toBeNull();
  });

  it('sets empty optional strings to null', () => {
    const form = createEmptyFormState();
    form.authors = [{ family: 'Smith', given: 'John' }];
    form.title = 'Test';
    form.journalName = 'J';
    form.volume = '';
    form.doi = '  ';

    const fields = formStateToFields(form);
    expect(fields.volume).toBeNull();
    expect(fields.doi).toBeNull();
  });

  it('builds edited-book-chapter fields with editors', () => {
    const form = createEmptyFormState();
    form.referenceType = 'edited-book-chapter';
    form.authors = [{ family: 'Smith', given: 'John' }];
    form.title = 'Chapter';
    form.bookTitle = 'Handbook';
    form.editors = [{ family: 'Editor', given: 'Ed' }];
    form.publisher = 'Press';

    const fields = formStateToFields(form);
    expect(fields.bookTitle).toBe('Handbook');
    expect(fields.editors).toEqual([{ family: 'Editor', given: 'Ed' }]);
    expect(fields.publisher).toBe('Press');
  });
});
