import { Mod } from '../mod.js';

export const ember: Mod = {
  forwardPorts: [4200],
  extensions: ['EmberTooling.vscode-ember'],
  globalPackages: ['ember-cli'],
  applyIf: {
    packages: ['ember-source', 'ember-cli']
  }
};
