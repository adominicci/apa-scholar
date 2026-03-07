import type { Course, Paper } from '@domain/shared/persistence-models';
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  InfoIcon,
  SearchIcon,
} from '@renderer/app/icons';

interface InspectorProps {
  collapsed: boolean;
  activeCourse: Course | null;
  activePaper: Paper | null;
  onCollapseToggle: () => void;
}

const railButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]';

export const Inspector = ({
  collapsed,
  activeCourse,
  activePaper,
  onCollapseToggle,
}: InspectorProps) => (
  <aside
    aria-label="Inspector panel"
    className="relative flex flex-col overflow-hidden border-l border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300"
    role="complementary"
    style={{ width: collapsed ? 48 : 288 }}
  >
    {/* Collapsed icon rail */}
    <div
      aria-hidden={collapsed ? 'false' : 'true'}
      className="panel-rail absolute inset-0 flex flex-col items-center py-4"
      data-visible={collapsed ? 'true' : 'false'}
    >
      <button
        aria-label="Details"
        className={railButtonClass}
        onClick={onCollapseToggle}
        type="button"
      >
        <InfoIcon />
      </button>
      <button
        aria-label="Issues"
        className={railButtonClass}
        type="button"
      >
        <AlertTriangleIcon />
      </button>
      <button
        aria-label="Search"
        className={railButtonClass}
        type="button"
      >
        <SearchIcon />
      </button>
      <div className="mt-auto">
        <button
          aria-label="Expand inspector"
          className={railButtonClass}
          onClick={onCollapseToggle}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
      </div>
    </div>

    {/* Expanded content */}
    <div
      aria-hidden={collapsed ? 'true' : 'false'}
      className="panel-content flex flex-1 flex-col overflow-y-auto no-scrollbar"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-line)] p-4">
        <div>
          <p className="label-caps">
            Inspector
          </p>
          <h2 className="mt-1 text-sm font-bold text-[var(--color-ink-strong)]">
            {activePaper ? 'Paper details' : activeCourse ? 'Course details' : 'Workspace guide'}
          </h2>
        </div>
        <button
          aria-label="Collapse inspector"
          className={railButtonClass}
          onClick={onCollapseToggle}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
      </div>

      <div className="border-b border-[var(--color-line)] p-4">
        {activePaper ? (
          <>
            <p className="label-caps">
              Paper details
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="label-caps">
                  Template
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">{activePaper.templateId}</p>
              </div>
              <div>
                <p className="label-caps">
                  Paper type
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">{activePaper.paperType}</p>
              </div>
              <div>
                <p className="label-caps">
                  Course
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">{activeCourse?.name}</p>
              </div>
            </div>
          </>
        ) : activeCourse ? (
          <>
            <p className="label-caps">
              Course details
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="label-caps">
                  Professor
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.professorName ?? 'Not set yet'}
                </p>
              </div>
              <div>
                <p className="label-caps">
                  Semester
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.semester ?? 'Not set yet'}
                </p>
              </div>
              <div>
                <p className="label-caps">
                  Institution
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.institution ?? 'Not set yet'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="label-caps">
              Workspace guide
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              Choose a course to see reusable defaults, or open a paper to keep APA
              structure and metadata visible while you draft.
            </p>
          </>
        )}
      </div>

      <div className="border-b border-[var(--color-line)] p-4">
        <p className="label-caps">
          Issues
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          APA warnings, missing metadata, and structural prompts will surface here in a
          later milestone.
        </p>
      </div>

      <div className="p-4">
        <p className="label-caps">
          Search
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          Search is wired at the contract boundary now and will become real once course
          and paper indexing lands.
        </p>
      </div>
    </div>
  </aside>
);
