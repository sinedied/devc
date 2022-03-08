import { Mod } from '../mod.js';

export const hapi: Mod = {
  forwardPorts: [3000],
  globalPackages: ['@hapipal/hpal'],
  applyIf: {
    packages: ['@hapi/hapi']
  }
};
