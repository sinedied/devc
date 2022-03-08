import { Mod } from '../mod.js';

export const meteor: Mod = {
  forwardPorts: [3000],
  globalPackages: ['meteor'],
  applyIf: {
    packages: ['meteor-node-stubs']
  }
};
