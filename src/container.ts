import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import createDebug from 'debug';
import {
  getGitRootPath,
  pathExists,
  readJson,
  recursiveCopy,
  supportsBinary
} from './util.js';

const debug = createDebug('container');
const devcontainerTemplate = path.join(__dirname, '../template/.devcontainer');
const devcontainerConfigFile = `.devcontainer/devcontainer.json`;
const remoteUri = `vscode-remote://dev-container+`;
export const devcontainerFolder = '.devcontainer';

export async function hasDevContainer() {
  return pathExists(devcontainerFolder);
}

export async function copyDevContainerTemplate() {
  await recursiveCopy(devcontainerTemplate, devcontainerFolder);
}

export async function openCodeWithDevContainer(
  projectPath: string,
  insiders?: boolean
) {
  const codeBin = insiders ? 'code-insiders' : 'code';

  if (!(await supportsBinary(codeBin))) {
    throw new Error(
      `${codeBin} is not installed.\nIn VS Code, run the command "Shell Command: Install 'code' command in PATH."`
    );
  }

  const workspace = await getDevContainerWorkspace(projectPath);
  const uri = await createDevContainerLaunchUri(projectPath, workspace);
  await promisify(exec)(`${codeBin} --folder-uri=${uri}`);
}

export async function getDevContainerWorkspace(projectPath: string) {
  // TODO: check projectPath compatibility with WSL
  let workspacePath: string;

  try {
    // Look in devcontainer.json for a custom workspace path
    const configPath = path.join(projectPath, devcontainerConfigFile);
    const config = await readJson(configPath, true);
    workspacePath = config.workspacePath;
    debug('Workspace in devcontainer config: %s', workspacePath);
  } catch (error: unknown) {
    throw new Error(
      `Could not read ${path.basename(devcontainerConfigFile)}: ${
        (error as Error).message
      }`
    );
  }

  if (!workspacePath) {
    workspacePath = await getDefaultDevContainerWorkspace(projectPath);
    debug('Using default workspace: %s', workspacePath);
  }

  return workspacePath;
}

export async function getDefaultDevContainerWorkspace(projectPath: string) {
  let rootPath = await getGitRootPath(projectPath);
  if (!rootPath) {
    rootPath = projectPath;
  }

  const rootParent = path.join(rootPath, '..');
  return `/workspaces/${path.relative(rootParent, rootPath)}`;
}

async function createDevContainerLaunchUri(
  projectPath: string,
  workspace: string
) {
  const absolutePath = path.resolve(projectPath);
  debug('Project path: %s', absolutePath);

  return `${remoteUri}${toHex(absolutePath)}${workspace}`;
}

function toHex(string: string) {
  return Buffer.from(string).toString('hex');
}
