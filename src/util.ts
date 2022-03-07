import process from 'process';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';
import { createInterface } from 'readline';

export async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function recursiveCopy(
  source: string,
  dest: string
): Promise<void> {
  try {
    await fs.mkdir(dest, { recursive: true });
  } catch {
    // ignore if it exists
  }

  const sourceStat = await fs.lstat(source);
  if (sourceStat.isDirectory()) {
    const entries = await fs.readdir(source, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        return entry.isDirectory()
          ? recursiveCopy(sourcePath, destPath)
          : fs.copyFile(sourcePath, destPath);
      })
    );
  } else {
    await fs.copyFile(source, path.join(dest, path.basename(source)));
  }
}

export function stripJsonComment(json: string) {
  return json.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '');
}

export async function readJson(path: string, stripComments = false) {
  let contents = await fs.readFile(path, 'utf8');
  if (stripComments) {
    contents = stripJsonComment(contents);
  }

  return JSON.parse(contents) as Record<string, any>;
}

export async function supportsBinary(name: string) {
  try {
    await promisify(exec)(`${name} --version`);
    return true;
  } catch {
    return false;
  }
}

export async function runCommand(command: string): Promise<string> {
  const result = await promisify(exec)(command);
  return result.stdout.toString();
}

export function runInteractiveCommandSync(command: string): void {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    // ignore
  }
}

export async function askForInput(question: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    const read = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
}

export async function getGitRootPath(folderPath: string) {
  try {
    const { stdout } = await promisify(exec)(`git rev-parse --show-toplevel`, {
      cwd: folderPath
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

export function unique<T>(array: T[]) {
  return [...new Set(array)];
}

export async function findUp(
  basePath: string,
  fileOrFolder: string
): Promise<string | undefined> {
  const find = async (components: string[]): Promise<string | undefined> => {
    if (components.length === 0) {
      return undefined;
    }

    const dir = path.join(...components);
    const packageFile = path.join(dir, fileOrFolder);
    return (await pathExists(packageFile))
      ? packageFile
      : find(components.slice(0, -1));
  };

  const components = basePath.split(/[/\\]/);
  if (components.length > 0 && components[0].length === 0) {
    // When path starts with a slash, the first path component is empty string
    components[0] = path.sep;
  }

  return find(components);
}
