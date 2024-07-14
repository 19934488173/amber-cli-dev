'use strict';
import path from 'path';
import fs from 'fs';


/** 1,读取package.json文件 */
export function getPackageJSON(filename) {
  const pkgPath = path.resolve(filename, '../../package.json');
  const str = fs.readFileSync(pkgPath, { encoding: 'utf-8' });
  return JSON.parse(str);
}


/** 检查参数是否为object */
export function isObject(param) {
  return Object.prototype.toString.call(param) === '[object Object]';
}
