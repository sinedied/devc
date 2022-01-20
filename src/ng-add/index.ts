import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { applyMods } from '../mod.js';

export default function generate(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../template'), [
      template({ ...options, ...strings })
    ]);
    const generateTemplateRule = mergeWith(
      templateSource,
      MergeStrategy.Overwrite
    );

    return chain([generateTemplateRule, applyModsRule(options)])(tree, context);
  };
}

function applyModsRule(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const json = tree.read('.devcontainer/devcontainer.json');
    if (!json) {
      throw new Error('Missing devcontainer.json');
    }

    const container = tree.read('.devcontainer/Dockerfile');
    if (!container) {
      throw new Error('Missing Dockerfile');
    }

    const data = {
      json: json.toString(),
      container: container.toString()
    };
    const packageManager = getPackageManager(tree);
    const newData = applyMods(['angular', packageManager], data);
    tree.overwrite('.devcontainer/devcontainer.json', newData.json);
    tree.overwrite('.devcontainer/Dockerfile', newData.container);
  };
}

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
