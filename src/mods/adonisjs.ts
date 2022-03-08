import { Mod } from '../mod.js';

export const adonisjs: Mod = {
  forwardPorts: [3333],
  applyIf: {
    packages: ['@adonisjs/core']
  }
};
