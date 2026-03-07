import { buildGhostPageViewModels } from '@domain/papers/ghost-page-view-model';
import type { PaperDraft, StoredPaperAggregate } from '@domain/papers/paper-draft';

export const buildPaperDraft = (aggregate: StoredPaperAggregate): PaperDraft => ({
  ...aggregate,
  ghostPages: buildGhostPageViewModels(aggregate),
});
