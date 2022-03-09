import process from 'process';
import chalk from 'chalk';
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

  try {
    await openCodeWithDevContainer(options.path ?? '.', options.insiders);
  } catch (error: unknown) {
    process.exitCode = -1;
    console.error(chalk.red(`Error: ${(error as Error).message}`));
  }
}
