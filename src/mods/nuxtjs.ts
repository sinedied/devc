import { Mod } from '../mod.js';

export const nuxtjs: Mod = {
  forwardPorts: [3000],
  applyIf: {
    packages: ['nuxt']
  }
};
