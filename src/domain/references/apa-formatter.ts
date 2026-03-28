import type { ReferenceEntry } from '@domain/references/reference-entry';

export interface ReferenceFormattedSegment {
  text: string;
  italic: boolean;
}

export const formatReferenceApa = (
  _entry: ReferenceEntry,
): ReferenceFormattedSegment[] => {
  return [{ text: '[APA formatted reference placeholder]', italic: false }];
};
