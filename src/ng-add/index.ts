import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { devcontainerFolder } from '../container.js';
import { applyMods } from '../mod.js';

const baseTemplatePath = '../../template';

export default function generate(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(
      url(`${baseTemplatePath}/${devcontainerFolder}`),
      [template({ ...options, ...strings }), move(devcontainerFolder)]
    );
    const generateTemplateRule = mergeWith(
      templateSource,
      MergeStrategy.Overwrite
    );

    return chain([generateTemplateRule, applyModsRule(options)])(tree, context);
  };
}

function applyModsRule(options: any): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
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

    // TODO: support stack and package manager options
    // TODO: run stack detection if no stack is specified

    const packageManager = getPackageManager(tree);
    const { data: newData, templates } = await applyMods(
      ['angular', packageManager, 'azureCli'],
      data
    );
    tree.overwrite('.devcontainer/devcontainer.json', newData.json);
    tree.overwrite('.devcontainer/Dockerfile', newData.container);

    return copyExtraTemplates(options, templates);
  };
}

function copyExtraTemplates(options: any, templates: string[]): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const templatesRules = templates.map((templatePath) => {
      const templateSource = apply(url(`${baseTemplatePath}/${templatePath}`), [
        template({ ...options, ...strings }),
        move(`${devcontainerFolder}`)
      ]);

      return mergeWith(templateSource, MergeStrategy.Overwrite);
    });

    return chain(templatesRules);
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
