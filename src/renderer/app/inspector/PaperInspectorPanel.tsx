import { useTranslation } from 'react-i18next';
import type { PaperDraft } from '@domain/papers/paper-draft';
import type { PaperIssue } from '@domain/papers/paper-issues';
import type { UpdatePaperMetadataInput } from '@domain/shared/persistence-models';
import {
  InspectorIssuesList,
  InspectorSection,
  InspectorSelectField,
  InspectorTextAreaField,
  InspectorTextField,
  InspectorToggleField,
} from '@renderer/app/inspector/InspectorControls';

interface PaperInspectorPanelProps {
  issues: PaperIssue[];
  paperDraft: PaperDraft;
  onIssueAutofix: (issue: PaperIssue) => void;
  onMetadataChange: (input: UpdatePaperMetadataInput) => void;
}

const toFieldValue = (value: string | null): string => value ?? '';
const toMetadataValue = (value: string): string | null =>
  value.trim().length > 0 ? value : null;

export const PaperInspectorPanel = ({
  issues,
  paperDraft,
  onIssueAutofix,
  onMetadataChange,
}: PaperInspectorPanelProps) => {
  const { t } = useTranslation();
  const isProfessional = paperDraft.paper.paperType === 'professional';

  return (
    <>
      <InspectorSection title={t('paperInspector.paperDetails')}>
        <InspectorSelectField
          label={t('paperInspector.paperType')}
          onChange={(paperType) =>
            onMetadataChange({
              paperType: paperType as PaperDraft['paper']['paperType'],
            })
          }
          options={[
            { label: t('paperInspector.studentPaper'), value: 'student' },
            { label: t('paperInspector.professionalPaper'), value: 'professional' },
          ]}
          value={paperDraft.paper.paperType}
        />
        <InspectorToggleField
          checked={paperDraft.paperMeta.abstractEnabled}
          label={t('paperInspector.includeAbstract')}
          onChange={(abstractEnabled) => onMetadataChange({ abstractEnabled })}
        />
        <InspectorTextField
          label={t('paperInspector.paperTitle')}
          onChange={(title) => onMetadataChange({ title })}
          value={paperDraft.paperMeta.title}
        />
      </InspectorSection>

      <InspectorSection title={isProfessional ? t('paperInspector.professionalMetadata') : t('paperInspector.studentMetadata')}>
        <InspectorTextField
          label={t('paperInspector.authorName')}
          onChange={(authorName) => onMetadataChange({ authorName: toMetadataValue(authorName) })}
          value={toFieldValue(paperDraft.paperMeta.authorName)}
        />
        <InspectorTextField
          label={t('paperInspector.institution')}
          onChange={(institution) => onMetadataChange({ institution: toMetadataValue(institution) })}
          value={toFieldValue(paperDraft.paperMeta.institution)}
        />

        {isProfessional ? (
          <>
            <InspectorTextField
              label={t('paperInspector.runningHead')}
              onChange={(runningHead) => onMetadataChange({ runningHead: toMetadataValue(runningHead) })}
              placeholder={t('paperInspector.runningHeadPlaceholder')}
              value={toFieldValue(paperDraft.paperMeta.runningHead)}
            />
            <InspectorTextAreaField
              label={t('paperInspector.authorNote')}
              onChange={(authorNote) => onMetadataChange({ authorNote: toMetadataValue(authorNote) })}
              placeholder={t('paperInspector.authorNotePlaceholder')}
              value={toFieldValue(paperDraft.paperMeta.authorNote)}
            />
          </>
        ) : (
          <>
            <InspectorTextField
              label={t('paperInspector.courseName')}
              onChange={(courseName) => onMetadataChange({ courseName: toMetadataValue(courseName) })}
              value={toFieldValue(paperDraft.paperMeta.courseName)}
            />
            <InspectorTextField
              label={t('paperInspector.professorName')}
              onChange={(professorName) => onMetadataChange({ professorName: toMetadataValue(professorName) })}
              value={toFieldValue(paperDraft.paperMeta.professorName)}
            />
            <InspectorTextField
              label={t('paperInspector.dueDate')}
              onChange={(dueDate) => onMetadataChange({ dueDate: toMetadataValue(dueDate) })}
              value={toFieldValue(paperDraft.paperMeta.dueDate)}
            />
          </>
        )}
      </InspectorSection>

      <InspectorSection title={t('paperInspector.issues')}>
        <InspectorIssuesList
          issues={issues}
          onAutofix={onIssueAutofix}
        />
      </InspectorSection>
    </>
  );
};
