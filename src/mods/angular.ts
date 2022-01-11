import { Mod } from '../mod.js';

export const angular: Mod = {
  forwardPorts: [4200],
  extensions: ['angular.ng-template'],
  globalPackages: ['@angular/cli']
};
