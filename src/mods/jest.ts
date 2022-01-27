import { Mod } from '../mod.js';

export const jest: Mod = {
  extensions: ['orta.vscode-jest'],
  applyIf: {
    packages: ['jest']
  }
};
