import { Mod } from '../../mod.js';

export const azureCli: Mod = {
  containerSetup:
    '# Install Azure CLI\n' +
    'RUN bash <(curl -sfL "https://raw.githubusercontent.com/microsoft/vscode-dev-containers/main/script-library/azcli-debian.sh") && apt-get clean -y && rm -rf /var/lib/apt/lists/*'
};
