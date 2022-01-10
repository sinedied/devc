import * as mods from "./index";

export default interface Mod {
  forwardPorts?: number[];
  extensions?: string[];
  postCreateCommand?: string;
  packages?: string[];
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
  const modsToApply: Mod[] = modNames.map(getMod);
  let forwardPorts: number[] = [];
  let extensions: string[] = [];
  let postCreateCommand: string[] = [];
  let packages: string[] = [];
  let extraContainerSetup: string[] = [];

  for (const mod of modsToApply) {
    forwardPorts = forwardPorts.concat(mod.forwardPorts || []);
    extensions = extensions.concat(mod.extensions || []);
    postCreateCommand = postCreateCommand.concat(mod.postCreateCommand || []);
    packages = packages.concat(mod.packages || []);
    extraContainerSetup = extraContainerSetup.concat(
      mod.extraContainerSetup || []
    );
  }

  console.log({
    forwardPorts,
    extensions,
    postCreateCommand,
    packages,
    extraContainerSetup,
  });

  const newData = { ...data };
  if (forwardPorts.length > 0) {
    newData.json = newData.json.replace(
      `"forwardPorts": [],`,
      `"forwardPorts": [${forwardPorts.join(",")}],`
    );
  }
  if (extensions.length > 0) {
    newData.json = newData.json.replace(
      `"extensions": [],`,
      `"extensions": [${extensions.map((e) => `"${e}"`).join(", ")}],`
    );
  }
  if (postCreateCommand.length > 0) {
    newData.json = newData.json.replace(
      `// "postCreateCommand": "npm install",`,
      `"postCreateCommand": "${postCreateCommand.join(" && ")}",`
    );
  }
  if (packages.length > 0) {
    newData.container = newData.container.replace(
      `# RUN su node -c "npm install -g <your-package-list-here>"`,
      `RUN su node -c "npm install -g ${packages.join(" ")}"`
    );
  }
  if (extraContainerSetup.length > 0) {
    newData.container += `\n${extraContainerSetup.join("\n\n")}\n`;
  }

  return newData;
}

function getMod(name: string): Mod {
  const indexedMods = mods as { [index: string]: { default: Mod } };
  const mod = indexedMods[name];
  if (!mod) {
    throw new Error(`Mod ${name} not found`);
  }
  return mod.default;
}
