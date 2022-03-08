import { Mod } from '../mod.js';

export const totaljs: Mod = {
  forwardPorts: [8000],
  globalPackages: ['total4'],
  applyIf: {
    packages: ['total4']
  }
};
