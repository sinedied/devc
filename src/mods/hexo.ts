import { Mod } from '../mod.js';

export const hexo: Mod = {
  forwardPorts: [4000],
  globalPackages: ['hexo-cli'],
  applyIf: {
    packages: ['hexo']
  }
};
