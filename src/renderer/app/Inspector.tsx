import { useTranslation } from 'react-i18next';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type { PaperIssue } from '@domain/papers/paper-issues';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import type { Course, Paper } from '@domain/shared/persistence-models';
import {
  AlertTriangleIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  InfoIcon,
  SearchIcon,
} from '@renderer/app/icons';
import { PaperInspectorPanel } from '@renderer/app/inspector/PaperInspectorPanel';
import { ReferencesPanel } from '@renderer/app/inspector/ReferencesPanel';
import type { InspectorTab } from '@renderer/app/workspace-shell-state';
import type { UpdatePaperMetadataInput } from '@domain/shared/persistence-models';

interface InspectorProps {
  collapsed: boolean;
  activeCourse: Course | null;
  activePaper: Paper | null;
  activePaperDetail: PaperDraft | null;
  inspectorTab: InspectorTab;
  paperIssues: PaperIssue[];
  paperReferences: ReferenceEntry[];
  onAddReference: () => void;
  onCollapseToggle: () => void;
  onDeleteReference: (referenceId: string) => void;
  onEditReference: (referenceId: string) => void;
  onInsertCitation?: (referenceId: string) => void;
  onInspectorTabChange: (tab: InspectorTab) => void;
  onPaperIssueAutofix: (issue: PaperIssue) => void;
  onPaperMetadataChange: (input: UpdatePaperMetadataInput) => void;
}

const railButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] text-[var(--color-muted)] transition hover:text-[var(--color-accent)]';

const tabButtonClass = (isActive: boolean) =>
  `px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] transition ${
    isActive
      ? 'text-[var(--color-accent-strong)] border-b-2 border-[var(--color-accent)]'
      : 'text-[var(--color-muted)] hover:text-[var(--color-ink-strong)]'
  }`;

export const Inspector = ({
  collapsed,
  activeCourse,
  activePaper,
  activePaperDetail,
  inspectorTab,
  paperIssues,
  paperReferences,
  onAddReference,
  onCollapseToggle,
  onDeleteReference,
  onEditReference,
  onInsertCitation,
  onInspectorTabChange,
  onPaperIssueAutofix,
  onPaperMetadataChange,
}: InspectorProps) => {
  const { t } = useTranslation();

  return (
  <aside
    aria-label={t('inspector.inspectorPanel')}
    className="relative flex flex-col overflow-hidden border-l border-[var(--color-line)] bg-[var(--color-panel)] transition-all duration-300"
    role="complementary"
    style={{ width: collapsed ? 48 : 340 }}
  >
    {/* Collapsed icon rail */}
    <div
      aria-hidden={collapsed ? 'false' : 'true'}
      className="panel-rail absolute inset-0 flex flex-col items-center py-4"
      data-visible={collapsed ? 'true' : 'false'}
    >
      <button
        aria-label={t('inspector.details')}
        className={railButtonClass}
        onClick={() => onInspectorTabChange('details')}
        type="button"
      >
        <InfoIcon />
      </button>
      <button
        aria-label={t('inspector.issues')}
        className={railButtonClass}
        onClick={() => onInspectorTabChange('issues')}
        type="button"
      >
        <AlertTriangleIcon />
      </button>
      <button
        aria-label={t('inspector.references')}
        className={railButtonClass}
        onClick={() => onInspectorTabChange('references')}
        type="button"
      >
        <BookmarkIcon />
      </button>
      <button
        aria-label={t('inspector.search')}
        className={railButtonClass}
        type="button"
      >
        <SearchIcon />
      </button>
      <div className="mt-auto">
        <button
          aria-label={t('inspector.expandInspector')}
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
            {t('inspector.inspector')}
          </p>
          {activePaper ? (
            <div className="mt-2 flex gap-1">
              <button
                className={tabButtonClass(inspectorTab === 'details')}
                onClick={() => onInspectorTabChange('details')}
                type="button"
              >
                {t('inspector.details')}
              </button>
              <button
                className={tabButtonClass(inspectorTab === 'issues')}
                onClick={() => onInspectorTabChange('issues')}
                type="button"
              >
                {t('inspector.issues')}
              </button>
              <button
                className={tabButtonClass(inspectorTab === 'references')}
                onClick={() => onInspectorTabChange('references')}
                type="button"
              >
                {t('inspector.references')}
              </button>
            </div>
          ) : (
            <h2 className="mt-1 text-sm font-bold text-[var(--color-ink-strong)]">
              {activeCourse ? t('inspector.courseDetails') : t('inspector.workspaceGuide')}
            </h2>
          )}
        </div>
        <button
          aria-label={t('inspector.collapseInspector')}
          className={railButtonClass}
          onClick={onCollapseToggle}
          type="button"
        >
          <ChevronLeftIcon />
        </button>
      </div>

      <div className="border-b border-[var(--color-line)] p-4">
        {activePaper && activePaperDetail ? (
          inspectorTab === 'references' ? (
            <ReferencesPanel
              references={paperReferences}
              onAddReference={onAddReference}
              onEditReference={onEditReference}
              onDeleteReference={onDeleteReference}
              onInsertCitation={onInsertCitation}
            />
          ) : inspectorTab === 'issues' ? (
            <>
              <p className="label-caps">{t('inspector.issues')}</p>
              {paperIssues.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {paperIssues.map((issue) => (
                    <div
                      className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-panel-muted)] p-3"
                      key={issue.code}
                    >
                      <p className="text-sm text-[var(--color-ink-strong)]">{issue.title}</p>
                      {issue.autofix && (
                        <button
                          className="mt-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-caps)] text-[var(--color-accent-strong)] transition hover:underline"
                          onClick={() => onPaperIssueAutofix(issue)}
                          type="button"
                        >
                          {t('common.fix')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                  {t('inspector.noIssues')}
                </p>
              )}
            </>
          ) : (
            <PaperInspectorPanel
              issues={paperIssues}
              paperDraft={activePaperDetail}
              onIssueAutofix={onPaperIssueAutofix}
              onMetadataChange={onPaperMetadataChange}
            />
          )
        ) : activeCourse ? (
          <>
            <p className="label-caps">
              {t('inspector.courseDetails')}
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="label-caps">
                  {t('inspector.professor')}
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.professorName ?? t('common.notSetYet')}
                </p>
              </div>
              <div>
                <p className="label-caps">
                  {t('inspector.semester')}
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.semester ?? t('common.notSetYet')}
                </p>
              </div>
              <div>
                <p className="label-caps">
                  {t('inspector.institution')}
                </p>
                <p className="mt-1 text-[var(--color-ink-strong)]">
                  {activeCourse.institution ?? t('common.notSetYet')}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="label-caps">
              {t('inspector.workspaceGuide')}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
              {t('inspector.workspaceGuideText')}
            </p>
          </>
        )}
      </div>

      {!activePaper && (
        <div className="border-b border-[var(--color-line)] p-4">
          <p className="label-caps">
            {t('inspector.issues')}
          </p>
          <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
            {t('inspector.issuesPlaceholder')}
          </p>
        </div>
      )}

      <div className="p-4">
        <p className="label-caps">
          {t('inspector.search')}
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          {t('inspector.searchPlaceholder')}
        </p>
      </div>
    </div>
  </aside>
  );
};
