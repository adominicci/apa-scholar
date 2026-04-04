import {
  saveSettingsPayloadSchema,
  settingsIpcChannels,
  type SettingsIpcChannel,
} from '@application/contracts/settings-ipc';
import type { SettingsRepository } from '@application/contracts/persistence-repositories';

type SettingsHandler = (payload?: unknown) => unknown;

export const createSettingsIpcHandlers = (
  settingsRepository: SettingsRepository,
): Record<SettingsIpcChannel, SettingsHandler> => ({
  [settingsIpcChannels.settingsGet]: () => settingsRepository.get(),
  [settingsIpcChannels.settingsSave]: (payload) => {
    const parsed = saveSettingsPayloadSchema.parse(payload);
    return settingsRepository.save(parsed);
  },
});
