import { Mod } from '../mod.js';

export const marko: Mod = {
  forwardPorts: [3000],
  extensions: ['Marko-JS.marko-vscode'],
  applyIf: {
    packages: ['@marko/serve']
  }
};
