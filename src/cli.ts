import path from 'path';
import minimist from 'minimist';
import debug from 'debug';
import chalk from 'chalk';
import { init } from './commands/index.js';
import { readJson } from './util.js';

const help = chalk`Usage: devc [command] [options]

Commands:
  {cyan init}                Initialize dev container config (default command)
    -s, --stack <name1, name2, ...>
                      Set the stack to be used (default: autodetect)
    -p, --packageManager <npm|yarn|pnpm>
                      Set package manager (default: autodetect)
    --list            List available tech stacks

  {cyan code}                Open current folder in a VS Code dev container
    --codespaces      Open project in GitHub Codespaces (experimental) 

  {cyan shell} [command]     Open a shell in dev container
    -e, --exec <cmd>  Execute command in container shell

General options:
    -v, --version     Show version
    --help            Show this help
`;

export async function run(args: string[]) {
  const options = minimist(args, {
    string: ['stack', 'packageManager', 'exec'],
    boolean: ['codespaces', 'list', 'version', 'help', 'verbose'],
    alias: {
      s: 'stack',
      p: 'packageManager',
      e: 'exec',
      v: 'version'
    }
  });

  if (options.version) {
    const pkg = await readJson(path.join(__dirname, '../package.json'));
    console.info(pkg.version);
    return;
  }

  if (options.help) {
    console.info(help);
    return;
  }

  if (options.verbose) {
    debug.enable('*');
  }

  const [command] = options._;
  switch (command) {
    case undefined:
    case 'init':
      return init({
        stack: options.stack,
        packageManager: options.packageManager,
        list: options.list
      });
    case 'code':
      return; // TODO
    case 'shell':
      return; // TODO
    default:
      console.info(help);
  }
}
