import type { PersistenceIpcChannel } from '@application/contracts/persistence-ipc';

type PersistenceHandler = (payload?: unknown) => unknown;

export const registerPersistenceIpcHandlers = (
  ipcMainLike: {
    handle: (
      channel: PersistenceIpcChannel,
      listener: (_event: unknown, payload?: unknown) => unknown,
    ) => void;
  },
  handlers: Record<PersistenceIpcChannel, PersistenceHandler>,
): void => {
  (Object.entries(handlers) as Array<
    [PersistenceIpcChannel, PersistenceHandler]
  >).forEach(([channel, handler]) => {
    ipcMainLike.handle(channel, (_event, payload) => handler(payload));
  });
};
