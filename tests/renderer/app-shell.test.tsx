// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyPaperMetadataUpdateToDraft } from '@domain/papers/paper-metadata';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type { ApaScholarApi } from '@preload/api/contracts';
import type { Course, Paper } from '@domain/shared/persistence-models';
import { App } from '@renderer/app/App';

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
};

const createCourse = (overrides: Partial<Course> = {}): Course => ({
  archivedAt: null,
  code: null,
  createdAt: '2026-03-07T14:00:00.000Z',
  defaultLanguage: 'en',
  defaultPaperTemplate: 'apa-student',
  id: 'course-1',
  institution: 'APA University',
  name: 'Research Methods',
  professorName: 'Dr. Rivera',
  semester: 'Spring 2026',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null,
  courseId: 'course-1',
  createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1',
  language: 'en',
  paperType: 'student',
  status: 'draft',
  templateId: 'apa-student',
  title: 'Literature Review',
  updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperDraft = (
  paperOverrides: Partial<Paper> = {},
  options?: { includeAbstract?: boolean; course?: Course },
): PaperDraft => {
  const paper = createPaper(paperOverrides);
  const course = options?.course ?? createCourse({ id: paper.courseId ?? 'course-1' });
  const includeAbstract = options?.includeAbstract ?? paper.templateId === 'apa-student-abstract';
  const paperContent: PaperDraft['paperContent'] = {
      abstractDoc: { content: [], type: 'doc' },
      bodyDoc: { content: [], type: 'doc' },
      createdAt: paper.createdAt,
      paperId: paper.id,
      updatedAt: paper.updatedAt,
    };
  const paperMeta: PaperDraft['paperMeta'] = {
      abstractEnabled: includeAbstract,
      authorName: null,
      authorNote: null,
      courseCode: course.code ?? null,
      courseName: course.name,
      createdAt: paper.createdAt,
      dueDate: null,
      institution: course.institution ?? null,
      paperId: paper.id,
      professorName: course.professorName ?? null,
      runningHead: null,
      shortTitle: null,
      title: paper.title,
      updatedAt: paper.updatedAt,
    };

  return {
    ghostPages: buildGhostPageViewModels({
      paper,
      paperContent,
      paperMeta,
    }),
    paper,
    paperContent,
    paperMeta,
  };
};

const createTestApi = (seed?: {
  courses?: Course[];
  paperDraftsById?: Record<string, PaperDraft>;
  papersByCourse?: Record<string, Paper[]>;
}) => {
  const courses = [...(seed?.courses ?? [])];
  const papersByCourse = new Map(
    Object.entries(seed?.papersByCourse ?? {}).map(([courseId, papers]) => [
      courseId,
      [...papers],
    ]),
  );
  const paperDraftsById = new Map(
    Object.entries(seed?.paperDraftsById ?? {}).map(([paperId, draft]) => [
      paperId,
      draft,
    ]),
  );

  const api: ApaScholarApi = {
    meta: {
      bridgeVersion: 1,
      platform: 'desktop',
      runtime: 'electron',
    },
    courses: {
      list: vi.fn(async () => courses),
      create: vi.fn(async (input) => {
        const nextCourse = createCourse({
          code: input.code ?? null,
          defaultLanguage: input.defaultLanguage ?? 'en',
          defaultPaperTemplate: input.defaultPaperTemplate ?? 'apa-student',
          id: `course-${courses.length + 1}`,
          institution: input.institution ?? null,
          name: input.name,
          professorName: input.professorName ?? null,
          semester: input.semester ?? null,
        });

        courses.unshift(nextCourse);
        return nextCourse;
      }),
    },
    papers: {
      listByCourse: vi.fn(async (courseId) => papersByCourse.get(courseId) ?? []),
      getById: vi.fn(async (paperId) => paperDraftsById.get(paperId) ?? null),
      create: vi.fn(async (input) => {
        const nextPaper = createPaper({
          courseId: input.courseId,
          id: `paper-${(papersByCourse.get(input.courseId)?.length ?? 0) + 1}`,
          language: input.language ?? 'en',
          paperType: input.paperType ?? 'student',
          templateId: input.templateId ?? 'apa-student',
          title: input.title,
        });
        const nextCourse = courses.find((course) => course.id === input.courseId);

        papersByCourse.set(input.courseId, [
          nextPaper,
          ...(papersByCourse.get(input.courseId) ?? []),
        ]);
        paperDraftsById.set(
          nextPaper.id,
          createPaperDraft(
            nextPaper,
            { course: nextCourse, includeAbstract: nextPaper.templateId === 'apa-student-abstract' },
          ),
        );

        return nextPaper;
      }),
      updateMetadata: vi.fn(async (paperId, input) => {
        const currentDraft = paperDraftsById.get(paperId);

        if (!currentDraft) {
          throw new Error(`Missing paper draft "${paperId}" in test API.`);
        }

        const updatedDraft = applyPaperMetadataUpdateToDraft(currentDraft, input);
        const courseId = updatedDraft.paper.courseId;

        paperDraftsById.set(paperId, updatedDraft);

        if (courseId) {
          papersByCourse.set(
            courseId,
            (papersByCourse.get(courseId) ?? []).map((paper) =>
              paper.id === paperId ? updatedDraft.paper : paper,
            ),
          );
        }

        return updatedDraft;
      }),
    },
    search: {
      query: vi.fn(async () => ({
        courses: [],
        papers: [],
        status: 'placeholder' as const,
      })),
    },
  };

  return api;
};

describe('App', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  });

  it('renders the empty workspace home state with dark theme defaults', async () => {
    window.apaScholar = createTestApi();

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'APA Scholar' })).toBeVisible();
    expect(screen.getByTestId('workspace-shell')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    expect(
      screen.getByRole('heading', { name: 'Your academic workspace starts here' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Create your first course' }),
    ).toBeVisible();
  });

  it('loads courses in the sidebar and shows the selected course overview', async () => {
    window.apaScholar = createTestApi({
      courses: [createCourse()],
      paperDraftsById: {
        'paper-1': createPaperDraft(),
      },
      papersByCourse: {
        'course-1': [createPaper()],
      },
    });

    render(<App />);

    const courseButton = await screen.findByRole('button', {
      name: /open course research methods/i,
    });
    fireEvent.click(courseButton);

    expect(
      await screen.findByRole('heading', { name: 'Research Methods' }),
    ).toBeVisible();
    expect(screen.getByText('Course overview')).toBeVisible();
    expect(screen.getAllByText('Dr. Rivera')[0]).toBeVisible();
    expect(screen.getAllByText('Spring 2026')[0]).toBeVisible();
  });

  it('creates a course, inserts it into the tree, and selects it', async () => {
    window.apaScholar = createTestApi();

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Create your first course' }),
    );

    fireEvent.change(screen.getByLabelText('Course name'), {
      target: { value: 'Advanced Composition' },
    });
    fireEvent.change(screen.getByLabelText('Professor'), {
      target: { value: 'Dr. Santiago' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create course' }));

    expect(
      await screen.findByRole('heading', { name: 'Advanced Composition' }),
    ).toBeVisible();
    expect(screen.getAllByText('Advanced Composition')[0]).toBeVisible();
    expect(screen.getAllByText('Dr. Santiago')[0]).toBeVisible();
  });

  it('creates a paper and opens the APA writing canvas with inspector details', async () => {
    window.apaScholar = createTestApi({
      courses: [createCourse()],
      papersByCourse: {
        'course-1': [],
      },
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    const newPaperButton = screen.getAllByRole('button', { name: 'New paper' })[0];

    if (!newPaperButton) {
      throw new Error('Expected a New paper button to be available.');
    }
    fireEvent.click(newPaperButton);
    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Capstone Draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create paper' }));

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Capstone Draft' }),
    ).toBeVisible();
    expect(screen.getByText('Title page scaffold')).toBeVisible();
    expect(screen.getByLabelText('Paper body draft')).toBeVisible();
    expect(screen.getByText('References scaffold')).toBeVisible();

    const inspector = screen.getByRole('complementary', { name: 'Inspector panel' });
    expect(within(inspector).getAllByText('Paper details')[0]).toBeVisible();
    expect(within(inspector).getByLabelText('Paper type')).toHaveValue('student');
  });

  it('creates an abstract template paper and renders the abstract page between title and body', async () => {
    const course = createCourse({
      defaultPaperTemplate: 'apa-student-abstract',
    });
    window.apaScholar = createTestApi({
      courses: [course],
      papersByCourse: {
        [course.id]: [],
      },
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'New paper' })[0]!);
    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Abstract Draft' },
    });
    fireEvent.change(screen.getByLabelText('Template'), {
      target: { value: 'apa-student-abstract' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create paper' }));

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Abstract Draft' }),
    ).toBeVisible();
    expect(screen.getByText('Abstract scaffold')).toBeVisible();
    expect(screen.getAllByText('Abstract')[0]).toBeVisible();
    expect(screen.getByText('Body draft')).toBeVisible();
  });

  it('reopens an existing paper by loading its persisted paper draft detail', async () => {
    const course = createCourse();
    const paper = createPaper();
    const api = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: createPaperDraft(paper, { course }),
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Literature Review' }),
    ).toBeVisible();
    expect(screen.getByText('Title page scaffold')).toBeVisible();
    expect(screen.getByText('References scaffold')).toBeVisible();

    await waitFor(() => {
      expect(api.papers.getById).toHaveBeenCalledWith('paper-1');
    });
  });

  it('updates paper metadata immediately in the canvas and saves after a debounce', async () => {
    const course = createCourse();
    const paper = createPaper();
    const api = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: createPaperDraft(paper, { course }),
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Faculty Draft' },
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Faculty Draft' })).toBeVisible();
    expect(screen.getAllByRole('heading', { name: 'Faculty Draft' })).toHaveLength(2);
    expect(api.papers.updateMetadata).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(api.papers.updateMetadata).toHaveBeenCalledWith('paper-1', {
      title: 'Faculty Draft',
    });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Faculty Draft' })).toBeVisible();
      expect(api.papers.updateMetadata).toHaveBeenCalledTimes(1);
      expect(api.papers.updateMetadata).toHaveBeenCalledWith('paper-1', {
        title: 'Faculty Draft',
      });
    });
  });

  it('retries failed metadata saves with the newest pending edit', async () => {
    const course = createCourse();
    const paper = createPaper();
    const initialDraft = createPaperDraft(paper, { course });
    const api = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: initialDraft,
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });
    const firstSave = createDeferred<PaperDraft>();

    api.papers.updateMetadata = vi.fn(async (paperId, input) => {
      if ((api.papers.updateMetadata as ReturnType<typeof vi.fn>).mock.calls.length === 1) {
        return firstSave.promise;
      }

      const currentDraft = input.title === 'Title B'
        ? applyPaperMetadataUpdateToDraft(initialDraft, input)
        : applyPaperMetadataUpdateToDraft(initialDraft, { title: 'Unexpected stale payload' });

      return currentDraft.paper.id === paperId ? currentDraft : initialDraft;
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Title A' },
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(api.papers.updateMetadata).toHaveBeenNthCalledWith(1, 'paper-1', {
      title: 'Title A',
    });

    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Title B' },
    });

    firstSave.reject(new Error('Save failed'));

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(api.papers.updateMetadata).toHaveBeenNthCalledWith(2, 'paper-1', {
      title: 'Title B',
    });
  });

  it('sends null when a nullable metadata field is cleared', async () => {
    const course = createCourse();
    const paper = createPaper();
    const api = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: createPaperDraft(paper, { course }),
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Institution'), {
      target: { value: '' },
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(api.papers.updateMetadata).toHaveBeenCalledWith('paper-1', {
      institution: null,
    });
  });

  it('retries a failed metadata save without requiring another user edit', async () => {
    const course = createCourse();
    const paper = createPaper();
    const initialDraft = createPaperDraft(paper, { course });
    const api = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: initialDraft,
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });
    const firstSave = createDeferred<PaperDraft>();

    api.papers.updateMetadata = vi.fn(async (paperId, input) => {
      if ((api.papers.updateMetadata as ReturnType<typeof vi.fn>).mock.calls.length === 1) {
        return firstSave.promise;
      }

      return applyPaperMetadataUpdateToDraft(initialDraft, input);
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Retry Title' },
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
    });

    expect(api.papers.updateMetadata).toHaveBeenNthCalledWith(1, 'paper-1', {
      title: 'Retry Title',
    });

    firstSave.reject(new Error('Transient failure'));

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5100));
    });

    expect(api.papers.updateMetadata).toHaveBeenNthCalledWith(2, 'paper-1', {
      title: 'Retry Title',
    });
  }, 10000);

  it('switches to professional paper settings, updates validation, and changes the ghost-page structure', async () => {
    const course = createCourse();
    const paper = createPaper();
    window.apaScholar = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: createPaperDraft(paper, { course }),
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Paper type'), {
      target: { value: 'professional' },
    });
    fireEvent.click(screen.getByLabelText('Include abstract'));

    expect(screen.getByLabelText('Running head')).toBeVisible();
    expect(screen.queryByLabelText('Course name')).not.toBeInTheDocument();
    expect(screen.getByText('Running head is required.')).toBeVisible();
    expect(screen.queryByText('Course name is required.')).not.toBeInTheDocument();
    expect(screen.getByText('Abstract scaffold')).toBeVisible();
    expect(screen.getAllByText('Running head: Short title')[0]).toBeVisible();
  });

  it('preserves student and professional metadata values when toggling paper types', async () => {
    const course = createCourse();
    const paper = createPaper();
    window.apaScholar = createTestApi({
      courses: [course],
      paperDraftsById: {
        [paper.id]: createPaperDraft(paper, { course }),
      },
      papersByCourse: {
        [course.id]: [paper],
      },
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: /open paper literature review/i }),
    );

    await screen.findByRole('heading', { level: 2, name: 'Literature Review' });

    fireEvent.change(screen.getByLabelText('Course name'), {
      target: { value: 'Advanced Composition' },
    });
    fireEvent.change(screen.getByLabelText('Paper type'), {
      target: { value: 'professional' },
    });
    fireEvent.change(screen.getByLabelText('Running head'), {
      target: { value: 'FACULTY DRAFT' },
    });
    fireEvent.change(screen.getByLabelText('Paper type'), {
      target: { value: 'student' },
    });

    expect(screen.getByLabelText('Course name')).toHaveValue('Advanced Composition');

    fireEvent.change(screen.getByLabelText('Paper type'), {
      target: { value: 'professional' },
    });

    expect(screen.getByLabelText('Running head')).toHaveValue('FACULTY DRAFT');
  });

  it('wires the search box to the placeholder API surface', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    window.apaScholar = api;

    render(<App />);

    const search = await screen.findByLabelText('Search workspace');
    fireEvent.change(search, { target: { value: 'draft' } });

    await waitFor(() => {
      expect(api.search.query).toHaveBeenCalledWith('draft');
    });
    expect(
      screen.getByText('Search will span courses and papers in a later milestone.'),
    ).toBeVisible();
  });

  it('retries a course paper load after navigating away mid-request', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    const firstLoad = createDeferred<Paper[]>();
    api.papers.listByCourse = vi
      .fn()
      .mockImplementationOnce(() => firstLoad.promise)
      .mockResolvedValueOnce([createPaper()]);
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    expect(await screen.findByText('Loading papers')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    firstLoad.resolve([createPaper()]);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );

    await waitFor(() => {
      expect(api.papers.listByCourse).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.getByRole('button', { name: /open paper literature review/i }),
    ).toBeVisible();
  });

  it('clears the placeholder banner when a search request fails', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    api.search.query = vi
      .fn()
      .mockResolvedValueOnce({
        courses: [],
        papers: [],
        status: 'placeholder' as const,
      })
      .mockRejectedValueOnce(new Error('search unavailable'));
    window.apaScholar = api;

    render(<App />);

    const search = await screen.findByLabelText('Search workspace');
    fireEvent.change(search, { target: { value: 'draft' } });

    expect(
      await screen.findByText('Search will span courses and papers in a later milestone.'),
    ).toBeVisible();

    fireEvent.change(search, { target: { value: 'outline' } });

    await waitFor(() => {
      expect(
        screen.queryByText('Search will span courses and papers in a later milestone.'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows a workspace error when the initial course load fails', async () => {
    const api = createTestApi();
    api.courses.list = vi.fn(async () => {
      throw new Error('courses unavailable');
    });
    window.apaScholar = api;

    render(<App />);

    expect(
      await screen.findAllByText('Unable to load your courses right now.'),
    ).toHaveLength(2);
    expect(
      screen.queryByText('No courses yet. Create one to start organizing APA papers by class.'),
    ).not.toBeInTheDocument();
  });

  it('gives the top-bar icon buttons accessible names', async () => {
    window.apaScholar = createTestApi();

    render(<App />);

    expect(
      await screen.findByRole('button', { name: 'Notifications' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  it('keeps hidden collapsed-rail actions out of the accessible tree while the sidebar is expanded', async () => {
    window.apaScholar = createTestApi({
      courses: [createCourse()],
    });

    render(<App />);

    await screen.findByRole('heading', { name: 'APA Scholar' });

    expect(screen.getAllByRole('button', { name: 'New course' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'New paper' })).toHaveLength(1);
  });

  it('disables the reference action until the references workflow exists', async () => {
    window.apaScholar = createTestApi({
      courses: [createCourse()],
    });

    render(<App />);

    const button = await screen.findByRole('button', { name: 'Add reference' });

    expect(button).toBeDisabled();
  });

  it('clears failed paper loading state so the user can retry', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    api.papers.listByCourse = vi
      .fn()
      .mockRejectedValueOnce(new Error('load failed'))
      .mockResolvedValueOnce([createPaper()]);
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );

    expect(await screen.findByText('Loading papers')).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByText('Loading papers')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );

    await waitFor(() => {
      expect(api.papers.listByCourse).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.getByRole('button', { name: /open paper literature review/i }),
    ).toBeVisible();
  });

  it('keeps the course modal open and shows an error when course creation fails', async () => {
    const api = createTestApi();
    api.courses.create = vi.fn(async () => {
      throw new Error('create failed');
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Create your first course' }),
    );
    fireEvent.change(screen.getByLabelText('Course name'), {
      target: { value: 'Advanced Composition' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create course' }));

    expect(
      await screen.findByText('Unable to create the course right now. Try again.'),
    ).toBeVisible();
    expect(screen.getByLabelText('Course name')).toHaveValue('Advanced Composition');
  });

  it('keeps the paper modal open and shows an error when paper creation fails', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    api.papers.create = vi.fn(async () => {
      throw new Error('create failed');
    });
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'New paper' })[0]!);
    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Capstone Draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create paper' }));

    expect(
      await screen.findByText('Unable to create the paper right now. Try again.'),
    ).toBeVisible();
    expect(screen.getByLabelText('Paper title')).toHaveValue('Capstone Draft');
  });

  it('keeps the paper modal open if the created paper detail cannot be loaded', async () => {
    const api = createTestApi({
      courses: [createCourse()],
    });
    api.papers.getById = vi.fn(async () => null);
    window.apaScholar = api;

    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: /open course research methods/i }),
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'New paper' })[0]!);
    fireEvent.change(screen.getByLabelText('Paper title'), {
      target: { value: 'Load Failure Draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create paper' }));

    expect(
      await screen.findByText('Unable to create the paper right now. Try again.'),
    ).toBeVisible();
    expect(screen.getByLabelText('Paper title')).toHaveValue('Load Failure Draft');
  });
});
