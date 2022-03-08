import { Mod } from '../mod.js';

export const parcel: Mod = {
  forwardPorts: [1234],
  applyIf: {
    packages: ['parcel']
  }
};
