import { Mod } from '../mod.js';

export const loopback: Mod = {
  forwardPorts: [3000],
  globalPackages: ['@loopback/cli'],
  applyIf: {
    packages: ['@loopback/core']
  }
};
