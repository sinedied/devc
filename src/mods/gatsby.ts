import { Mod } from '../mod.js';

export const gatsby: Mod = {
  forwardPorts: [8000],
  applyIf: {
    packages: ['gatsby'],
    files: ['**/gatsby-config.js']
  }
};
