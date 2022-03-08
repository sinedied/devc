import { Mod } from '../mod.js';

export const docker: Mod = {
  extensions: ['ms-azuretools.vscode-docker'],
  applyIf: {
    files: ['**/Dockerfile']
  }
};
