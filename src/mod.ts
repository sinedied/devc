import * as mods from './mods/index.js';

export interface Mod {
  forwardPorts?: number[];
  extensions?: string[];
  postCreateCommand?: string;
  globalPackages?: string[];
  extraContainerSetup?: string;
}

export interface DevcontainerData {
  json: string;
  container: string;
}

export function applyMods(
  modNames: string[],
  data: DevcontainerData
): DevcontainerData {
  const modsToApply: Mod[] = modNames.map((name) => getMod(name));
  let forwardPorts: number[] = [];
  let extensions: string[] = [];
  let globalPackages: string[] = [];
  const postCreateCommand: string[] = [];
  const extraContainerSetup: string[] = [];

  for (const mod of modsToApply) {
    forwardPorts = [...forwardPorts, ...(mod.forwardPorts ?? [])];
    extensions = [...extensions, ...(mod.extensions ?? [])];
    globalPackages = [...globalPackages, ...(mod.globalPackages ?? [])];

    if (mod.postCreateCommand) {
      postCreateCommand.push(mod.postCreateCommand);
    }

    if (mod.extraContainerSetup) {
      extraContainerSetup.push(mod.extraContainerSetup);
    }
  }

  const newData = { ...data };
  if (forwardPorts.length > 0) {
    newData.json = newData.json.replace(
      `"forwardPorts": [],`,
      `"forwardPorts": [${forwardPorts.join(',')}],`
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

  if (extraContainerSetup.length > 0) {
    newData.container += `\n${extraContainerSetup.join('\n\n')}\n`;
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
