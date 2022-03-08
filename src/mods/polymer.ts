import { Mod } from '../mod.js';

export const polymer: Mod = {
  forwardPorts: [8081],
  extensions: ['polymer.polymer-ide'],
  globalPackages: ['@polymer/cli'],
  applyIf: {
    packages: ['@polymer/polymer'],
    files: ['**/polymer.json']
  }
};
