import { Mod } from '../mod.js';

export const nextjs: Mod = {
  forwardPorts: [3000],
  applyIf: {
    packages: ['next']
  }
};
