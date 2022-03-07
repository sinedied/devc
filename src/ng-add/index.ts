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
import { detectPackageManager, detectStack } from '../stack.js';

interface SchemaOptions {
  packageManager?: string;
  stack?: string;
  detect?: boolean;
}

const baseTemplatePath = '../../template';

export default function generate(options: SchemaOptions): Rule {
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

function applyModsRule(options: SchemaOptions): Rule {
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

    const packageManager = await getPackageManager(options, tree);
    let stack = options.stack?.split(',').map((s: string) => s.trim()) ?? [];

    if (stack.length === 0 || options.detect) {
      stack = [...stack, ...(await detectStack())];
    }

    const { data: newData, templates } = await applyMods(
      ['angular', packageManager, ...stack],
      data
    );
    tree.overwrite('.devcontainer/devcontainer.json', newData.json);
    tree.overwrite('.devcontainer/Dockerfile', newData.container);

    return copyExtraTemplates(options, templates);
  };
}

function copyExtraTemplates(options: SchemaOptions, templates: string[]): Rule {
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

export async function getPackageManager(
  options: SchemaOptions,
  tree: Tree
): Promise<string> {
  if (options.packageManager) {
    return options.packageManager;
  }

  const packageManager = getPackageManagerFromConfig(tree);
  if (packageManager) {
    return packageManager;
  }

  return detectPackageManager();
}

function getPackageManagerFromConfig(tree: Tree): string | undefined {
  const config = tree.read('angular.json');
  if (!config) {
    return undefined;
  }

  const angularJson = JSON.parse(config.toString()) as Record<string, any>;
  return (angularJson.cli?.packageManager as string) ?? undefined;
}
