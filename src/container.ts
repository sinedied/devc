import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import createDebug from 'debug';
import {
  findUp,
  getGitRootPath,
  pathExists,
  readJson,
  recursiveCopy,
  supportsBinary
} from './util.js';
import {
  convertToWindowsPathIfNeeded,
  convertToWslPathIfNeeded,
  isWsl
} from './wsl.js';

export interface DevContainerRunDetails {
  workspacePath: string;
  user?: string;
}

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
    let message = `${codeBin} is not installed.\n`;
    message += isWsl()
      ? 'Run the command "code" in a terminal to install it first.'
      : `In VS Code, run the command "Shell Command: Install 'code' command in PATH".`;

    throw new Error(message);
  }

  const workspace = await getDevContainerWorkspace(projectPath);
  const uri = await createDevContainerLaunchUri(projectPath, workspace);
  await promisify(exec)(`${codeBin} --folder-uri="${uri}"`);
}

export async function getDevContainerRootFolder(basePath: string) {
  basePath = path.resolve(basePath);
  const devContainerPath = await findUp(basePath, devcontainerFolder);
  return devContainerPath ? path.dirname(devContainerPath) : undefined;
}

export async function getDevContainerRunDetails(
  projectPath: string
): Promise<DevContainerRunDetails> {
  try {
    projectPath = await convertToWslPathIfNeeded(projectPath);

    const devContainerPath = await getDevContainerRootFolder(projectPath);
    if (!devContainerPath) {
      throw new Error('.devcontainer folder not found');
    }

    // Look in devcontainer.json for a custom workspace path
    const configPath = path.join(devContainerPath, devcontainerConfigFile);
    const config = await readJson(configPath, true);
    let { workspacePath } = config;
    debug('Workspace in dev container config: %s', workspacePath);
    const user = config.remoteUser;
    debug('User in dev container config: %s', user);

    if (!workspacePath) {
      workspacePath = await getDefaultDevContainerWorkspace(devContainerPath);
      debug('Using default workspace: %s', workspacePath);
    }

    return {
      workspacePath,
      user
    };
  } catch (error: unknown) {
    throw new Error(
      `Could not read ${path.basename(devcontainerConfigFile)}: ${
        (error as Error).message
      }`
    );
  }
}

export async function getDevContainerWorkspace(projectPath: string) {
  const { workspacePath } = await getDevContainerRunDetails(projectPath);
  return workspacePath;
}

export async function getDefaultDevContainerWorkspace(projectPath: string) {
  let rootPath = await getGitRootPath(projectPath);
  if (!rootPath) {
    rootPath = projectPath;
  }

  const rootParent = path.join(rootPath, '..');
  return `/workspaces/${path.relative(rootParent, projectPath)}`;
}

async function createDevContainerLaunchUri(
  projectPath: string,
  workspace: string
) {
  const absolutePath = path.resolve(projectPath);
  const launchPath = await convertToWindowsPathIfNeeded(absolutePath);
  debug('Project path: %s', launchPath);

  return `${remoteUri}${toHex(launchPath)}${workspace}`;
}

function toHex(string: string) {
  return Buffer.from(string).toString('hex');
}
