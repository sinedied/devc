import { Tree } from "@angular-devkit/schematics";

export function getPackageManager(tree: Tree): string {
  let packageManager = getPackageManagerFromConfig(tree);
  if (packageManager) {
    return packageManager;
  }

  const hasYarnLock = tree.exists('yarn.lock');
  const hasNpmLock = tree.exists('package-lock.json');

  if (hasYarnLock && !hasNpmLock) {
    packageManager = 'yarn';
  } else {
    packageManager = 'npm';
  }

  return packageManager;
}

function getPackageManagerFromConfig(tree: Tree): string | null {
  const config = tree.read("angular.json");
  if (!config) {
    return null;
  }
  const angularJson = JSON.parse(config.toString());
  return angularJson.cli?.
  packageManager;
}
