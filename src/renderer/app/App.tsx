import { useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '@domain/shared/contracts';
import { supportedLanguages } from '@domain/shared/contracts';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';
import type { PaperDraft } from '@domain/papers/paper-draft';
import {
  buildPasteWarningIssues,
  type PaperIssue,
} from '@domain/papers/paper-issues';
import { resolveTemplateDefinitionId } from '@domain/papers/template-definitions';
import { formatInTextCitation } from '@domain/references/apa-formatter';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import type { BodyEditorHandle } from '@renderer/app/paper-canvas/body-editor/BodyEditor';
import type {
  Course,
  CreateCourseInput,
  CreatePaperInput,
  Paper,
  UpdatePaperMetadataInput,
} from '@domain/shared/persistence-models';
import type { ReferenceFormState } from '@renderer/app/inspector/reference-form-helpers';
import {
  createEmptyFormState,
  formStateToFields,
  referenceToFormState,
  validateFormState,
} from '@renderer/app/inspector/reference-form-helpers';
import { ReferenceFormModal } from '@renderer/app/inspector/ReferenceFormModal';
import {
  createInitialWorkspaceShellState,
  workspaceShellReducer,
} from '@renderer/app/workspace-shell-state';
import { CourseModal } from '@renderer/app/CourseModal';
import { Inspector } from '@renderer/app/Inspector';
import {
  readSubmittedCourseForm,
  readSubmittedPaperForm,
} from '@renderer/app/modal-form-data';
import { PaperModal } from '@renderer/app/PaperModal';
import { PaperCanvas } from '@renderer/app/paper-canvas/PaperCanvas';
import {
  applyOptimisticPaperBodyUpdate,
  applyOptimisticPaperMetadataUpdate,
  getPaperInspectorIssues,
  rebuildGhostPagesWithReferences,
  upsertPaperInCourseCollections,
} from '@renderer/app/paper-draft-state';
import { InlineRenameInput } from '@renderer/app/InlineRenameInput';
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

const METADATA_SAVE_RETRY_DELAY_MS = 5000;
const MAX_METADATA_SAVE_RETRIES = 3;

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
  const { t, i18n } = useTranslation();
  const api = window.apaScholar;
  const [theme, setTheme] = useState<ThemeMode>(resolvePreferredTheme);
  const [appLanguage, setAppLanguage] = useState<Language>('en');
  const [shellState, dispatch] = useReducer(
    workspaceShellReducer,
    undefined,
    createInitialWorkspaceShellState,
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursePapers, setCoursePapers] = useState<Record<string, Paper[]>>({});
  const [paperDetails, setPaperDetails] = useState<Record<string, PaperDraft | null>>({});
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCourseIds, setLoadingCourseIds] = useState<string[]>([]);
  const [loadingPaperIds, setLoadingPaperIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'placeholder'>('idle');
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [activePasteIssues, setActivePasteIssues] = useState<PaperIssue[]>([]);
  const [paperReferences, setPaperReferences] = useState<Record<string, ReferenceEntry[]>>({});
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CreateCourseInput>(emptyCourseForm);
  const [paperForm, setPaperForm] = useState<CreatePaperInput>(emptyPaperForm);
  const [courseFormError, setCourseFormError] = useState<string | null>(null);
  const [paperFormError, setPaperFormError] = useState<string | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingPaper, setIsCreatingPaper] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [referenceForm, setReferenceForm] = useState<ReferenceFormState>(createEmptyFormState);
  const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null);
  const [referenceFormError, setReferenceFormError] = useState<string | null>(null);
  const [isSavingReference, setIsSavingReference] = useState(false);
  const [isRenamingPaperTitle, setIsRenamingPaperTitle] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const bodyEditorRef = useRef<BodyEditorHandle>(null);
  // Keep in-flight course loads current without retriggering the fetch effects.
  const loadingCourseIdsRef = useRef<string[]>([]);
  const loadingPaperIdsRef = useRef<string[]>([]);
  const bodySaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingBodyUpdatesRef = useRef<Record<string, BodyEditorDocument>>({});
  const paperBodyVersionRef = useRef<Record<string, number>>({});
  const bodySaveRetryCountsRef = useRef<Record<string, number>>({});
  const metadataSaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingMetadataUpdatesRef = useRef<Record<string, UpdatePaperMetadataInput>>({});
  const paperMetadataVersionRef = useRef<Record<string, number>>({});
  const metadataSaveRetryCountsRef = useRef<Record<string, number>>({});

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
  const activePaperReferences = shellState.selectedPaperId
    ? paperReferences[shellState.selectedPaperId] ?? []
    : [];
  const activePaperIssues = useMemo(
    () => getPaperInspectorIssues(activePaperDetail, activePasteIssues, activePaperReferences),
    [activePaperDetail, activePasteIssues, activePaperReferences],
  );

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
          setWorkspaceError(t('errors.unableToLoadCourses'));
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
    if (!api) return;

    void api.settings.get().then((settings) => {
      if (settings?.language && settings.language !== i18n.language) {
        void i18n.changeLanguage(settings.language);
        setAppLanguage(settings.language);
      }
    }).catch(() => {
      // Settings load is non-critical; default language is fine.
    });
  }, [api, i18n]);

  const refreshRecentPapers = useCallback(() => {
    if (!api) return;
    void api.papers.listRecent(10).then(setRecentPapers).catch(() => {});
  }, [api]);

  useEffect(() => {
    refreshRecentPapers();
  }, [refreshRecentPapers]);

  useEffect(() => {
    loadingCourseIdsRef.current = loadingCourseIds;
  }, [loadingCourseIds]);

  useEffect(() => {
    loadingPaperIdsRef.current = loadingPaperIds;
  }, [loadingPaperIds]);

  useEffect(() => () => {
    Object.values(bodySaveTimeoutsRef.current).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    Object.values(metadataSaveTimeoutsRef.current).forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
  }, []);

  useEffect(() => {
    setActivePasteIssues([]);
  }, [shellState.selectedPaperId]);

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
          setWorkspaceError(t('errors.unableToLoadPapers'));
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
            setWorkspaceError(t('errors.unableToLoadPaper'));
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
          setWorkspaceError(t('errors.unableToLoadPaper'));
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

  useEffect(() => {
    const selectedPaperId = shellState.selectedPaperId;

    if (!api || !selectedPaperId) {
      return;
    }

    let cancelled = false;

    void api.references
      .listByPaper(selectedPaperId)
      .then((refs) => {
        if (!cancelled) {
          setPaperReferences((current) => ({
            ...current,
            [selectedPaperId]: refs,
          }));
        }
      })
      .catch(() => {
        // Silently fail — references are non-critical for paper viewing
      });

    return () => {
      cancelled = true;
    };
  }, [api, shellState.selectedPaperId]);

  // Rebuild ghost pages when references change so the references page stays current.
  const prevReferencesRef = useRef<ReferenceEntry[] | undefined>(undefined);
  useEffect(() => {
    const selectedPaperId = shellState.selectedPaperId;
    if (!selectedPaperId) return;
    const refs = paperReferences[selectedPaperId];
    if (refs === prevReferencesRef.current) return;
    prevReferencesRef.current = refs;
    const refsToUse = refs ?? [];
    setPaperDetails((current) => {
      const currentDraft = current[selectedPaperId];
      if (!currentDraft) return current;
      return {
        ...current,
        [selectedPaperId]: rebuildGhostPagesWithReferences(currentDraft, refsToUse),
      };
    });
  }, [paperReferences, shellState.selectedPaperId]);

  const openCourse = (courseId: string) => {
    dispatch({ type: 'navigateCourse', courseId });
  };

  const openPaper = (courseId: string, paperId: string) => {
    dispatch({ type: 'navigatePaper', courseId, paperId });
  };

  const toggleCourse = (courseId: string) => {
    dispatch({ type: 'toggleCourseExpansion', courseId });
  };

  const handleCourseRename = async (courseId: string, name: string) => {
    if (!api) return;

    try {
      const updated = await api.courses.update(courseId, { name });
      setCourses((current) =>
        sortCourses(current.map((c) => (c.id === updated.id ? updated : c))),
      );
    } catch {
      setWorkspaceError(t('errors.unableToRenameCourse'));
    }
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

  const handleCreateCourse = async (form: HTMLFormElement) => {
    const submittedCourseForm = readSubmittedCourseForm(form, courseForm);

    if (!api) {
      setCourseFormError(t('errors.bridgeRestart'));
      return;
    }

    if (!submittedCourseForm.name) {
      setCourseFormError(t('errors.courseNameRequired'));
      return;
    }

    setCourseForm(submittedCourseForm);
    setIsCreatingCourse(true);

    try {
      const createdCourse = await api.courses.create(submittedCourseForm);

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
      setCourseFormError(t('errors.unableToCreateCourse'));
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleCreatePaper = async (form: HTMLFormElement) => {
    const submittedPaperForm = readSubmittedPaperForm(form, paperForm);

    if (!api) {
      setPaperFormError(t('errors.bridgeRestart'));
      return;
    }

    if (!submittedPaperForm.courseId) {
      setPaperFormError(t('errors.chooseCourse'));
      return;
    }

    if (!submittedPaperForm.title) {
      setPaperFormError(t('errors.paperTitleRequired'));
      return;
    }

    setPaperForm(submittedPaperForm);
    setIsCreatingPaper(true);

    try {
      const createdPaper = await api.papers.create(submittedPaperForm);
      let createdPaperDetail: PaperDraft | null = null;

      try {
        createdPaperDetail = await api.papers.getById(createdPaper.id);
      } catch {
        createdPaperDetail = null;
      }

      setWorkspaceError(null);
      setPaperFormError(null);
      setCoursePapers((current) => ({
        ...current,
        [submittedPaperForm.courseId]: [
          createdPaper,
          ...(current[submittedPaperForm.courseId] ?? []),
        ],
      }));

      if (createdPaperDetail) {
        setPaperDetails((current) => ({
          ...current,
          [createdPaper.id]: createdPaperDetail,
        }));
      }

      setIsPaperModalOpen(false);
      refreshRecentPapers();
      dispatch({
        type: 'navigatePaper',
        courseId: submittedPaperForm.courseId,
        paperId: createdPaper.id,
      });
    } catch {
      setPaperFormError(t('errors.unableToCreatePaper'));
    } finally {
      setIsCreatingPaper(false);
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

        delete metadataSaveRetryCountsRef.current[paperId];
        setWorkspaceError(null);
        setPaperDetails((current) => ({
          ...current,
          [paperId]: updatedDraft,
        }));
        setCoursePapers((current) =>
          upsertPaperInCourseCollections(current, updatedDraft.paper),
        );
        refreshRecentPapers();
      })
      .catch((error: unknown) => {
        pendingMetadataUpdatesRef.current[paperId] = {
          ...pendingInput,
          ...(pendingMetadataUpdatesRef.current[paperId] ?? {}),
        };
        setWorkspaceError(
          t('errors.unableToSaveMetadata'),
        );
        const isValidationError =
          error instanceof Error &&
          (error.name === 'ZodError' ||
            /required|must be|At least one/i.test(error.message));

        if (!isValidationError) {
          const nextRetryCount =
            (metadataSaveRetryCountsRef.current[paperId] ?? 0) + 1;

          metadataSaveRetryCountsRef.current[paperId] = nextRetryCount;

          if (nextRetryCount > MAX_METADATA_SAVE_RETRIES) {
            return;
          }

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
          }, METADATA_SAVE_RETRY_DELAY_MS);
          return;
        }

        delete metadataSaveRetryCountsRef.current[paperId];
      });
  };

  const persistPaperBodyUpdate = (paperId: string, version: number) => {
    if (!api) {
      return;
    }

    const pendingBodyDocument = pendingBodyUpdatesRef.current[paperId];

    if (!pendingBodyDocument) {
      return;
    }

    delete pendingBodyUpdatesRef.current[paperId];

    void api.papers
      .updateBodyContent(paperId, pendingBodyDocument)
      .then((updatedDraft) => {
        const hasPendingEdits = Boolean(pendingBodyUpdatesRef.current[paperId]);
        const latestVersion = paperBodyVersionRef.current[paperId] ?? 0;

        if (hasPendingEdits || version !== latestVersion) {
          return;
        }

        delete bodySaveRetryCountsRef.current[paperId];
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
        pendingBodyUpdatesRef.current[paperId] =
          pendingBodyUpdatesRef.current[paperId] ?? pendingBodyDocument;
        setWorkspaceError(
          t('errors.unableToSaveBody'),
        );

        const isValidationError =
          error instanceof Error &&
          (error.name === 'ZodError' ||
            /required|must be|At least one/i.test(error.message));

        if (!isValidationError) {
          const nextRetryCount = (bodySaveRetryCountsRef.current[paperId] ?? 0) + 1;

          bodySaveRetryCountsRef.current[paperId] = nextRetryCount;

          if (nextRetryCount > MAX_METADATA_SAVE_RETRIES) {
            return;
          }

          const existingTimeout = bodySaveTimeoutsRef.current[paperId];

          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          bodySaveTimeoutsRef.current[paperId] = setTimeout(() => {
            delete bodySaveTimeoutsRef.current[paperId];
            persistPaperBodyUpdate(
              paperId,
              paperBodyVersionRef.current[paperId] ?? version,
            );
          }, METADATA_SAVE_RETRY_DELAY_MS);
          return;
        }

        delete bodySaveRetryCountsRef.current[paperId];
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
    delete metadataSaveRetryCountsRef.current[paperId];

    const existingTimeout = metadataSaveTimeoutsRef.current[paperId];

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    metadataSaveTimeoutsRef.current[paperId] = setTimeout(() => {
      delete metadataSaveTimeoutsRef.current[paperId];
      persistPaperMetadataUpdate(paperId, nextVersion);
    }, 400);
  };

  const schedulePaperBodySave = (
    paperId: string,
    bodyDocument: BodyEditorDocument,
  ) => {
    pendingBodyUpdatesRef.current[paperId] = bodyDocument;

    const nextVersion = (paperBodyVersionRef.current[paperId] ?? 0) + 1;
    paperBodyVersionRef.current[paperId] = nextVersion;
    delete bodySaveRetryCountsRef.current[paperId];

    const existingTimeout = bodySaveTimeoutsRef.current[paperId];

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    bodySaveTimeoutsRef.current[paperId] = setTimeout(() => {
      delete bodySaveTimeoutsRef.current[paperId];
      persistPaperBodyUpdate(paperId, nextVersion);
    }, 400);
  };

  const handleBodyDocumentChange = (
    paperId: string,
    nextDocument: BodyEditorDocument,
  ) => {
    if (paperId === shellState.selectedPaperId) {
      setActivePasteIssues([]);
    }

    setPaperDetails((current) => {
      const currentDraft = current[paperId];

      if (!currentDraft) {
        return current;
      }

      return {
        ...current,
        [paperId]: applyOptimisticPaperBodyUpdate(
          currentDraft,
          nextDocument,
          paperReferences[paperId],
        ),
      };
    });
    schedulePaperBodySave(paperId, nextDocument);
  };

  const handlePaperPasteWarningsChange = (warnings: string[]) => {
    setActivePasteIssues(buildPasteWarningIssues(warnings));
  };

  const handlePaperMetadataChange = (input: UpdatePaperMetadataInput) => {
    const selectedPaperId = shellState.selectedPaperId;

    if (!selectedPaperId || !activePaperDetail) {
      return;
    }

    const updatedDraft = applyOptimisticPaperMetadataUpdate(
      activePaperDetail,
      input,
      paperReferences[selectedPaperId],
    );

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

  const handlePaperIssueAutofix = (issue: PaperIssue) => {
    if (!issue.autofix || issue.autofix.kind !== 'update-paper-metadata') {
      return;
    }

    handlePaperMetadataChange(issue.autofix.input);
  };

  const openAddReferenceModal = () => {
    setReferenceForm(createEmptyFormState());
    setEditingReferenceId(null);
    setReferenceFormError(null);
    setIsReferenceModalOpen(true);
  };

  const openEditReferenceModal = (referenceId: string) => {
    const ref = activePaperReferences.find((r) => r.id === referenceId);

    if (!ref) {
      return;
    }

    setReferenceForm(referenceToFormState(ref));
    setEditingReferenceId(referenceId);
    setReferenceFormError(null);
    setIsReferenceModalOpen(true);
  };

  const handleReferenceFormSubmit = async () => {
    const selectedPaperId = shellState.selectedPaperId;

    if (!api || !selectedPaperId) {
      setReferenceFormError(t('errors.bridgeUnavailable'));
      return;
    }

    const validationError = validateFormState(referenceForm, t);

    if (validationError) {
      setReferenceFormError(validationError);
      return;
    }

    setIsSavingReference(true);
    setReferenceFormError(null);

    try {
      const fields = formStateToFields(referenceForm);

      if (editingReferenceId) {
        await api.references.update(editingReferenceId, {
          referenceType: referenceForm.referenceType,
          fields,
        });
      } else {
        await api.references.create({
          paperId: selectedPaperId,
          referenceType: referenceForm.referenceType,
          fields,
        });
      }

      const updatedRefs = await api.references.listByPaper(selectedPaperId);

      setPaperReferences((current) => ({
        ...current,
        [selectedPaperId]: updatedRefs,
      }));
      setIsReferenceModalOpen(false);
    } catch {
      setReferenceFormError(t('errors.unableToSaveReference'));
    } finally {
      setIsSavingReference(false);
    }
  };

  const handleDeleteReference = async (referenceId: string) => {
    const selectedPaperId = shellState.selectedPaperId;

    if (!api || !selectedPaperId) {
      return;
    }

    try {
      await api.references.delete(referenceId);
      const updatedRefs = await api.references.listByPaper(selectedPaperId);

      setPaperReferences((current) => ({
        ...current,
        [selectedPaperId]: updatedRefs,
      }));
    } catch {
      setWorkspaceError(t('errors.unableToDeleteReference'));
    }
  };

  const handleInsertCitation = useCallback(
    (referenceId: string) => {
      const ref = activePaperReferences.find((r) => r.id === referenceId);
      if (!ref) return;
      const citationText = formatInTextCitation(ref);
      bodyEditorRef.current?.insertCitation(referenceId, citationText);
    },
    [activePaperReferences],
  );

  const renderHomeView = () => (
    <section className="flex h-full flex-col px-6 py-10 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
      <p className="label-caps text-[var(--color-accent-strong)]">
        {t('home.workspaceShell')}
      </p>
      <h2 className="mt-5 max-w-2xl font-[var(--font-display)] text-4xl leading-tight text-[var(--color-ink-strong)] md:text-5xl">
        {t('home.heading')}
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
        {t('home.description')}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
          onClick={openCourseModal}
          type="button"
        >
          {t('home.createFirstCourse')}
        </button>
        <button
          className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
          onClick={openPaperModal}
          type="button"
        >
          {t('home.draftPaperShell')}
        </button>
      </div>

      {recentPapers.length > 0 ? (
        <div className="mt-10">
          <h3 className="label-caps text-[var(--color-muted-strong)]">
            {t('home.recentPapers')}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentPapers.map((paper) => (
              <button
                className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-4 py-4 text-left transition-all duration-200 hover:shadow-[0_0_16px_rgba(212,149,106,0.1)] hover:border-[rgba(212,149,106,0.2)]"
                key={paper.id}
                onClick={() => paper.courseId && openPaper(paper.courseId, paper.id)}
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-[var(--color-ink-strong)]">
                    {paper.title}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-muted)]">
                    {t('courseView.paperType', { type: paper.paperType })}
                  </span>
                </span>
                <span className="text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)]">
                  {t('common.open')}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : courses.length > 0 ? (
        <div className="mt-10">
          <h3 className="label-caps text-[var(--color-muted-strong)]">
            {t('home.recentPapers')}
          </h3>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
            {t('home.noRecentPapers')}
          </p>
        </div>
      ) : null}
    </section>
  );

  const renderCourseView = (course: Course) => {
    const papers = coursePapers[course.id] ?? [];

    return (
      <section className="flex h-full flex-col gap-6 px-6 py-8 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-6">
          <div>
            <p className="label-caps text-[var(--color-accent-strong)]">
              {t('courseView.courseOverview')}
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl text-[var(--color-ink-strong)]">
              {course.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
              {t('courseView.description')}
            </p>
          </div>

          <button
            className={`${shellButtonClass} border-[var(--color-accent-soft)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]`}
            onClick={openPaperModal}
            type="button"
          >
            {t('courseView.newPaper')}
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
          <article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-6">
            <h3 className="label-caps text-[var(--color-muted-strong)]">
              {t('courseView.courseDefaults')}
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  {t('courseView.professor')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.professorName ?? t('common.notSetYet')}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  {t('courseView.semester')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.semester ?? t('common.notSetYet')}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  {t('courseView.institution')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.institution ?? t('common.notSetYet')}
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <p className="label-caps">
                  {t('courseView.defaultTemplate')}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-strong)]">
                  {course.defaultPaperTemplate}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-6">
            <h3 className="label-caps text-[var(--color-muted-strong)]">
              {t('courseView.papersInCourse')}
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
                        {t('courseView.paperType', { type: paper.paperType })}
                      </span>
                    </span>
                    <span className="text-xs uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)]">
                      {t('common.open')}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] p-5 text-sm leading-6 text-[var(--color-muted)]">
                  {t('courseView.emptyPapers')}
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
        <div className="flex items-center gap-3">
          <p className="label-caps text-[var(--color-accent-strong)]">
            {course.name}
          </p>
          <span className="text-[var(--color-line)]">/</span>
          {isRenamingPaperTitle ? (
            <InlineRenameInput
              className="font-[var(--font-display)] text-2xl"
              value={paper.title}
              onRename={(title) => {
                setIsRenamingPaperTitle(false);
                handlePaperMetadataChange({ title });
              }}
              onCancel={() => setIsRenamingPaperTitle(false)}
            />
          ) : (
            <h2
              className="cursor-text font-[var(--font-display)] text-2xl text-[var(--color-ink-strong)]"
              onDoubleClick={() => setIsRenamingPaperTitle(true)}
            >
              {paper.title}
            </h2>
          )}
        </div>

        <div className="flex gap-3">
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            disabled={isExporting}
            onClick={() => {
              if (!api || isExporting) return;
              setIsExporting(true);
              setWorkspaceError(null);
              void api.export.pdf(paper.id)
                .then((result) => {
                  if (result.status === 'error') {
                    setWorkspaceError(result.message);
                  }
                })
                .catch(() => {
                  setWorkspaceError(t('errors.exportFailed'));
                })
                .finally(() => {
                  setIsExporting(false);
                });
            }}
            type="button"
          >
            {isExporting ? t('paperView.exporting') : t('paperView.exportPdf')}
          </button>
          <button
            className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
            type="button"
          >
            {t('paperView.printPreview')}
          </button>
        </div>
      </div>

      {paperDetail ? (
        <PaperCanvas
          bodyDocument={paperDetail.paperContent.bodyDoc}
          bodyEditorRef={bodyEditorRef}
          onBodyDocumentChange={(document) =>
            handleBodyDocumentChange(paper.id, document)
          }
          onOpenCitation={() => dispatch({ type: 'set-inspector-tab', tab: 'references' })}
          onOpenReferences={() => dispatch({ type: 'set-inspector-tab', tab: 'references' })}
          onPasteWarningsChange={handlePaperPasteWarningsChange}
          onToggleBlockquote={() => bodyEditorRef.current?.toggleBlockquote()}
          paperDraft={paperDetail}
        />
      ) : (
        <div className="mx-auto w-full max-w-[820px] rounded-[var(--radius-panel)] border border-[var(--color-page-line)] bg-[var(--color-page)] px-8 py-10 shadow-[var(--shadow-page)]">
          <p className="label-caps">
            {t('paperView.loadingPaperScaffold')}
          </p>
          <p className="mt-6 text-sm leading-7 text-[var(--color-page-muted)]">
            {t('paperView.loadingPaperDescription')}
          </p>
        </div>
      )}
    </section>
  );

  const handleLanguageChange = async (language: Language) => {
    setAppLanguage(language);
    void i18n.changeLanguage(language);

    if (api) {
      try {
        await api.settings.save({ language });
      } catch {
        setWorkspaceError(t('errors.bridgeUnavailable'));
      }
    }
  };

  const renderSettingsView = () => (
    <section className="flex h-full flex-col px-6 py-10 md:px-10" style={{ animation: 'viewFadeIn 300ms ease-out' }}>
      <p className="label-caps text-[var(--color-accent-strong)]">
        {t('settings.settings')}
      </p>
      <h2 className="mt-4 font-[var(--font-display)] text-4xl text-[var(--color-ink-strong)]">
        {t('settings.heading')}
      </h2>

      <div className="mt-8 max-w-md">
        <label className="block text-sm text-[var(--color-ink-strong)]">
          {t('settings.language')}
          <select
            className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--color-line)] bg-[var(--color-input)] px-4 py-3 text-sm text-[var(--color-ink-strong)] outline-none transition focus:border-[var(--color-accent-soft)]"
            onChange={(event) => void handleLanguageChange(event.target.value as Language)}
            value={appLanguage}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {t(`settings.lang_${lang}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
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
              {t('header.searchLabel')}
            </label>
            <input
              className="w-full rounded-lg border-none bg-[var(--color-input)] py-1.5 pl-10 text-sm text-[var(--color-ink-strong)] outline-none placeholder:text-[var(--color-muted)] focus:ring-1 focus:ring-[var(--color-accent-soft)]"
              id="workspace-search"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('header.searchPlaceholder')}
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
            {t('header.draftPaper')}
          </button>
          <div className="flex gap-1">
            <button
              aria-label={t('header.notifications')}
              className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-panel-muted)] hover:text-[var(--color-ink-strong)]"
              type="button"
            >
              <NotificationsIcon />
            </button>
            <button
              aria-label={t('header.settings')}
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
            {t('errors.searchPlaceholder')}
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
              ? t('errors.unableToLoadCourses')
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
          onCourseRename={(courseId, name) => void handleCourseRename(courseId, name)}
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
          inspectorTab={shellState.inspectorTab}
          paperIssues={activePaperIssues}
          paperReferences={activePaperReferences}
          onAddReference={openAddReferenceModal}
          onCollapseToggle={() => dispatch({ type: 'toggleRightPanel' })}
          onDeleteReference={handleDeleteReference}
          onEditReference={openEditReferenceModal}
          onInsertCitation={handleInsertCitation}
          onInspectorTabChange={(tab) => dispatch({ type: 'set-inspector-tab', tab })}
          onPaperIssueAutofix={handlePaperIssueAutofix}
          onPaperMetadataChange={handlePaperMetadataChange}
        />
      </div>

      <CourseModal
        isOpen={isCourseModalOpen}
        courseForm={courseForm}
        errorMessage={courseFormError}
        isSubmitting={isCreatingCourse}
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
        isSubmitting={isCreatingPaper}
        onFormChange={setPaperForm}
        onSubmit={handleCreatePaper}
        onClose={() => {
          setPaperFormError(null);
          setIsPaperModalOpen(false);
        }}
      />

      <ReferenceFormModal
        isOpen={isReferenceModalOpen}
        form={referenceForm}
        editingReferenceId={editingReferenceId}
        errorMessage={referenceFormError}
        isSubmitting={isSavingReference}
        onFormChange={setReferenceForm}
        onSubmit={handleReferenceFormSubmit}
        onClose={() => {
          setReferenceFormError(null);
          setIsReferenceModalOpen(false);
        }}
      />
    </div>
  );
};
