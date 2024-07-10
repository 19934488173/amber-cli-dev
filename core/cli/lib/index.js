'use strict';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import process from 'node:process';
import userhome from 'userhome';
import { pathExists } from 'path-exists';

import semver from 'semver';
import colors from 'colors';
import rootCheck from 'root-check';
import minimist from 'minimist';
import dotenv from 'dotenv';

import log from '@amber-cli-dev/log';
import { getNpmInfo } from '@amber-cli-dev/format-path';
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from './const.js';

const __filename = fileURLToPath(import.meta.url);
const myUserhome = userhome();
let pkg, args, config;

export default function cli() {
	try {
		checkPkgVersion();
		checkNodeVersion();
		checkRoot();
		checkUserHome();
		checkInputArgs();
		checkEnv();
		checkGlobalUpdate();
	} catch (error) {
		log.error(error.message);
	}

}

/** 检查是否需要全局更新 */
function checkGlobalUpdate() {
	//1，获取最新版本号与模块名
	const currentVersion = pkg.version;
	const npmName = pkg.name;
	//2，调用npm API，获取所有的版本号
	getNpmInfo()
	//3，提取所有的版本号，比对哪些版本号是大于当前版本号
	//3，获取最新版本号，提示用户更新到该版本
}

/** 检查环境变量 */
function checkEnv() {
	const dotenvPath = path.resolve(myUserhome, '.env');
	if (pathExists(dotenvPath)) {
		config = dotenv.config({
			path: dotenvPath
		});
	}
	createDefaultConfig();
}
function createDefaultConfig() {
	const cliConfig = {
		home: myUserhome,
	};
	if (process.env.CLI_HOME) {
		cliConfig['cliHome'] = path.join(myUserhome, process.env.CLI_HOME);
	} else {
		cliConfig['cliHome'] = path.join(myUserhome, DEFAULT_CLI_HOME);
	}
	process.env.CLI_HOME_PATH = cliConfig.cliHome;
}


/** 检查入参 */
function checkInputArgs() {
	args = minimist(process.argv.slice(2));
	checkArgs();
}
function checkArgs() {
	if (args.debug) {
		process.env.LOG_LEVEL = 'verbose';
	} else {
		process.env.LOG_LEVEL = 'info';
	}
	log.level = process.env.LOG_LEVEL;
}


/** 检查用户主目录 */
function checkUserHome() {
	if (!userhome || !pathExists(userhome)) {
		throw new Error(colors.red('当前登录用户主目录不存在!'))
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
	pkg = getPackageJson();
	log.notice('cli', pkg.version);
};

/** 获取package.json文件信息 */
function getPackageJson() {
	const pkgPath = path.resolve(__filename, '../../package.json');
	const str = fs.readFileSync(pkgPath, { encoding: 'utf-8' });
	return JSON.parse(str);
}
