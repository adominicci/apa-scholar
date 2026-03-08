import type { PaperDraft } from '@domain/papers/paper-draft';
import type { UpdatePaperMetadataInput } from '@domain/shared/persistence-models';
import {
  InspectorSection,
  InspectorSelectField,
  InspectorTextAreaField,
  InspectorTextField,
  InspectorToggleField,
  InspectorValidationList,
} from '@renderer/app/inspector/InspectorControls';

interface PaperInspectorPanelProps {
  paperDraft: PaperDraft;
  validationMessages: string[];
  onMetadataChange: (input: UpdatePaperMetadataInput) => void;
}

const toFieldValue = (value: string | null): string => value ?? '';
const toMetadataValue = (value: string): string | null =>
  value.trim().length > 0 ? value : null;

export const PaperInspectorPanel = ({
  paperDraft,
  validationMessages,
  onMetadataChange,
}: PaperInspectorPanelProps) => {
  const isProfessional = paperDraft.paper.paperType === 'professional';

  return (
    <>
      <InspectorSection title="Paper details">
        <InspectorSelectField
          label="Paper type"
          onChange={(paperType) =>
            onMetadataChange({
              paperType: paperType as PaperDraft['paper']['paperType'],
            })
          }
          options={[
            { label: 'Student paper', value: 'student' },
            { label: 'Professional paper', value: 'professional' },
          ]}
          value={paperDraft.paper.paperType}
        />
        <InspectorToggleField
          checked={paperDraft.paperMeta.abstractEnabled}
          label="Include abstract"
          onChange={(abstractEnabled) => onMetadataChange({ abstractEnabled })}
        />
        <InspectorTextField
          label="Paper title"
          onChange={(title) => onMetadataChange({ title })}
          value={paperDraft.paperMeta.title}
        />
      </InspectorSection>

      <InspectorSection title={isProfessional ? 'Professional metadata' : 'Student metadata'}>
        <InspectorTextField
          label="Author name"
          onChange={(authorName) => onMetadataChange({ authorName: toMetadataValue(authorName) })}
          value={toFieldValue(paperDraft.paperMeta.authorName)}
        />
        <InspectorTextField
          label="Institution"
          onChange={(institution) => onMetadataChange({ institution: toMetadataValue(institution) })}
          value={toFieldValue(paperDraft.paperMeta.institution)}
        />

        {isProfessional ? (
          <>
            <InspectorTextField
              label="Running head"
              onChange={(runningHead) => onMetadataChange({ runningHead: toMetadataValue(runningHead) })}
              placeholder="Short title"
              value={toFieldValue(paperDraft.paperMeta.runningHead)}
            />
            <InspectorTextAreaField
              label="Author note"
              onChange={(authorNote) => onMetadataChange({ authorNote: toMetadataValue(authorNote) })}
              placeholder="Department, acknowledgements, or funding note"
              value={toFieldValue(paperDraft.paperMeta.authorNote)}
            />
          </>
        ) : (
          <>
            <InspectorTextField
              label="Course name"
              onChange={(courseName) => onMetadataChange({ courseName: toMetadataValue(courseName) })}
              value={toFieldValue(paperDraft.paperMeta.courseName)}
            />
            <InspectorTextField
              label="Professor name"
              onChange={(professorName) => onMetadataChange({ professorName: toMetadataValue(professorName) })}
              value={toFieldValue(paperDraft.paperMeta.professorName)}
            />
            <InspectorTextField
              label="Due date"
              onChange={(dueDate) => onMetadataChange({ dueDate: toMetadataValue(dueDate) })}
              value={toFieldValue(paperDraft.paperMeta.dueDate)}
            />
          </>
        )}
      </InspectorSection>

      <InspectorSection title="Validation">
        <InspectorValidationList messages={validationMessages} />
      </InspectorSection>
    </>
  );
};
