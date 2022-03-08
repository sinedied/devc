import { Mod } from '../mod.js';

export const mocha: Mod = {
  extensions: ['hbenl.vscode-mocha-test-adapter'],
  applyIf: {
    packages: ['mocha']
  }
};
