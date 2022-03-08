import { Mod } from '../mod.js';

export const express: Mod = {
  forwardPorts: [3000],
  applyIf: {
    packages: ['express']
  }
};
