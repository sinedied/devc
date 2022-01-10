import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";
import { applyMods } from "../mods/mod";
import { Schema } from "./schema";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function generate(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    console.log(options);
    const packageManager = options.packageManager || "npm";

    const templateSource = apply(url("../../template"), [
      template({ ...options, ...strings }),
    ]);
    const generateTemplateRule = mergeWith(
      templateSource,
      MergeStrategy.Overwrite
    );

    return chain([generateTemplateRule, applyModsRule(options)])(tree, context);
  };
}

function applyModsRule(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const json = tree.read(".devcontainer/devcontainer.json");
    if (!json) {
      throw new Error("Missing devcontainer.json");
    }
    const container = tree.read(".devcontainer/Dockerfile");
    if (!container) {
      throw new Error("Missing Dockerfile");
    }
    const data = {
      json: json.toString(),
      container: container.toString(),
    };
    const packageManager = options.packageManager || "npm";
    // TODO: use correct package manager

    const newData = applyMods(["angular", "npm"], data);
    tree.overwrite(".devcontainer/devcontainer.json", newData.json);
    tree.overwrite(".devcontainer/Dockerfile", newData.container);
  };
}
