import { z } from 'zod';
import { languageSchema } from '@domain/shared/persistence-models';

export const settingsIpcChannels = {
  settingsGet: 'settings:get',
  settingsSave: 'settings:save',
} as const;

export type SettingsIpcChannel =
  (typeof settingsIpcChannels)[keyof typeof settingsIpcChannels];

export const saveSettingsPayloadSchema = z.object({
  language: languageSchema,
  debug: z.boolean().optional().default(false),
});

export type SaveSettingsPayload = z.infer<typeof saveSettingsPayloadSchema>;
