# Contributing to devc

You can contribute to the project in several ways: reporting bugs, suggesting features, or creating pull requests.
While the project already supports [many tools and frameworks](./src/mods/), you can contribute to the project by adding your own mods to support your favorite tech.

## Setting up for development

1. [Fork](https://github.com/sinedied/devc/fork) the project on GitHub
2. Clone your fork to your local machine
3. Run `npm install`
4. Run `npm link` to make the `devc` CLI available globally
5. Run `npm run build:watch` to automatically build the TypeScript files and watch for changes

## Adding support for a new tech stack

To support a new tech stack, you'll have to create a new "Mod" file in the `src/mods` folder.

This is the `Mod` interface you have to implement:
```typescript
interface Mod {
  // The list of dev container ports to forward to the host
  forwardPorts?: number[];
  // The list of VS Code extensions ids to be installed in the container
  // You can get the extension id by right-clicking on the extension in VS Code
  extensions?: string[];
  // A command to run in the container after it's created the first time
  // You can run multiple commands by adding && between them
  postCreateCommand?: string;
  // The list of global NPM packages to install in the container
  globalPackages?: string[];
  // The list of templates folder to copy to the project
  templates?: string[];
  // Extra container commands that will be added to the Dockerfile
  containerSetup?: string;
  // The list of mod names to include
  includeMods?: string[];
  // The conditions in which this mod should apply
  // If any of these conditions is met, the mod will be applied
  applyIf?: ApplyConditions;
}
```

A mod is a class that implements the `Mod` interface, and it will be used to perform *modification* to the base dev container configuration of the project. A mod will only be applied if the `applyIf` condition is met.

```typescript
interface ApplyConditions {
  // NPM package names to look for
  // If any of them is present, the mod will be applied
  packages?: string[];
  // Files glob patterns to look for
  // If any of them is present, the mod will be applied
  files?: string[];
  // You can run custom code here, and return true if the mod should be applied
  // Be mindful of the performance of this function, as it will grow the total
  // amount of time needed to detect all mods
  condition?: () => Promise<boolean> | boolean;
}
```

You can look at [existing mods](./src/mods/) in the `src/mods` to see how they work.

Once you're happy with your mod, run the following command to include it in the project:
```bash
npm run update:mods
```

You can now test your mod in a project you would like to use it with `devc --stack <mod_name>`.

After you're finished testing, you can commit your changes and submit a pull request.
This project follow the [conventional commits](https://conventionalcommits.org) naming convention, so be sure to look at the docs if you're not familiar with this convention.

Thanks for you help!
