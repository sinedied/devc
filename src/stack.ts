import * as mods from './mods/index.js';
import { pathExists, readJson } from './util.js';

export const supportedPackageManagers = new Set(['npm', 'yarn', 'pnpm']);
export const stacks = availableStacks();
export const supportedStacks = new Set(stacks.map(([name]) => name));

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

  let matchedStacks = await matchStacks(packageInfo);
  if (matchedStacks.length === 0) {
    console.info(
      `Could not determine used stack (no known stack found).\nFalling back to standard Node.js setup, use --stack=<stack> to force specific stack.`
    );
    matchedStacks = ['node'];
  }

  return matchedStacks;
}

async function matchStacks(packageJson: any) {
  const matchedStacks: string[] = [];
  await Promise.all(
    stacks.map(async ([name, mod]) => {
      if (
        mod.applyIf &&
        ((mod.applyIf.packages &&
          hasPackage(packageJson, mod.applyIf.packages)) ||
          (mod.applyIf.files && (await hasOneOfFiles(mod.applyIf.files))) ||
          (mod.applyIf.condition && (await mod.applyIf.condition())))
      ) {
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

async function hasOneOfFiles(files: string[]) {
  return files.some(async (file) => pathExists(file));
}
