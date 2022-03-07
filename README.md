# 📦 devc

[![NPM version](https://img.shields.io/npm/v/devc.svg)](https://www.npmjs.com/package/devc)
[![Build Status](https://github.com/sinedied/devc/workflows/build/badge.svg)](https://github.com/sinedied/devc/actions)
![Node version](https://img.shields.io/node/v/devc.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Quickly add .devcontainer configuration to any JavaScript project, and more!

But wait, what's a *dev container*?

**A dev container is a full development environment packaged into a Docker container.** It's ready to use, easy to update and painless to share with your team. It also brings the complete VS Code experience through the [Remote Development extension pack](https://aka.ms/vscode/remote-dev). Dev containers can run locally on your machine, or in the cloud through services like [GitHub Codespaces](https://github.com/features/codespaces).

You can learn more about dev containers [here](https://aka.ms/vscode/devcontainer) or watch this [introduction video series](https://aka.ms/series/devcontainers).

## Getting started

There are multiple ways to use the `devc` tool:

- Install globally as a CLI tool: `npm install -g devc`
- Generate a dev container configuration in a project without installing: `npm init devc` or `yarn create devc`
- Add a dev container configuration to an Angular project `ng add devc`

While the main use case is to generate a dev container configuration, there are also other features provided by the CLI if you install it. For example, you can run a command in a dev container (even if it's not started) or open VS Code directly in a dev container.

## Usage

```
Usage: devc [command] [options]

Commands:
  init                Initialize dev container config (default command)
    -s, --stack <name1, name2, ...>
                      Set the stack to be used (default: autodetect)
    -p, --packageManager <npm|yarn|pnpm>
                      Set package manager (default: autodetect)
    -d, --detect      Force stack detection even if stack option is set
    --list            List available tech stacks

  code [path]         Open folder in a VS Code dev container
    -i, --insiders    Use insiders version of VS Code

  shell [command]     Open a shell in dev container
    -e, --exec <cmd>  Execute command in container shell

General options:
    -v, --version     Show version
    --help            Show this help
```

### Init

`devc init` will create a `.devcontainer` folder in the current directory with the configuration for the current project.

By default, it will detect automatically which package manager and which stack is used. You can override this by using the `--packageManager` and `--stack` options. Using `--stack` will override the detection and only use the specified stack, but you can use `--detect` to use autodetection in addition to your `--stack` value.

To list available supported stacks, use `devc init --list`.

> Note: the base dev container configuration generated can work with any Node.js project, and it's always possible to customize it after initialization.

### Code

`devc code` will open the current folder in a VS Code dev container directly.

If no path is specified, it will open the current folder. You can also use the `--insiders` option to open the [Insiders version of VS Code](https://code.visualstudio.com/insiders/).

### Shell

`devc shell` will open an interactive shell in the current folder in an existing dev container.

If the dev container is not running, it will start it for the duration of your session and stop it when you exit the shell.

Using the `--exec` option, you can directly execute a single command in the dev container shell, without going interactive.

Note: currently, the dev container must have been created in VS Code before you can use this command. Building the dev container from the command line is not (yet) supported.

## Related projects

- https://code.visualstudio.com/docs/remote/devcontainer-cli
- https://github.com/stuartleeks/devcontainer-cli/
