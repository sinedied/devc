import { Tree } from '@angular-devkit/schematics';

export function getPackageManager(tree: Tree): string {
  let packageManager = getPackageManagerFromConfig(tree);
  if (packageManager) {
    return packageManager;
  }

  const hasYarnLock = tree.exists('yarn.lock');
  const hasNpmLock = tree.exists('package-lock.json');

  packageManager = hasYarnLock && !hasNpmLock ? 'yarn' : 'npm';

  return packageManager;
}

function getPackageManagerFromConfig(tree: Tree): string | null {
  const config = tree.read('angular.json');
  if (!config) {
    return null;
  }

  const angularJson = JSON.parse(config.toString()) as Record<string, any>;
  return (angularJson.cli?.packageManager as string) ?? null;
}
