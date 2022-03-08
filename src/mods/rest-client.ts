import { Mod } from '../mod.js';

export const restClient: Mod = {
  extensions: ['humao.rest-client'],
  applyIf: {
    files: ['**/*.http', '**/*.rest']
  }
};
