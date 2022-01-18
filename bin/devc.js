#!/usr/bin/env node
const process = require('process');
const { run } = require('../lib/cli.js');

run(process.argv.slice(2));
