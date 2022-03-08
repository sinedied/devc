import { Mod } from '../mod.js';

export const xo: Mod = {
  extensions: ['samverschueren.linter-xo'],
  applyIf: {
    packages: ['xo']
  }
};
