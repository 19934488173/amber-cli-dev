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
import dotenv from 'dotenv';
import { Command } from 'commander';

import log from '@amber-cli-dev/log';
import { exec } from '@amber-cli-dev/exec';
import { getPackageJSON } from '@amber-cli-dev/utils';
import getNpmSemverVersion from '@amber-cli-dev/git-pnpm-info';
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from './const.js';


const __filename = fileURLToPath(import.meta.url);
const myUserhome = userhome();
const { name, version, bin } = getPackageJSON(__filename);


/** 实例化一个脚手架对象 */
const program = new Command();

export default async function cli() {
	try {
		await prepare();
		registerCommand();
	} catch (error) {
		log.error(error.message);
	}
};

/** 【二】注册脚手架命令：脚手架初始化 */
function registerCommand() {
	program
		.name(Object.keys(bin)[0])
		.usage('<command> [options]')
		.version(version)
		.option('-d,--debug', '是否开启调试模式', false)
		.option('-tp,--targetPath <targetPath>', '是否指定本地调试文件路径', '');


	/** 命令注册 */
	program
		.command('init [projectName]')
		.option('-f --force', '是否强制初始化项目')
		.action(exec);


	/** 监听debug模式 */
	program.on('option:debug', () => {
		process.env.LOG_LEVEL = program._optionValues.debug ? 'verbose' : 'info';
		log.level = process.env.LOG_LEVEL;
		log.verbose('test', '进入debug模式')
	});

	/** 监听targetPath，存到环境变量中方便后期使用，代码解耦 */
	program.on('option:targetPath', () => {
		process.env.CLI_TARGET_PATH = program._optionValues.targetPath;
	})

	/** 处理未知命令 */
	program.on('command:*', (obj) => {
		const availableCommands = program.commands.map(cmd => cmd.name);
		console.log(colors.red(`未知的命令：${obj[0]}`));
		if (availableCommands.length > 0) {
			console.log(colors.red(`可用命令：${availableCommands.join(',')}`));
		}
	});


	/** 没有命令展示帮组文档，有命令才执行解析参数 */
	if (process.argv.length < 3) {
		program.outputHelp();
		console.log();
	} else {
		program.parse(process.argv);
	}
};

/** 【一】脚手架命令解析前的准备工作：脚手架启动阶段 */
async function prepare() {
	checkPkgVersion();
	checkRoot();
	checkUserHome();
	checkEnv();
	checkNodeVersion();
	// await checkGlobalUpdate();
}

/** 5,检查cli最新版本*/
async function checkGlobalUpdate() {
	//1，获取最新版本号与模块名
	const currentVersion = version;
	const npmName = name;
	//2，调用npm API，获取所有的版本号
	//3，提取所有的版本号，比对哪些版本号是大于当前版本号
	//3，获取最新版本号，提示用户更新到该版本
	const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
	if (lastVersion && semver.gt(lastVersion, currentVersion)) {
		log.warn('更新提示', colors.yellow(`请手动更新${npmName},当前版本：${currentVersion}，最新版本：${lastVersion},
			更新命令:pnpm install -g ${npmName}`))
	}
};

/** 4,检查环境变量 */
function checkEnv() {
	const dotenvPath = path.resolve(myUserhome, '.env');
	if (pathExists(dotenvPath)) {
		dotenv.config({
			path: dotenvPath
		});
	}
	createDefaultConfig();
};
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
};


/** 3,检查用户主目录 */
function checkUserHome() {
	if (!userhome || !pathExists(userhome)) {
		throw new Error(colors.red('当前登录用户主目录不存在!'))
	}
};


/** 2,检查root账户 */
function checkRoot() {
	rootCheck();
};


/** 检查node版本号 */
function checkNodeVersion() {
	//第一步，获取当前node版本号
	const currentVersion = process.version;
	//第二步，比对最低版本号
	if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
		throw new Error(colors.red(`amber-cli 需要安装v${LOWEST_NODE_VERSION}以上版本的Node.js`))
	}
};

/** 1,检查包版本号 */
function checkPkgVersion() {
	log.notice('cli', version);
};


