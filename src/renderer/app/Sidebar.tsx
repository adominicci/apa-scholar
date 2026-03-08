import type { Course, Paper } from '@domain/shared/persistence-models';
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FileTextIcon,
  HomeIcon,
  LibraryAddIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from '@renderer/app/icons';

interface SidebarProps {
  collapsed: boolean;
  courses: Course[];
  coursePapers: Record<string, Paper[]>;
  emptyCoursesMessage?: string | null;
  expandedCourseIds: string[];
  loadingCourses: boolean;
  loadingCourseIds: string[];
  searchQuery: string;
  searchStatus: 'idle' | 'placeholder';
  selectedCourseId: string | null;
  selectedPaperId: string | null;
  onCollapseToggle: () => void;
  onCourseOpen: (courseId: string) => void;
  onCourseToggle: (courseId: string) => void;
  onCourseModalOpen: () => void;
  onHomeNavigate: () => void;
  onPaperModalOpen: () => void;
  onPaperOpen: (courseId: string, paperId: string) => void;
  onSearchChange: (query: string) => void;
  onSettingsNavigate: () => void;
}

const railButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]';

const getCourseMetaLine = (course: Course): string[] =>
  [course.professorName, course.institution, course.semester].filter(
    (value): value is string => Boolean(value),
  );

