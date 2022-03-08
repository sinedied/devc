import { Mod } from '../mod.js';

export const koa: Mod = {
  forwardPorts: [3000],
  applyIf: {
    packages: ['koa']
  }
};
