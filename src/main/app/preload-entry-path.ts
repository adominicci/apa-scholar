import path from 'node:path';
import { existsSync } from 'node:fs';

export const resolvePreloadEntryPath = (
  buildDirectory: string,
  fileExists: (filePath: string) => boolean = existsSync,
): string => {
  const productionPreloadPath = path.join(buildDirectory, 'preload.js');

  if (fileExists(productionPreloadPath)) {
    return productionPreloadPath;
  }

  const devPreloadPath = path.join(buildDirectory, 'index.js');

  if (fileExists(devPreloadPath)) {
    return devPreloadPath;
  }

  return productionPreloadPath;
};
