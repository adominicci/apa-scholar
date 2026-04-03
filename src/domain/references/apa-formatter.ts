import type { ReferenceEntry } from '@domain/references/reference-entry';

export interface ReferenceFormattedSegment {
  text: string;
  italic: boolean;
}

// TODO: Implement full APA 7th-edition formatting (Epic 01 Task 04).
// This returns a placeholder segment until that task is complete.
export const formatReferenceApa = (
  _entry: ReferenceEntry,
): ReferenceFormattedSegment[] => {
  return [{ text: '[APA formatted reference placeholder]', italic: false }];
};
