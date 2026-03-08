import type { GhostPageViewModel } from '@domain/papers/ghost-page-view-model';
import type {
  Paper,
  PaperContent,
  PaperMeta,
} from '@domain/shared/persistence-models';

export interface StoredPaperAggregate {
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
}

export interface PaperDraft extends StoredPaperAggregate {
  ghostPages: GhostPageViewModel[];
}
