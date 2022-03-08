import { Mod } from '../mod.js';

export const vuepress: Mod = {
  includeMods: ['vue'],
  applyIf: {
    packages: ['vuepress']
  }
};
