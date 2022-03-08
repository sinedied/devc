import { Mod } from '../mod.js';

export const stylelint: Mod = {
  extensions: ['stylelint.vscode-stylelint'],
  applyIf: {
    packages: ['stylelint']
  }
};
