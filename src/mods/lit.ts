import { Mod } from '../mod.js';

export const lit: Mod = {
  forwardPorts: [8000],
  extensions: ['bierner.lit-html'],
  applyIf: {
    packages: ['lit']
  }
};
