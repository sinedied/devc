import path from 'path';
import minimist from 'minimist';
import debug from 'debug';
import chalk from 'chalk';
import { init, code, shell } from './commands/index.js';
import { readJson } from './util.js';

const help = chalk`Usage: devc [command] [options]

Commands:
  {cyan init}                Initialize devcontainer config (default command)
    -s, --stack <name1, name2, ...>
                      Set the stack to be used (default: autodetect)
    -p, --packageManager <npm|yarn|pnpm>
                      Set package manager (default: autodetect)
    -d, --detect      Force stack detection even if stack option is set
    --list            List available tech stacks

  {cyan code} [path]         Open folder in a VS Code devcontainer
    -i, --insiders    Use insiders version of VS Code

  {cyan shell} [command]     Open a shell in devcontainer
    -e, --exec <cmd>  Execute command in container shell

General options:
    -v, --version     Show version
    --help            Show this help
`;

export async function run(args: string[]) {
  const options = minimist(args, {
    string: ['stack', 'packageManager', 'exec'],
    boolean: [
      'detect',
      'insiders',
      'codespaces',
      'list',
      'version',
      'help',
      'verbose'
    ],
    alias: {
      s: 'stack',
      p: 'packageManager',
      d: 'detect',
      i: 'insiders',
      c: 'codespaces',
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
        stack: options.stack?.split(',').map((s: string) => s.trim()),
        packageManager: options.packageManager,
        detect: options.detect,
        list: options.list
      });
    case 'code':
      return code({
        path: options._[1],
        insiders: options.insiders,
        codespaces: options.codespaces
      });
    case 'shell':
      return shell({
        exec: options.exec
      });
    default:
      console.info(help);
  }
}
