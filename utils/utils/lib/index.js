'use strict';

import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

/**
 * 动态导入并执行文件中的默认导出函数
 * @param {string} filePath - 要执行的文件路径
 * @param {Array} args - 传入的参数
 */
export async function executeFile(filePath, ...args) {
  try {
    const fileUrl = pathToFileURL(filePath); // 将文件路径转换为 file:// URL
    const module = await import(fileUrl.href);

    if (module && typeof module.default === 'function') {
      module.default(...args); // 调用默认导出的函数
    } else {
      console.error(`The module at ${filePath} does not have a default export or it is not a function.`);
    }
  } catch (err) {
    console.error(`Error importing module at ${filePath}:`, err);
  }
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
