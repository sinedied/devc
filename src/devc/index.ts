import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function devc(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const templateSource = apply(url('../../template'), [
      template({..._options, ...strings}),
    ]);
    const merged = mergeWith(templateSource, MergeStrategy.Overwrite)

    const rule = chain([
      merged
    ]);
  
    return rule(tree, _context);
  };
}
