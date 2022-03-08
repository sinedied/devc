import { Mod } from '../mod.js';

export const vite: Mod = {
  forwardPorts: [3000],
  extensions: ['antfu.vite'],
  applyIf: {
    packages: ['vite']
  }
};
