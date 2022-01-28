import path from 'path';
import chalk from 'chalk';
import createDebug from 'debug';
import glob from 'fast-glob';
import * as mods from './mods/index.js';
import { pathExists, readJson, unique } from './util.js';

const debug = createDebug('stack');
export const supportedPackageManagers = new Set(['npm', 'yarn', 'pnpm']);
export const stacks = availableStacks();
export const supportedStacks = new Set(stacks.map(([name]) => name));

interface PackageInfo {
  file: string;
  packageJson: Record<string, any>;
}

function availableStacks() {
  return Object.entries(mods).filter(
    ([name, _mod]) => !supportedPackageManagers.has(name)
  );
}

export function checkValidStack(stack: string[]) {
  if (stack.some((name) => !supportedStacks.has(name))) {
    throw new Error(`Unsupported stack: ${stack.join(', ')}`);
  }
}

export function checkValidPackageManager(packageManager: string | null) {
  if (packageManager && !supportedPackageManagers.has(packageManager)) {
    throw new Error(
      `Package manager "${packageManager}" is not supported.\nSupported package managers: ${[
        ...supportedPackageManagers
      ].join(',')}`
    );
  }
}

export async function detectPackageManager(): Promise<string> {
  const hasYarnLock = await pathExists('yarn.lock');
  const hasNpmLock = await pathExists('package-lock.json');
  const hasPnpmLock = await pathExists('pnpm-lock.yaml');

  // TODO: search in subfolders?

  if (hasPnpmLock && !hasNpmLock && !hasYarnLock) {
    return 'pnpm';
  }

  if (hasYarnLock && !hasNpmLock) {
    return 'yarn';
  }

  return 'npm';
}

export async function detectStack() {
  let packageInfos: PackageInfo[] = [];

  const packageJsonFiles = await glob('**/package.json', {
    dot: true,
    ignore: ['**/node_modules/**']
  });

  if (packageJsonFiles.length > 0) {
    try {
      packageInfos = await Promise.all(
        packageJsonFiles.map(async (file) => ({
          file,
          packageJson: await readJson(file)
        }))
      );
    } catch (error: unknown) {
      throw new Error(
        `Could not read package.json: ${(error as Error).message}`
      );
    }
  } else {
    console.info(
      chalk.yellow(
        `Could not find any package.json, stack detection may be incorrect.\nPlease use --stack=<stack> to specify the stack.`
      )
    );
  }

  const matchedStacksList = await Promise.all(
    packageInfos.map(async (packageInfo) => matchStacks(packageInfo))
  );
  let matchedStacks = matchedStacksList.flat();
  if (matchedStacks.length === 0) {
    console.info(
      chalk.yellow(
        `Could not determine used stack (no known stack found).\nFalling back to standard Node.js setup, use --stack=<stack> to force specific stack.`
      )
    );
    matchedStacks = [];
  }

  return unique(matchedStacks);
}

async function matchStacks(packageInfo: PackageInfo) {
  const { file, packageJson } = packageInfo;
  const root = path.dirname(file);
  const matchedStacks: string[] = [];
  await Promise.all(
    stacks.map(async ([name, mod]) => {
      debug('Checking if should apply: %s', name);
      const matchAnyPackage =
        mod.applyIf?.packages &&
        packageJson &&
        hasPackage(packageJson, mod.applyIf.packages);
      const matchAnyFile =
        mod.applyIf?.files && (await hasOneOfFiles(root, mod.applyIf.files));
      const matchCondition =
        mod.applyIf?.condition && (await mod.applyIf.condition());

      if (matchAnyPackage || matchAnyFile || matchCondition) {
        matchedStacks.push(name);
      }
    })
  );
  return matchedStacks;
}

function hasPackage(packageJson: any, packageList: string[]) {
  return packageList.some(
    (packageName) =>
      packageJson.dependencies[packageName] ||
      packageJson.devDependencies[packageName]
  );
}

async function hasOneOfFiles(root: string, files: string[]) {
  debug('Searching for files: %O', files);
  const matches = await glob(files, {
    dot: true,
    ignore: ['**/node_modules/**'],
    cwd: root || undefined
  });
  debug('Found files: %O', matches);
  return matches.length > 0;
}
