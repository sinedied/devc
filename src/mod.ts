import createDebug from 'debug';
import * as mods from './mods/index.js';
import { unique } from './util.js';

const debug = createDebug('mod');

export interface Mod {
  // The list of dev container ports to forward to the host
  forwardPorts?: number[];
  // The list of VS Code extensions ids to be installed in the container
  // You can get the extension id by right-clicking on the extension in VS Code
  extensions?: string[];
  // A command to run in the container after it's created the first time
  // You can run multiple commands by adding && between them
  postCreateCommand?: string;
  // The list of global NPM packages to install in the container
  globalPackages?: string[];
  // The list of templates folder to copy to the project
  templates?: string[];
  // Extra container commands that will be added to the Dockerfile
  containerSetup?: string;
  // The list of mod names to include
  includeMods?: string[];
  // The conditions in which this mod should apply
  // If any of these conditions is met, the mod will be applied
  applyIf?: ApplyConditions;
}

export interface ApplyConditions {
  // NPM package names to look for
  // If any of them is present, the mod will be applied
  packages?: string[];
  // Files glob patterns to look for
  // If any of them is present, the mod will be applied
  files?: string[];
  // You can run custom code here, and return true if the mod should be applied
  // Be mindful of the performance of this function, as it will grow the total
  // amount of time needed to detect all mods
  condition?: () => Promise<boolean> | boolean;
}

export interface DevcontainerData {
  json: string;
  container: string;
}

export interface ModdedDevContainer {
  data: DevcontainerData;
  templates: string[];
}

export async function applyMods(
  modNames: string[],
  data: DevcontainerData
): Promise<ModdedDevContainer> {
  const modsToApply: Mod[] = modNames
    .map((name) => getMod(name))
    .flatMap((mod) => getModIncludes(mod));

  let forwardPorts: number[] = [];
  let extensions: string[] = [];
  let globalPackages: string[] = [];
  let postCreateCommand: string[] = [];
  let templates: string[] = [];
  let containerSetup: string[] = [];

  for (const mod of modsToApply) {
    forwardPorts = [...forwardPorts, ...(mod.forwardPorts ?? [])];
    extensions = [...extensions, ...(mod.extensions ?? [])];
    globalPackages = [...globalPackages, ...(mod.globalPackages ?? [])];
    templates = [...templates, ...(mod.templates ?? [])];

    if (mod.postCreateCommand) {
      postCreateCommand.push(mod.postCreateCommand);
    }

    if (mod.containerSetup) {
      containerSetup.push(mod.containerSetup);
    }
  }

  // Filter unique values for all params
  forwardPorts = unique(forwardPorts);
  extensions = unique(extensions);
  globalPackages = unique(globalPackages);
  templates = unique(templates);
  postCreateCommand = unique(postCreateCommand);
  containerSetup = unique(containerSetup);

  const newData = { ...data };
  if (forwardPorts.length > 0) {
    newData.json = newData.json.replace(
      `"forwardPorts": [],`,
      `"forwardPorts": [${forwardPorts.join(', ')}],`
    );
  }

  if (extensions.length > 0) {
    newData.json = newData.json.replace(
      `"extensions": []`,
      `"extensions": [${extensions.map((ex) => `"${ex}"`).join(', ')}]`
    );
  }

  if (postCreateCommand.length > 0) {
    newData.json = newData.json.replace(
      `// "postCreateCommand": "npm install",`,
      `"postCreateCommand": "${postCreateCommand.join(' && ')}",`
    );
  }

  if (globalPackages.length > 0) {
    newData.container = newData.container.replace(
      `# RUN su node -c "npm install -g <your-package-list-here>"`,
      `RUN su node -c "npm install -g ${globalPackages.join(' ')}"`
    );
  }

  if (containerSetup.length > 0) {
    newData.container += `\n${containerSetup.join('\n\n')}\n`;
  }

  return {
    data: newData,
    templates
  };
}

function getMod(name: string): Mod {
  const indexedMods = mods as Record<string, Mod>;
  const mod = indexedMods[name];
  if (!mod) {
    throw new Error(`Mod ${name} not found`);
  }

  return mod;
}

function getModIncludes(mod: Mod): Mod | Mod[] {
  if (!mod.includeMods || mod.includeMods.length === 0) {
    return mod;
  }

  debug('Additional included mods: %o', mod.includeMods);
  return [
    mod,
    ...mod.includeMods
      .map((name) => getMod(name))
      .flatMap((m) => getModIncludes(m))
  ];
}
