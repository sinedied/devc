import { Mod } from '../../mod.js';

export const azureFunctions: Mod = {
  forwardPorts: [7071],
  extensions: ['ms-azuretools.vscode-azurefunctions'],
  globalPackages: ['azure-functions-core-tools'],
  applyIf: {
    files: ['**/.funcignore', '**/host.json']
  }
};
