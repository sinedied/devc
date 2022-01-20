import createDebug from 'debug';
import { openCodeWithDevContainer } from '../container.js';

const debug = createDebug('open');

export interface OpenOptions {
  path: string;
  insiders: boolean;
  codespaces: boolean;
}

export async function code(options?: Partial<OpenOptions>) {
  options = options ?? {};
  debug('Options: %o', options);

  if (options.codespaces) {
    // TODO: use gh cli?
  }

  await openCodeWithDevContainer(options.path ?? '.', options.insiders);
}
