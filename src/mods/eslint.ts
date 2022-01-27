import { Mod } from '../mod.js';

export const eslint: Mod = {
  extensions: ['dbaeumer.vscode-eslint'],
  applyIf: {
    packages: ['eslint']
  }
};
