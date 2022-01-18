import * as mods from './mods/index.js';
import { pathExists, readJson } from './util.js';

// TODO: move detection to mods?
const stackPackages = [
  { name: 'angular', packages: ['@angular/core'] },
  { name: 'react', packages: ['react'] },
  { name: 'vue', packages: ['vue'] },
  { name: 'svelte', packages: ['svelte'] }
];
const supportedPackageManagers = new Set(['npm', 'yarn', 'pnpm']);
const supportedStacks = new Set(availableStacks());

export function availableStacks(): string[] {
  return Object.keys(mods).filter(
    (name) => !supportedPackageManagers.has(name)
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

  if (hasPnpmLock && !hasNpmLock && !hasYarnLock) {
    return 'pnpm';
  }

  if (hasYarnLock && !hasNpmLock) {
    return 'yarn';
  }

  return 'npm';
}

export async function detectStack() {
  if (!(await pathExists('package.json'))) {
    throw new Error(
      `Could not find package.json. Please use --stack=<stack> to specify the stack.`
    );
  }

  let packageInfo: Record<string, any> | null = null;
  try {
    packageInfo = await readJson('package.json');
  } catch (error: unknown) {
    throw new Error(`Could not read package.json: ${(error as Error).message}`);
  }

  let matchedStacks = matchStacks(packageInfo);
  if (matchedStacks.length === 0) {
    console.info(
      `Could not determine used stack (no known stack found).\nFalling back to standard Node.js setup, use --stack=<stack> to force specific stack.`
    );
    matchedStacks = ['node'];
  }

  return matchedStacks;
}

function matchStacks(packageJson: any): string[] {
  return stackPackages
    .filter((stack) => hasPackage(packageJson, stack.packages))
    .map((stack) => stack.name);
}

function hasPackage(packageJson: any, packageList: string[]) {
  return packageList.some(
    (packageName) =>
      packageJson.dependencies[packageName] ||
      packageJson.devDependencies[packageName]
  );
}
