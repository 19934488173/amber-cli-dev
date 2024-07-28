'use strict';

import path from 'path';
import fs from 'fs';
import cp from 'child_process';
import { Spinner } from 'cli-spinner';

//加载中状态
export function spinnerStart(msg, spinnerString = '|/-\\') {
  const spinner = new Spinner(msg + ' %s');
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

//等待1s
export function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

// spawn系统兼容
export function exec(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return cp.spawn(cmd, cmdArgs, options || {});
}

/** 解析json文件 */
export function parsePackageJSON(pkgPath) {
  const str = fs.readFileSync(pkgPath, { encoding: 'utf-8' });
  return JSON.parse(str);
}

/** 1,读取package.json文件 */
export function getPackageJSON(filename) {
  const pkgPath = path.resolve(filename, '../../package.json');
  return parsePackageJSON(pkgPath);
}

/** 检查参数是否为object */
export function isObject(param) {
  return Object.prototype.toString.call(param) === '[object Object]';
}
