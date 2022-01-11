import { Mod } from '../mod.js';

export const pnpm: Mod = {
  postCreateCommand: 'pnpm install',
  globalPackages: ['pnpm']
};
