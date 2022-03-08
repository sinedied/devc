import { Mod } from '../mod.js';

export const aurelia: Mod = {
  forwardPorts: [8080],
  extensions: ['AureliaEffect.aurelia'],
  globalPackages: ['@aurelia/cli'],
  applyIf: {
    packages: ['aurelia-bootstrapper', 'aurelia-cli', 'aurelia-pal-nodejs']
  }
};
