import { Mod } from '../mod.js';

export const stencil: Mod = {
  forwardPorts: [3333],
  applyIf: {
    packages: ['@stencil/core']
  }
};
