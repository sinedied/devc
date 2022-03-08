import { Mod } from '../mod.js';

export const preact: Mod = {
  forwardPorts: [8080],
  applyIf: {
    packages: ['preact']
  }
};
