import path from 'path';
import { pathExists, recursiveCopy } from './util.js';

const devcontainerTemplate = path.join(__dirname, '../template/.devcontainer');
const devcontainerFolder = '.devcontainer';

export async function hasDevContainer() {
  return pathExists(devcontainerFolder);
}

export async function copyDevContainerTemplate() {
  await recursiveCopy(devcontainerTemplate, devcontainerFolder);
}
