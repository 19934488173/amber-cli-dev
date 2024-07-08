'use strict';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import process from 'node:process';

import semver from 'semver';
import colors from 'colors';
import rootCheck from 'root-check';

import log from '@amber-cli-dev/log';
import { LOWEST_NODE_VERSION } from './const.js';

const __filename = fileURLToPath(import.meta.url);

export default function cli(args) {
	try {
		checkPkgVersion();
		checkNodeVersion();
		checkRoot();
	} catch (error) {
		log.error(error.message);
	}

}


/** 检查root账户 */
function checkRoot() {
	rootCheck();
}


/** 检查node版本号 */
function checkNodeVersion() {
	//第一步，获取当前node版本号
	const currentVersion = process.version;
	//第二步，比对最低版本号
	if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
		throw new Error(colors.red(`amber-cli 需要安装v${LOWEST_NODE_VERSION}以上版本的Node.js`))
	}

}

/** 检查包版本号 */
function checkPkgVersion() {
	const pkgPath = path.resolve(__filename, '../../package.json');
	const str = fs.readFileSync(pkgPath, { encoding: 'utf-8' });
	const pkg = JSON.parse(str);
	log.notice('cli', pkg.version);
};
