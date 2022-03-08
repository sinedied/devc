import { Mod } from '../mod.js';

export const actionhero: Mod = {
  forwardPorts: [8080],
  postCreateCommand: 'redis-server --daemonize yes',
  containerSetup:
    '# Install Redis\n' +
    'RUN apt-get update && apt-get -y install redis-server && apt-get clean -y && rm -rf /var/lib/apt/lists/*',
  applyIf: {
    packages: ['actionhero']
  }
};
