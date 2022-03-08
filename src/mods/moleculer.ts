import { Mod } from '../mod.js';

export const moleculer: Mod = {
  forwardPorts: [3000],
  globalPackages: ['moleculer-cli'],
  applyIf: {
    packages: ['moleculer']
  }
};
