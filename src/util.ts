import process from 'process';
import { exec } from 'child_process';
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
    await fs.mkdir(dest);
  } catch {
    // ignore if it exists
  }

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
