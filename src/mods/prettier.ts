import { Mod } from '../mod.js';

export const prettier: Mod = {
  extensions: ['esbenp.prettier-vscode'],
  applyIf: {
    packages: ['prettier']
  }
};
