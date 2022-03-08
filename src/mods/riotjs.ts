import { Mod } from '../mod.js';

export const riotjs: Mod = {
  forwardPorts: [3000],
  extensions: ['nesterow.riot-vsc'],
  applyIf: {
    packages: ['riot']
  }
};
