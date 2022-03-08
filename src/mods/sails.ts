import { Mod } from '../mod.js';

export const sails: Mod = {
  forwardPorts: [1337],
  globalPackages: ['sails'],
  applyIf: {
    packages: ['sails']
  }
};
