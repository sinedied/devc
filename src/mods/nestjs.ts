import { Mod } from '../mod.js';

export const nestjs: Mod = {
  forwardPorts: [3000],
  globalPackages: ['@nestjs/cli'],
  applyIf: {
    packages: ['@nestjs/core']
  }
};
