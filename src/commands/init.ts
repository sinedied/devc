import process from 'process';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import createDebug from 'debug';
import { applyMods } from '../mod.js';
import {
  checkValidPackageManager,
  checkValidStack,
  detectPackageManager,
  detectStack,
  supportedStacks
} from '../stack.js';
import { copyDevContainerTemplate, hasDevContainer } from '../container.js';
import { askForInput } from '../util.js';

const debug = createDebug('init');

export interface InitOptions {
  stack: string[];
  packageManager: string;
  list: boolean;
}

export async function init(options?: Partial<InitOptions>) {
  options = options ?? {};
  debug('Options: %o', options);

  if (options.list) {
    const stacks = [...supportedStacks];
    console.info(`Available tech stacks:\n- ${stacks.join('\n- ')}`);
    return;
  }

  try {
    let stack = options.stack ?? [];
    let packageManager = options.packageManager ?? null;

    checkValidPackageManager(packageManager);
    checkValidStack(stack);

    if (await hasDevContainer()) {
      const answer = await askForInput(
        '.devcontainer already exists in this folder, overwrite? [Y/n] '
      );
      if (answer !== '' && answer.toLowerCase() !== 'y') {
        return;
      }
    }

    if (!packageManager) {
      packageManager = await detectPackageManager();
      console.info(`Detected package manager: ${chalk.cyan(packageManager)}`);
    }

    if (stack.length === 0) {
      stack = await detectStack();
      console.info(`Detected stack: ${chalk.cyan(stack.join(', '))}`);
    }

    await copyTemplate();
    await applyTemplateMods([packageManager, ...stack]);
    console.info(chalk.green(`Created .devcontainer configuration.`));
  } catch (error: unknown) {
    process.exitCode = -1;
    console.error(chalk.red(`Error: ${(error as Error).message}`));
  }
}

async function copyTemplate() {
  await copyDevContainerTemplate();
  debug('Copied .devcontainer base template.');
}

async function applyTemplateMods(modNames: string[]) {
  debug('Applying mods: %s', modNames.join(', '));

  const json = await fs.readFile('.devcontainer/devcontainer.json', 'utf8');
  if (!json) {
    throw new Error('Missing devcontainer.json');
  }

  const container = await fs.readFile('.devcontainer/Dockerfile', 'utf8');
  if (!container) {
    throw new Error('Missing Dockerfile');
  }

  const data = {
    json: json.toString(),
    container: container.toString()
  };

  const newData = applyMods(modNames, data);
  await fs.writeFile('.devcontainer/devcontainer.json', newData.json);
  await fs.writeFile('.devcontainer/Dockerfile', newData.container);
  debug('Mods applied.');
}
