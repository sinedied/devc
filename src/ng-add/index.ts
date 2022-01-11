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
import { getPackageManager } from './util.js';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
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
