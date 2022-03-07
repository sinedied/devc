import process from 'process';
import createDebug from 'debug';
import { runInDevContainer } from '../docker.js';

const debug = createDebug('shell');

export interface ShellOptions {
  exec: string;
}

export async function shell(options?: Partial<ShellOptions>) {
  options = options ?? {};
  debug('Options: %o', options);

  await runInDevContainer(process.cwd(), options.exec);
}
