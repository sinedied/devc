import { Mod } from '../mod.js';

export const svelte: Mod = {
  forwardPorts: [5000],
  extensions: ['svelte.svelte-vscode'],
  applyIf: {
    packages: ['svelte']
  }
};
