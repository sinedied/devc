#!/usr/bin/env node

// ***************************************************************************
// Changes the name of a package.
// Usage: ./rename-pkg.js <new-name>
// ***************************************************************************

const process = require('process');
const fs = require('fs');

const args = process.argv.slice(2);
if (args.length !== 1 || !args[0]) {
  console.error('Usage: ./rename-pkg.js <new-name>');
  process.exit(-1);
}

const pkg = JSON.parse(fs.readFileSync('package.json'));
pkg.name = args[0];
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.info(`Renamed package to ${pkg.name}`);
