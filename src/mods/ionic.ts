import { Mod } from '../mod.js';

export const ionic: Mod = {
  forwardPorts: [8100],
  extensions: ['ionic.ionic'],
  globalPackages: ['@ionic/cli'],
  applyIf: {
    packages: ['@ionic/react', '@ionic/angular', '@ionic/vue']
  }
};
