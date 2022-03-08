import { Mod } from '../mod.js';

export const elm: Mod = {
  forwardPorts: [8000],
  extensions: ['sbrink.elm'],
  globalPackages: ['elm'],
  applyIf: {
    files: ['**/elm.json']
  }
};
