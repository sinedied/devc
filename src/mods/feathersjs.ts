import { Mod } from '../mod.js';

export const feathersjs: Mod = {
  forwardPorts: [3030],
  globalPackages: ['@feathersjs/cli'],
  applyIf: {
    packages: ['@feathersjs/feathers']
  }
};
