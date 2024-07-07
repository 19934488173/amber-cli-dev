'use strict';

const log = require('@amber-cli-dev/log');
const pkg = require('../package.json');

module.exports = cli;

function cli() {
	checkPkgVersion();
}

function checkPkgVersion() {
	console.log(pkg.version);
	log();
};
