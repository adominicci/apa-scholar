import { z } from 'zod';

export const exportIpcChannels = {
  exportPdf: 'export:pdf',
} as const;

export type ExportIpcChannel =
  (typeof exportIpcChannels)[keyof typeof exportIpcChannels];

export const exportPdfPayloadSchema = z.object({
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export type ExportPdfPayload = z.infer<typeof exportPdfPayloadSchema>;

export type ExportResult =
  | { status: 'success'; filePath: string }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };
