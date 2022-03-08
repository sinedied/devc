import { Mod } from '../mod.js';

export const restify: Mod = {
  forwardPorts: [8080],
  applyIf: {
    packages: ['restify']
  }
};
