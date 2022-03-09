import process from 'process';
import chalk from 'chalk';
import createDebug from 'debug';
import { runInDevContainer } from '../docker.js';

const debug = createDebug('shell');

export interface ShellOptions {
  exec: string;
}

export async function shell(options?: Partial<ShellOptions>) {
  options = options ?? {};
  debug('Options: %o', options);

  try {
    await runInDevContainer(process.cwd(), options.exec);
  } catch (error: unknown) {
    process.exitCode = -1;
    console.error(chalk.red(`Error: ${(error as Error).message}`));
  }
}
