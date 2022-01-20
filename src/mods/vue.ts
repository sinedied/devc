import { Mod } from '../mod.js';

export const vue: Mod = {
  forwardPorts: [8080],
  extensions: ['johnsoncodehk.volar'],
  applyIf: {
    packages: ['vue']
  }
};
