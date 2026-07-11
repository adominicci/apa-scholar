// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { ReferencesPanel } from '@renderer/app/inspector/ReferencesPanel';

const createReference = (
  overrides: Partial<ReferenceEntry> = {},
): ReferenceEntry => ({
  id: 'ref-1',
  paperId: 'paper-1',
  referenceType: 'journal-article',
  fields: {
    authors: [{ family: 'Smith', given: 'John' }],
    year: '2020',
    title: 'Cognitive Effects of Sleep Deprivation',
    journalName: 'Journal of Psychology',
  },
  sortKey: 'smith|2020|cognitive effects of sleep deprivation',
  createdAt: '2026-03-07T14:00:00.000Z',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

describe('ReferencesPanel', () => {
  it('renders empty state when there are no references', () => {
    render(
      <ReferencesPanel
        references={[]}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    expect(screen.getByText(/No references yet/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add reference' })).toBeVisible();
  });

  it('renders reference cards with author, year, and title', () => {
    const refs: ReferenceEntry[] = [
      createReference(),
      createReference({
        id: 'ref-2',
        referenceType: 'book',
        fields: {
          authors: [
            { family: 'Adams', given: 'Alice' },
            { family: 'Baker', given: 'Bob' },
          ],
          year: '2019',
          title: 'Publication Manual',
          publisher: 'APA',
        },
        sortKey: 'adams|2019|publication manual',
      }),
    ];

    render(
      <ReferencesPanel
        references={refs}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    expect(
      screen.getAllByText('Cognitive Effects of Sleep Deprivation').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Smith (2020)')).toBeVisible();
    expect(
      screen.getAllByText('Publication Manual').length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Adams & Baker (2019)')).toBeVisible();
  });

  it('shows count badge when references exist', () => {
    const { container } = render(
      <ReferencesPanel
        references={[createReference(), createReference({ id: 'ref-2' })]}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    const badge = container.querySelector('span.inline-flex');
    expect(badge).toHaveTextContent('2');
  });

  it('shows type badge for each reference', () => {
    render(
      <ReferencesPanel
        references={[
          createReference({
            referenceType: 'report',
            fields: {
              authors: [{ family: 'Smith', given: 'John' }],
              year: '2020',
              title: 'Annual Analysis',
              institution: 'NIH',
            },
          }),
        ]}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    expect(screen.getByText('Report')).toBeVisible();
  });

  it('shows n.d. for references without a year', () => {
    render(
      <ReferencesPanel
        references={[
          createReference({
            fields: {
              authors: [{ family: 'Smith', given: 'John' }],
              year: null,
              title: 'Undated Work',
              journalName: 'Science',
            },
          }),
        ]}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    expect(screen.getByText('Smith (n.d.)')).toBeVisible();
  });

  it('shows et al. for three or more authors', () => {
    render(
      <ReferencesPanel
        references={[
          createReference({
            fields: {
              authors: [
                { family: 'Smith', given: 'A' },
                { family: 'Baker', given: 'B' },
                { family: 'Clark', given: 'C' },
              ],
              year: '2021',
              title: 'Group Study',
              journalName: 'Science',
            },
          }),
        ]}
        onAddReference={vi.fn()}
        onEditReference={vi.fn()}
        onDeleteReference={vi.fn()}
      />,
    );

    expect(screen.getByText('Smith et al. (2021)')).toBeVisible();
  });
});
