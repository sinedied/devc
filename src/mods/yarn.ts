import { Mod } from '../mod.js';

export const yarn: Mod = {
  postCreateCommand: 'yarn install',
  globalPackages: ['yarn']
};
