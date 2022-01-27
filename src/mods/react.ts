import { Mod } from '../mod.js';

export const react: Mod = {
  forwardPorts: [3000],
  includeMods: ['eslint', 'jest'],
  applyIf: {
    packages: ['react']
  }
};
