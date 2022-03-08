import { Mod } from '../mod.js';

export const fastify: Mod = {
  forwardPorts: [3000],
  extensions: ['fastify.fastify-snippets'],
  globalPackages: ['fastify-cli'],
  applyIf: {
    packages: ['fastify']
  }
};
