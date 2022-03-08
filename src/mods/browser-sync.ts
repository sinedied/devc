import { Mod } from '../mod.js';

export const browserSync: Mod = {
  forwardPorts: [3000],
  applyIf: {
    packages: ['browser-sync']
  }
};
