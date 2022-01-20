import { Mod } from '../../mod.js';

export const azureStaticWebApps: Mod = {
  forwardPorts: [4280],
  extensions: ['ms-azuretools.vscode-azurestaticwebapps'],
  globalPackages: ['@azure/static-web-apps-cli'],
  applyIf: {
    packages: ['@azure/static-web-apps-cli'],
    files: [
      '**/staticwebapp.config.json',
      '.github/workflows/azure-static-web-apps*.yml'
    ]
  }
};
