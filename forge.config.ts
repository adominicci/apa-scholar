import path from 'node:path';
import fs from 'fs-extra';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

/** Native/external modules that Vite does not bundle and must be copied into the packaged app. */
const externalModules = [
  'better-sqlite3',
  'bindings',
  'file-uri-to-path',
];

const isSigningConfigured =
  Boolean(process.env.APPLE_ID) &&
  Boolean(process.env.APPLE_PASSWORD) &&
  Boolean(process.env.APPLE_TEAM_ID);

const config: ForgeConfig = {
  packagerConfig: {
    name: 'APA Scholar',
    asar: {
      unpack: '**/{better-sqlite3,bindings,file-uri-to-path}/**/*.node',
    },
    appBundleId: 'com.apascholar.app',
    appCategoryType: 'public.app-category.education',
    icon: 'assets/icon',
    ...(isSigningConfigured
      ? {
          osxSign: {
            optionsForFile: (filePath: string) => ({
              entitlements: filePath.endsWith('.app')
                ? 'entitlements/entitlements.plist'
                : 'entitlements/entitlements.inherit.plist',
            }),
          },
          osxNotarize: {
            appleId: process.env.APPLE_ID!,
            appleIdPassword: process.env.APPLE_PASSWORD!,
            teamId: process.env.APPLE_TEAM_ID!,
          },
        }
      : {}),
  },
  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      const projectRoot = path.resolve(__dirname);
      const destNodeModules = path.join(buildPath, 'node_modules');
      await fs.ensureDir(destNodeModules);
      for (const mod of externalModules) {
        const src = path.join(projectRoot, 'node_modules', mod);
        const dest = path.join(destNodeModules, mod);
        if (await fs.pathExists(src)) {
          await fs.copy(src, dest);
        }
      }
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerDMG({
      format: 'ULFO',
    }),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
        {
          entry: 'src/preload/print-preload.ts',
          config: 'vite.print-preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
        {
          name: 'print_window',
          config: 'vite.print-renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};

export default config;
