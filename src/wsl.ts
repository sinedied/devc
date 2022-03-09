import process from 'process';
import { runCommand } from './util.js';

export function isWsl() {
  return process.env.WSL_DISTRO_NAME !== undefined;
}

function hasWslPathPrefix(path: string) {
  return (
    path.startsWith('\\\\wsl$\\') || path.startsWith('\\\\wsl.localhost\\')
  );
}

async function convertWslPathToWindowsPath(path: string) {
  return runCommand(`wslpath -w ${path}`);
}

async function convertWindowsPathToWslPath(path: string) {
  return runCommand(`wslpath -u ${path}`);
}

export async function convertToWindowsPathIfNeeded(
  path: string,
  escapeBackslashes = false
) {
  if (isWsl() && !hasWslPathPrefix(path)) {
    path = await convertWslPathToWindowsPath(path);
    if (escapeBackslashes) {
      return path.replace(/\\/g, '\\\\');
    }
  }

  return path;
}

export async function convertToWslPathIfNeeded(path: string) {
  if (isWsl() && hasWslPathPrefix(path)) {
    return convertWindowsPathToWslPath(path);
  }

  return path;
}