export const Sidebar = ({
  collapsed,
  courses,
  coursePapers,
  emptyCoursesMessage,
  expandedCourseIds,
  loadingCourses,
  loadingCourseIds,
  searchQuery,
  searchStatus,
  selectedCourseId,
  selectedPaperId,
  onCollapseToggle,
  onCourseOpen,
  onCourseToggle,
  onCourseModalOpen,
  onHomeNavigate,
  onPaperModalOpen,
  onPaperOpen,
  onSearchChange,
  onSettingsNavigate,
}: SidebarProps) => (
  <aside
    className="relative flex flex-col overflow-hidden border-r border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300"
    style={{ width: collapsed ? 48 : 300 }}
  >
    {/* Collapsed icon rail */}
    <div
      aria-hidden={collapsed ? 'false' : 'true'}
      className="panel-rail absolute inset-0 flex flex-col items-center py-4"
      data-visible={collapsed ? 'true' : 'false'}
    >
      <div className="flex h-9 w-9 items-center justify-center text-lg font-bold text-[var(--color-accent)]">
        A
      </div>
      <div className="mt-4 flex flex-col items-center gap-1">
        <button
          aria-label="Home"
          className={railButtonClass}
          onClick={onHomeNavigate}
          type="button"
        >
          <HomeIcon />
        </button>
        <button
          aria-label="Search"
          className={railButtonClass}
          onClick={() => onCollapseToggle()}
          type="button"
        >
          <SearchIcon />
        </button>
        <button
          aria-label="New course"
          className={railButtonClass}
          onClick={onCourseModalOpen}
          type="button"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="mx-auto my-3 w-6 border-t border-[var(--color-line)]" />
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-1">
          {courses.map((course) => (
            <button
              aria-label={`${course.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-panel-muted)] text-xs font-semibold text-[var(--color-muted-strong)] transition hover:text-[var(--color-accent)]"
              key={course.id}
              onClick={() => onCourseOpen(course.id)}
              title={course.name}
              type="button"
            >
              {course.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-col items-center gap-1">
        <button
          aria-label="Settings"
          className={railButtonClass}
          onClick={onSettingsNavigate}
          type="button"
        >
          <SettingsIcon />
        </button>
        <button
          aria-label="Expand sidebar"
          className={railButtonClass}
          onClick={onCollapseToggle}
          type="button"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>

    {/* Expanded content */}
    <div
      aria-hidden={collapsed ? 'true' : 'false'}
      className="panel-content flex flex-1 flex-col overflow-hidden"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="p-4 space-y-6 overflow-y-auto no-scrollbar">
        <div>
          <p className="label-caps px-3 mb-2">
            Workspace
          </p>
          <h1 className="sr-only">APA Scholar</h1>
          <nav className="space-y-1">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[var(--color-accent)] bg-[var(--color-selection)] transition"
              onClick={onHomeNavigate}
              type="button"
            >
              <HomeIcon />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[var(--color-muted)] transition hover:bg-[var(--color-input)] hover:text-[var(--color-ink-strong)]"
              type="button"
            >
              <DatabaseIcon />
              <span className="text-sm font-medium">Research</span>
            </button>
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[var(--color-muted)] transition hover:bg-[var(--color-input)] hover:text-[var(--color-ink-strong)]"
              type="button"
            >
              <BookmarkIcon />
              <span className="text-sm font-medium">Citations</span>
            </button>
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[var(--color-muted)] transition hover:bg-[var(--color-input)] hover:text-[var(--color-ink-strong)]"
              type="button"
            >
              <FileTextIcon />
              <span className="text-sm font-medium">Drafts</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="flex gap-2 border-y border-[var(--color-line)] p-4">
        <button
          className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-[var(--color-accent-ink)] transition hover:opacity-90"
          onClick={onCourseModalOpen}
          type="button"
        >
          New course
        </button>
        <button
          className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-muted)] px-3 py-2 text-xs font-bold text-[var(--color-ink-strong)] transition hover:border-[var(--color-accent-soft)]"
          onClick={onPaperModalOpen}
          type="button"
        >
          New paper
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="label-caps">
            Courses
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {loadingCourses ? 'Loading...' : `${courses.length} total`}
          </p>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2 no-scrollbar">
          {courses.length > 0 ? (
            courses.map((course) => {
              const papers = coursePapers[course.id] ?? [];
              const isExpanded = expandedCourseIds.includes(course.id);
              const isSelected = selectedCourseId === course.id;
              const isLoadingPapers = loadingCourseIds.includes(course.id);

              return (
                <div key={course.id}>
                  <div className="flex items-start gap-1">
                    <button
                      aria-label={
                        isExpanded
                          ? `Collapse course ${course.name}`
                          : `Expand course ${course.name}`
                      }
                      className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-[var(--color-muted-strong)] transition hover:text-[var(--color-accent)]"
                      onClick={() => onCourseToggle(course.id)}
                      type="button"
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                    <button
                      aria-label={`Open course ${course.name}`}
                      className={`flex-1 rounded-lg px-3 py-2 text-left transition ${
                        isSelected
                          ? 'bg-[var(--color-selection)] text-[var(--color-ink-strong)]'
                          : 'hover:bg-[var(--color-input)]'
                      }`}
                      onClick={() => onCourseOpen(course.id)}
                      type="button"
                    >
                      <span className="block text-sm font-medium">
                        {course.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                        {getCourseMetaLine(course).join(' · ') || 'Course metadata ready for setup'}
                      </span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-0.5 border-l border-[var(--color-line)] pl-3">
                      {isLoadingPapers ? (
                        <p className="py-2 text-xs text-[var(--color-muted)]">
                          Loading papers
                        </p>
                      ) : papers.length > 0 ? (
                        papers.map((paper) => (
                          <button
                            aria-label={`Open paper ${paper.title}`}
                            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                              selectedPaperId === paper.id
                                ? 'bg-[var(--color-selection)] text-[var(--color-ink-strong)]'
                                : 'hover:bg-[var(--color-input)]'
                            }`}
                            key={paper.id}
                            onClick={() => onPaperOpen(course.id, paper.id)}
                            type="button"
                          >
                            <span className="block font-medium">{paper.title}</span>
                            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                              {paper.paperType}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-[var(--color-muted)]">
                          No papers yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-4 text-sm leading-6 text-[var(--color-muted)]">
              {loadingCourses
                ? 'Loading your workspace...'
                : emptyCoursesMessage ??
                  'No courses yet. Create one to start organizing APA papers by class.'}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--color-line)] p-4">
        <button
          aria-label="Add reference"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-accent-soft)] py-2 text-xs font-bold text-[var(--color-accent)] transition hover:bg-[var(--color-selection)]"
          disabled
          type="button"
        >
          <LibraryAddIcon />
          Add reference
        </button>
      </div>
    </div>
  </aside>
);
