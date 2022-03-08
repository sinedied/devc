import { Mod } from '../mod.js';

export const jasmine: Mod = {
  extensions: ['hbenl.vscode-jasmine-test-adapter'],
  applyIf: {
    packages: ['jasmine']
  }
};
