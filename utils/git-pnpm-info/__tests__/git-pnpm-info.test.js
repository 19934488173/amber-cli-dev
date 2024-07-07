'use strict';

const gitPnpmInfo = require('..');
const assert = require('assert').strict;

assert.strictEqual(gitPnpmInfo(), 'Hello from gitPnpmInfo');
console.info('gitPnpmInfo tests passed');
