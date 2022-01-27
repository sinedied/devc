import createDebug from 'debug';
import * as mods from './mods/index.js';
import { unique } from './util.js';

const debug = createDebug('mod');

export interface Mod {
  forwardPorts?: number[];
  extensions?: string[];
  postCreateCommand?: string;
  globalPackages?: string[];
  containerSetup?: string;
  includeMods?: string[];
  applyIf?: ApplyConditions;
}

export interface ApplyConditions {
  packages?: string[];
  files?: string[];
  condition?: () => Promise<boolean> | boolean;
}

export interface DevcontainerData {
  json: string;
  container: string;
}

export function applyMods(
  modNames: string[],
  data: DevcontainerData
): DevcontainerData {
  const modsToApply: Mod[] = modNames
    .map((name) => getMod(name))
    .flatMap((mod) => getModIncludes(mod));

  let forwardPorts: number[] = [];
  let extensions: string[] = [];
  let globalPackages: string[] = [];
  let postCreateCommand: string[] = [];
  let containerSetup: string[] = [];

  for (const mod of modsToApply) {
    forwardPorts = [...forwardPorts, ...(mod.forwardPorts ?? [])];
    extensions = [...extensions, ...(mod.extensions ?? [])];
    globalPackages = [...globalPackages, ...(mod.globalPackages ?? [])];

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
      `"extensions": [],`,
      `"extensions": [${extensions.map((ex) => `"${ex}"`).join(', ')}],`
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

  return newData;
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
