import process from 'process';
import path from 'path';
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
import {
  copyDevContainerTemplate,
  hasDevContainer,
  devcontainerFolder
} from '../container.js';
import { askForInput, recursiveCopy } from '../util.js';

const debug = createDebug('init');
const baseTemplatePath = path.join(__dirname, '../../template/');

export interface InitOptions {
  stack: string[];
  packageManager: string;
  detect: boolean;
  list: boolean;
}

export async function init(options?: Partial<InitOptions>) {
  options = options ?? {};
  debug('Options: %o', options);

  if (options.list) {
    const stacks = [...supportedStacks].sort();
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

    if (stack.length === 0 || options.detect) {
      stack = [...stack, ...(await detectStack())];
      console.info(`Detected stack: ${chalk.cyan(stack.join(', '))}`);
    } else {
      console.info(`Using stack: ${chalk.cyan(stack.join(', '))}`);
    }

    await copyDevContainerTemplate();
    debug('Copied .devcontainer base template.');

    await applyAllMods([packageManager, ...stack]);
    console.info(chalk.green(`Created .devcontainer configuration.`));
  } catch (error: unknown) {
    process.exitCode = -1;
    console.error(chalk.red(`Error: ${(error as Error).message}`));
  }
}

async function applyAllMods(modNames: string[]) {
  debug('Applying mods: %o', modNames);

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

  const { data: newData, templates } = await applyMods(modNames, data);
  await fs.writeFile('.devcontainer/devcontainer.json', newData.json);
  await fs.writeFile('.devcontainer/Dockerfile', newData.container);

  if (templates.length > 0) {
    await Promise.all(
      templates.map(async (template) => copyTemplate(template))
    );
  }

  debug('Mods applied.');
}

async function copyTemplate(template: string) {
  const templatePath = path.join(baseTemplatePath, template);
  const targetPath = path.join(
    devcontainerFolder,
    path.dirname(template).split(path.sep).slice(1).join(path.sep)
  );
  debug('Copying template %s to %s', templatePath, targetPath);

  try {
    await recursiveCopy(templatePath, targetPath);
  } catch (error: unknown) {
    throw new Error(
      `Failed to copy template ${template}: ${(error as Error).message}`
    );
  }
}
