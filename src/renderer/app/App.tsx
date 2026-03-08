import { useDeferredValue, useEffect, useReducer, useRef, useState } from 'react';
import type { PaperDraft } from '@domain/papers/paper-draft';
import { resolveTemplateDefinitionId } from '@domain/papers/template-definitions';
import type {
  Course,
  CreateCourseInput,
  CreatePaperInput,
  Paper,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';
import {
  createInitialWorkspaceShellState,
  workspaceShellReducer,
} from '@renderer/app/workspace-shell-state';
import { CourseModal } from '@renderer/app/CourseModal';
import { Inspector } from '@renderer/app/Inspector';
import { PaperModal } from '@renderer/app/PaperModal';
import { PaperCanvas } from '@renderer/app/paper-canvas/PaperCanvas';
import {
  applyOptimisticPaperMetadataUpdate,
  getPaperInspectorValidationMessages,
  upsertPaperInCourseCollections,
} from '@renderer/app/paper-draft-state';
import { Sidebar } from '@renderer/app/Sidebar';
import { BookOpenIcon, NotificationsIcon, SearchIcon, PlusIcon, SettingsIcon } from '@renderer/app/icons';

type ThemeMode = 'dark' | 'light';

const emptyCourseForm: CreateCourseInput = {
  name: '',
};

const emptyPaperForm: CreatePaperInput = {
  courseId: '',
  templateId: 'apa-student',
  title: '',
};

const resolvePreferredTheme = (): ThemeMode => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

const sortCourses = (courses: Course[]): Course[] =>
  [...courses].sort((left, right) => left.name.localeCompare(right.name));

const shellButtonClass =
  'inline-flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-2 text-xs font-semibold uppercase tracking-[var(--tracking-caps)] transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]';

export const App = () => {
  const api = window.apaScholar;
  const [theme, setTheme] = useState<ThemeMode>(resolvePreferredTheme);
  const [shellState, dispatch] = useReducer(
    workspaceShellReducer,
    undefined,
    createInitialWorkspaceShellState,
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursePapers, setCoursePapers] = useState<Record<string, Paper[]>>({});
  const [paperDetails, setPaperDetails] = useState<Record<string, PaperDraft | null>>({});
  const [paperDrafts, setPaperDrafts] = useState<Record<string, string>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCourseIds, setLoadingCourseIds] = useState<string[]>([]);
  const [loadingPaperIds, setLoadingPaperIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'placeholder'>('idle');
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CreateCourseInput>(emptyCourseForm);
  const [paperForm, setPaperForm] = useState<CreatePaperInput>(emptyPaperForm);
  const [courseFormError, setCourseFormError] = useState<string | null>(null);
  const [paperFormError, setPaperFormError] = useState<string | null>(null);
  // Keep in-flight course loads current without retriggering the fetch effects.
  const loadingCourseIdsRef = useRef<string[]>([]);
  const loadingPaperIdsRef = useRef<string[]>([]);
  const metadataSaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingMetadataUpdatesRef = useRef<Record<string, UpdatePaperMetadataInput>>({});
  const paperMetadataVersionRef = useRef<Record<string, number>>({});

  const activeCourse =
    courses.find((course) => course.id === shellState.selectedCourseId) ?? null;
  const activePaper =
    shellState.selectedCourseId && shellState.selectedPaperId
      ? (coursePapers[shellState.selectedCourseId] ?? []).find(
          (paper) => paper.id === shellState.selectedPaperId,
        ) ?? null
      : null;
  const activePaperDetail = shellState.selectedPaperId
    ? paperDetails[shellState.selectedPaperId] ?? null
    : null;
  const activePaperValidationMessages = getPaperInspectorValidationMessages(activePaperDetail);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!api) {
        setCourses([]);
        setLoadingCourses(false);
        return;
      }

      setLoadingCourses(true);

      try {
        const loadedCourses = await api.courses.list();

        if (!cancelled) {
          setWorkspaceError(null);
          setCourses(sortCourses(loadedCourses));
        }
      } catch {
        if (!cancelled) {
          setWorkspaceError('Unable to load your courses right now.');
        }
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    loadingCourseIdsRef.current = loadingCourseIds;
  }, [loadingCourseIds]);

  useEffect(() => {
    loadingPaperIdsRef.current = loadingPaperIds;
  }, [loadingPaperIds]);

  useEffect(() => () => {
    Object.values(metadataSaveTimeoutsRef.current).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = (event?: MediaQueryList | MediaQueryListEvent) => {
      setTheme(event?.matches ? 'dark' : 'light');
    };

    syncTheme(mediaQuery);
    mediaQuery.addEventListener('change', syncTheme);

    return () => {
      mediaQuery.removeEventListener('change', syncTheme);
    };
  }, []);

  useEffect(() => {
    const query = deferredSearchQuery.trim();

    if (!api || query.length === 0) {
      setSearchStatus('idle');
      return;
    }

    let cancelled = false;

    void api.search
      .query(query)
      .then((result) => {
        if (!cancelled) {
          setSearchStatus(result.status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchStatus('idle');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, deferredSearchQuery]);

  useEffect(() => {
    const selectedCourseId = shellState.selectedCourseId;

    if (
      !api ||
      !selectedCourseId ||
      coursePapers[selectedCourseId] ||
      loadingCourseIdsRef.current.includes(selectedCourseId)
    ) {
      return;
    }

    let cancelled = false;

    setLoadingCourseIds((current) => [...current, selectedCourseId]);

    void (async () => {
      try {
        const papers = await api.papers.listByCourse(selectedCourseId);

        if (!cancelled) {
          setWorkspaceError(null);
          setCoursePapers((current) => ({
            ...current,
            [selectedCourseId]: papers,
          }));
        }
      } catch {
        if (!cancelled) {
          setWorkspaceError('Unable to load papers for this course right now.');
        }
      } finally {
        setLoadingCourseIds((current) =>
          current.filter((courseId) => courseId !== selectedCourseId),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, coursePapers, shellState.selectedCourseId]);

  useEffect(() => {
    const pendingCourseIds = shellState.expandedCourseIds.filter(
      (courseId) =>
        courseId !== shellState.selectedCourseId &&
        !coursePapers[courseId] &&
        !loadingCourseIdsRef.current.includes(courseId),
    );

    if (!api || pendingCourseIds.length === 0) {
      return;
    }

    let cancelled = false;

    setLoadingCourseIds((current) => [...current, ...pendingCourseIds]);

    void (async () => {
      const results = await Promise.allSettled(
        pendingCourseIds.map(async (courseId) => ({
          courseId,
          papers: await api.papers.listByCourse(courseId),
        })),
      );

      setLoadingCourseIds((current) =>
        current.filter((courseId) => !pendingCourseIds.includes(courseId)),
      );

      if (cancelled) {
        return;
      }

      const fulfilledResults = results.filter(
        (result): result is PromiseFulfilledResult<{ courseId: string; papers: Paper[] }> =>
          result.status === 'fulfilled',
      );

      setCoursePapers((current) => {
        const next = { ...current };

        fulfilledResults.forEach(({ value }) => {
          next[value.courseId] = value.papers;
        });

        return next;
      });
      setWorkspaceError(
        results.some((result) => result.status === 'rejected')
          ? 'Unable to load papers for this course right now.'
          : null,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    api,
    coursePapers,
    shellState.expandedCourseIds,
    shellState.selectedCourseId,
  ]);

  useEffect(() => {
    const selectedPaperId = shellState.selectedPaperId;

    if (
      !api ||
      !selectedPaperId ||
      Object.prototype.hasOwnProperty.call(paperDetails, selectedPaperId) ||
      loadingPaperIdsRef.current.includes(selectedPaperId)
    ) {
      return;
    }

    let cancelled = false;

    setLoadingPaperIds((current) => [...current, selectedPaperId]);

    void api.papers
      .getById(selectedPaperId)
      .then((paperDetail) => {
        if (!cancelled) {
          if (!paperDetail) {
            setWorkspaceError('Unable to load this paper draft right now.');
            return;
          }

          setWorkspaceError(null);
          setPaperDetails((current) => ({
            ...current,
            [selectedPaperId]: paperDetail,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaceError('Unable to load this paper draft right now.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPaperIds((current) =>
            current.filter((paperId) => paperId !== selectedPaperId),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, paperDetails, shellState.selectedPaperId]);

  const openCourse = (courseId: string) => {
    dispatch({ type: 'navigateCourse', courseId });
  };

  const openPaper = (courseId: string, paperId: string) => {
    dispatch({ type: 'navigatePaper', courseId, paperId });
  };

  const toggleCourse = (courseId: string) => {
    dispatch({ type: 'toggleCourseExpansion', courseId });
  };

  const openCourseModal = () => {
    setCourseForm(emptyCourseForm);
    setCourseFormError(null);
    setIsCourseModalOpen(true);
  };

  const openPaperModal = () => {
    const defaultCourse =
      courses.find((course) => course.id === shellState.selectedCourseId) ?? courses[0];

    setPaperForm({
      courseId: defaultCourse?.id ?? '',
      templateId: resolveTemplateDefinitionId(defaultCourse?.defaultPaperTemplate),
      title: '',
    });
    setPaperFormError(null);
    setIsPaperModalOpen(true);
  };

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!api || !courseForm.name.trim()) {
      return;
    }

    try {
      const createdCourse = await api.courses.create({
        ...courseForm,
        name: courseForm.name.trim(),
      });

      setWorkspaceError(null);
      setCourseFormError(null);
      setCourses((current) => sortCourses([...current, createdCourse]));
      setCoursePapers((current) => ({
        ...current,
        [createdCourse.id]: [],
      }));

      setIsCourseModalOpen(false);
      dispatch({ type: 'navigateCourse', courseId: createdCourse.id });
    } catch {
      setCourseFormError('Unable to create the course right now. Try again.');
    }
  };

  const handleCreatePaper = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!api || !paperForm.courseId || !paperForm.title.trim()) {
      return;
    }

    try {
      const createdPaper = await api.papers.create({
        ...paperForm,
        title: paperForm.title.trim(),
      });
      const createdPaperDetail = await api.papers.getById(createdPaper.id);

      if (!createdPaperDetail) {
        throw new Error('Created paper draft could not be loaded.');
      }

      setWorkspaceError(null);
      setPaperFormError(null);
      setCoursePapers((current) => ({
        ...current,
        [paperForm.courseId]: [createdPaper, ...(current[paperForm.courseId] ?? [])],
      }));
      setPaperDrafts((current) => ({
        ...current,
        [createdPaper.id]: '',
      }));
      setPaperDetails((current) => ({
        ...current,
        [createdPaper.id]: createdPaperDetail,
      }));

      setIsPaperModalOpen(false);
      dispatch({
        type: 'navigatePaper',
        courseId: paperForm.courseId,
        paperId: createdPaper.id,
      });
    } catch {
      setPaperFormError('Unable to create the paper right now. Try again.');
    }
  };

  const persistPaperMetadataUpdate = (paperId: string, version: number) => {
    if (!api) {
      return;
    }

    const pendingInput = pendingMetadataUpdatesRef.current[paperId];

    if (!pendingInput) {
      return;
    }

    delete pendingMetadataUpdatesRef.current[paperId];

    void api.papers
      .updateMetadata(paperId, pendingInput)
      .then((updatedDraft) => {
        const hasPendingEdits = Boolean(pendingMetadataUpdatesRef.current[paperId]);
        const latestVersion = paperMetadataVersionRef.current[paperId] ?? 0;

        if (hasPendingEdits || version !== latestVersion) {
          return;
        }

        setWorkspaceError(null);
        setPaperDetails((current) => ({
          ...current,
          [paperId]: updatedDraft,
        }));
        setCoursePapers((current) =>
          upsertPaperInCourseCollections(current, updatedDraft.paper),
        );
      })
      .catch((error: unknown) => {
        pendingMetadataUpdatesRef.current[paperId] = {
          ...pendingInput,
          ...(pendingMetadataUpdatesRef.current[paperId] ?? {}),
        };
        setWorkspaceError(
          'Unable to save paper metadata right now. Changes remain local until save succeeds.',
        );
        const isValidationError =
          error instanceof Error &&
          (error.name === 'ZodError' ||
            /required|must be|At least one/i.test(error.message));

        if (!isValidationError) {
          const existingTimeout = metadataSaveTimeoutsRef.current[paperId];

          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          metadataSaveTimeoutsRef.current[paperId] = setTimeout(() => {
            delete metadataSaveTimeoutsRef.current[paperId];
            persistPaperMetadataUpdate(
              paperId,
              paperMetadataVersionRef.current[paperId] ?? version,
            );
          }, 5000);
        }
      });
  };

  const schedulePaperMetadataSave = (
    paperId: string,
    input: UpdatePaperMetadataInput,
  ) => {
    pendingMetadataUpdatesRef.current[paperId] = {
      ...(pendingMetadataUpdatesRef.current[paperId] ?? {}),
      ...input,
    };

    const nextVersion = (paperMetadataVersionRef.current[paperId] ?? 0) + 1;
    paperMetadataVersionRef.current[paperId] = nextVersion;

    const existingTimeout = metadataSaveTimeoutsRef.current[paperId];

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    metadataSaveTimeoutsRef.current[paperId] = setTimeout(() => {
      delete metadataSaveTimeoutsRef.current[paperId];
      persistPaperMetadataUpdate(paperId, nextVersion);
    }, 400);
  };

  const handlePaperMetadataChange = (input: UpdatePaperMetadataInput) => {
    const selectedPaperId = shellState.selectedPaperId;

    if (!selectedPaperId || !activePaperDetail) {
      return;
    }

    const updatedDraft = applyOptimisticPaperMetadataUpdate(activePaperDetail, input);

    setWorkspaceError(null);
    setPaperDetails((current) => ({
      ...current,
      [selectedPaperId]: updatedDraft,
    }));
    setCoursePapers((current) =>
      upsertPaperInCourseCollections(current, updatedDraft.paper),
    );

    schedulePaperMetadataSave(selectedPaperId, input);
  };

  const renderHomeView = () => (
    <section className="flex h-full flex-col justify-center px-6 py-10 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
      <p className="label-caps text-[var(--color-accent-strong)]">
        Workspace shell
      </p>
      <h2 className="mt-5 max-w-2xl font-[var(--font-display)] text-4xl leading-tight text-[var(--color-ink-strong)] md:text-5xl">
        Your academic workspace starts here
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
        Build courses on the left, shape papers in the center, and keep APA context
        visible on the right so the app feels guided before the real editor lands.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
          onClick={openCourseModal}
          type="button"
        >
          Create your first course
        </button>
        <button
          className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
          onClick={openPaperModal}
          type="button"
        >
          Draft a paper shell
        </button>
      </div>
    </section>
  );

  const renderCourseView = (course: Course) => {
    const papers = coursePapers[course.id] ?? [];

    return (
      <section className="flex h-full flex-col gap-6 px-6 py-8 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-6">
          <div>
            <p className="label-caps text-[var(--color-accent-strong)]">
              Course overview
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink-strong)]">
              {course.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              Keep each class as its own writing orbit so defaults, papers, and future
              references stay grouped the way students actually work.
            </p>
          </div>

          <button
            className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
            onClick={openPaperModal}
            type="button"
          >
            New paper
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
          <article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-6">
            <h3 className="label-caps text-[var(--color-muted-strong)]">
              Course defaults
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  Professor
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.professorName ?? 'Not set yet'}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  Semester
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.semester ?? 'Not set yet'}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  Institution
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.institution ?? 'Not set yet'}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  Default template
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.defaultPaperTemplate}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-6">
            <h3 className="label-caps text-[var(--color-muted-strong)]">
              Papers in this course
            </h3>
            <div className="mt-5 space-y-3">
              {papers.length > 0 ? (
                papers.map((paper) => (
                  <button
                    className="flex w-full items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-4 text-left transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]"
                    key={paper.id}
                    onClick={() => openPaper(course.id, paper.id)}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-medium text-[var(--color-ink-strong)]">
                        {paper.title}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-muted)]">
                        {paper.paperType} paper
                      </span>
                    </span>
                    <span className="text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)]">
                      Open
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-sm leading-6 text-[var(--color-muted)]">
                  This course is ready for its first paper. Use the action above to
                  create an APA shell and jump straight into the draft view.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    );
  };

  const renderPaperView = (course: Course, paper: Paper, paperDetail: PaperDraft | null) => (
    <section className="flex h-full flex-col gap-6 px-6 py-8 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-6">
        <div>
          <p className="label-caps text-[var(--color-accent-strong)]">
            {course.name}
          </p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink-strong)]">
            {paper.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            A calm paper shell that teaches structure while leaving room for the full
            writing engine in the next milestone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            type="button"
          >
            Export PDF
          </button>
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            type="button"
          >
            Print preview
          </button>
        </div>
      </div>

      {paperDetail ? (
        <PaperCanvas
          bodyDraftValue={paperDrafts[paper.id] ?? ''}
          onBodyDraftChange={(value) =>
            setPaperDrafts((current) => ({
              ...current,
              [paper.id]: value,
            }))
          }
          paperDraft={paperDetail}
        />
      ) : (
        <div className="mx-auto w-full max-w-[820px] rounded-[var(--radius-panel)] border border-[var(--color-page-line)] bg-[var(--color-page)] px-8 py-10 shadow-[var(--shadow-page)]">
          <p className="label-caps">
            Loading paper scaffold
          </p>
          <p className="mt-6 text-sm leading-7 text-[var(--color-page-muted)]">
            Pulling the latest paper skeleton from local storage.
          </p>
        </div>
      )}
    </section>
  );

  const renderSettingsView = () => (
    <section className="flex h-full flex-col justify-center px-6 py-10 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
      <p className="label-caps text-[var(--color-accent-strong)]">
        Settings
      </p>
      <h2 className="mt-4 font-[var(--font-display)] text-4xl text-[var(--color-ink-strong)]">
        Workspace settings placeholder
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
        Language, theme, and writing preferences will land here in a later milestone.
      </p>
    </section>
  );

  const renderMainPanel = () => {
    if (shellState.route.view === 'course' && activeCourse) {
      return renderCourseView(activeCourse);
    }

    if (shellState.route.view === 'paper' && activeCourse && activePaper) {
      return renderPaperView(activeCourse, activePaper, activePaperDetail);
    }

    if (shellState.route.view === 'settings') {
      return renderSettingsView();
    }

    return renderHomeView();
  };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-[var(--color-canvas)] text-[var(--color-ink)]"
      data-testid="workspace-shell"
      data-theme={theme}
    >
      {/* Top Navigation Bar */}
      <header className="drag-region flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-panel)] px-6">
        <div className="flex items-center gap-6">
          {/* macOS traffic light spacer */}
          <div className="w-14" />
          <div className="h-4 w-px bg-[var(--color-line)] mx-2" />
          <div className="flex items-center gap-2 font-bold tracking-tight text-[var(--color-accent)]">
            <BookOpenIcon className="scale-90" />
            <span className="text-sm">APA Scholar</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-12">
          <div className="relative w-full max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-muted)]">
              <SearchIcon />
            </div>
            <label className="sr-only" htmlFor="workspace-search">
              Search workspace
            </label>
            <input
              className="w-full rounded-lg border-none bg-[var(--color-input)] py-1.5 pl-10 text-sm text-[var(--color-ink-strong)] outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent-soft)]"
              id="workspace-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses and papers..."
              type="search"
              value={searchQuery}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent-ink)] transition hover:opacity-90"
            onClick={openPaperModal}
            type="button"
          >
            <PlusIcon />
            Draft paper
          </button>
          <div className="flex gap-1">
            <button
              aria-label="Notifications"
              className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-ink-strong)]"
              type="button"
            >
              <NotificationsIcon />
            </button>
            <button
              aria-label="Settings"
              className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-ink-strong)]"
              onClick={() => dispatch({ type: 'navigateSettings' })}
              type="button"
            >
              <SettingsIcon />
            </button>
          </div>
        </div>
      </header>

      {workspaceError ? (
        <div className="border-b border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2">
          <p className="text-xs leading-5 text-[var(--color-ink-strong)]">
            {workspaceError}
          </p>
        </div>
      ) : null}

      {/* Search status feedback */}
      {searchStatus === 'placeholder' && searchQuery.trim().length > 0 && (
        <div className="border-b border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2">
          <p className="text-xs leading-5 text-[var(--color-muted)]">
            Search will span courses and papers in a later milestone.
          </p>
        </div>
      )}

      {/* Three-column layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          collapsed={shellState.leftPanelCollapsed}
          courses={courses}
          coursePapers={coursePapers}
          emptyCoursesMessage={
            workspaceError && courses.length === 0
              ? 'Unable to load your courses right now.'
              : null
          }
          expandedCourseIds={shellState.expandedCourseIds}
          loadingCourses={loadingCourses}
          loadingCourseIds={loadingCourseIds}
          searchQuery={searchQuery}
          searchStatus={searchStatus}
          selectedCourseId={shellState.selectedCourseId}
          selectedPaperId={shellState.selectedPaperId}
          onCollapseToggle={() => dispatch({ type: 'toggleLeftPanel' })}
          onCourseOpen={openCourse}
          onCourseToggle={toggleCourse}
          onCourseModalOpen={openCourseModal}
          onHomeNavigate={() => dispatch({ type: 'navigateHome' })}
          onPaperModalOpen={openPaperModal}
          onPaperOpen={openPaper}
          onSearchChange={setSearchQuery}
          onSettingsNavigate={() => dispatch({ type: 'navigateSettings' })}
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--color-main)] no-scrollbar">
          <div className="h-full">{renderMainPanel()}</div>
        </main>

        <Inspector
          collapsed={shellState.rightPanelCollapsed}
          activeCourse={activeCourse}
          activePaper={activePaper}
          activePaperDetail={activePaperDetail}
          paperValidationMessages={activePaperValidationMessages}
          onCollapseToggle={() => dispatch({ type: 'toggleRightPanel' })}
          onPaperMetadataChange={handlePaperMetadataChange}
        />
      </div>

      <CourseModal
        isOpen={isCourseModalOpen}
        courseForm={courseForm}
        errorMessage={courseFormError}
        onFormChange={setCourseForm}
        onSubmit={handleCreateCourse}
        onClose={() => {
          setCourseFormError(null);
          setIsCourseModalOpen(false);
        }}
      />

      <PaperModal
        isOpen={isPaperModalOpen}
        paperForm={paperForm}
        courses={courses}
        errorMessage={paperFormError}
        onFormChange={setPaperForm}
        onSubmit={handleCreatePaper}
        onClose={() => {
          setPaperFormError(null);
          setIsPaperModalOpen(false);
        }}
      />
    </div>
  );
};
