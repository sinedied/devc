#!/usr/bin/env node

// ***************************************************************************
// Checks for missing mods imports in src/mods/index.ts and adds them.
// /!\ Make sure that the TypeScript build if up to date before running this!
// Usage: ./update-mods.js
// ***************************************************************************

const process = require('process');
const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');
const modImports = require('../lib/mods/index.js');

async function checkAndUpdateMods() {
  const modFiles = await glob('./lib/mods/**/*.js', {
    ignore: './lib/mods/index.js'
  });
  console.log(`Found ${modFiles.length} mod files.`);
  const mods = await Promise.all(
    modFiles.map(async (file) => [file, require(path.join('..', file))])
  );
  const missingImports = mods.filter(([_file, module]) => {
    const name = Object.keys(module)[0];
    if (!modImports[name]) {
      console.log(`Missing import for mod ${name}`);
      return true;
    }

    return false;
  });

  if (missingImports.length === 0) {
    console.log('No missing imports found.');
    process.exit(0);
  }

  const importsToAdd = missingImports
    .map(([file]) => {
      const importFile = path.relative('./lib/mods', file);
      return `export * from './${importFile}';`;
    })
    .join('\n');

  fs.appendFileSync('src/mods/index.ts', `${importsToAdd}\n`);
  console.log(`Added ${missingImports.length} missing imports.`);
}

checkAndUpdateMods();
