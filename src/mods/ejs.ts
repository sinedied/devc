import { Mod } from '../mod.js';

export const ejs: Mod = {
  extensions: ['DigitalBrainstem.javascript-ejs-support'],
  applyIf: {
    packages: ['ejs']
  }
};
