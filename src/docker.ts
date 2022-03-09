import createDebug from 'debug';
import {
  getDevContainerRootFolder,
  getDevContainerRunDetails
} from './container.js';
import { runCommand, runInteractiveCommandSync } from './util.js';
import { convertToWindowsPathIfNeeded } from './wsl.js';

const debug = createDebug('docker');

export interface DevContainerInfo {
  id: string;
  running: boolean;
  lastStarted: string;
  labels: Record<string, string>;
}

// Either pick the currently running container or the most recently started one
function pickBestDevContainerMatch(
  a: DevContainerInfo,
  b: DevContainerInfo
): number {
  if (a.running && !b.running) {
    return -1;
  }

  if (!a.running && b.running) {
    return 1;
  }

  return b.lastStarted.localeCompare(a.lastStarted);
}

export async function getDevContainer(
  projectPath: string
): Promise<DevContainerInfo | undefined> {
  const containerIds = await listDevContainersIds(projectPath);
  if (containerIds.length === 0) {
    return undefined;
  }

  const containerInfos = await Promise.all(
    containerIds.map(async (id) => inspectDevContainer(id))
  );

  containerInfos.sort(pickBestDevContainerMatch);
  return containerInfos[0];
}

async function listDevContainersIds(projectPath: string): Promise<string[]> {
  projectPath = await convertToWindowsPathIfNeeded(projectPath, true);
  const command = `docker ps -q -a --filter label=vsch.local.folder="${projectPath}"`;
  debug(`Running: ${command}`);

  const result = await runCommand(command);
  return result.split('\n').filter((id) => id);
}

async function inspectDevContainer(id: string): Promise<DevContainerInfo> {
  const command = `docker inspect --type container ${id}`;
  debug(`Running: ${command}`);

  const result = await runCommand(command);
  const info = JSON.parse(result)[0];

  return {
    id: info.Id,
    running: info.State.Running,
    lastStarted: info.State.StartedAt,
    labels: info.Config.Labels
  };
}

export async function startContainer(id: string) {
  const command = `docker start ${id}`;
  debug(`Running: ${command}`);
  await runCommand(command);
}

export async function stopContainer(id: string) {
  const command = `docker stop ${id}`;
  debug(`Running: ${command}`);
  await runCommand(command);
}

export async function runInDevContainer(basePath: string, command?: string) {
  const devcontainerPath = await getDevContainerRootFolder(basePath);
  if (!devcontainerPath) {
    throw new Error('.devcontainer folder not found');
  }

  debug(`Devcontainer root path: ${devcontainerPath}`);

  const devcontainer = await getDevContainer(devcontainerPath);
  if (!devcontainer) {
    throw new Error('No dev container found');
  }

  if (!devcontainer.running) {
    console.log('Dev container is not running, starting...');
    await startContainer(devcontainer.id);
  }

  let cmd = 'docker exec -it ';

  const runDetails = await getDevContainerRunDetails(basePath);
  if (runDetails.user) {
    cmd += `--user ${runDetails.user} `;
  }

  cmd += `--workdir ${runDetails.workspacePath} `;
  cmd += `${devcontainer.id} `;
  // TODO: allow to override the shell used
  // Example config:
  //   "settings": {
  //     // "terminal.integrated.shell.linux": "/bin/zsh"
  //     "terminal.integrated.defaultProfile.linux": "zsh",
  //     "terminal.integrated.profiles.linux": {
  //         "zsh": {
  //             "path": "/bin/zsh"
  //         },
  //     }
  cmd += command ? `bash -c "${command}"` : 'bash';

  debug(`Running: ${cmd}`);
  runInteractiveCommandSync(cmd);

  if (!devcontainer.running) {
    console.log('Stopping dev container...');
    await stopContainer(devcontainer.id);
  }
}
