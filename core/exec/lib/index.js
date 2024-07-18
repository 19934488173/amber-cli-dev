'use strict';

import path from 'path';
import { pathToFileURL } from 'url';
import Package from '@amber-cli-dev/package';
import log from '@amber-cli-dev/log';
import { executeFile } from '@amber-cli-dev/utils';

const SETTINGS = {
  init: '@imooc-cli/init',
};
const CACHE_DIR = 'dependencies';

export async function exec() {
  let pkg;
  let storeDir = '';
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules');

    log.verbose('targetPath', targetPath);
    log.verbose('storeDir', storeDir);

    pkg = new Package({ targetPath, storeDir, packageName, packageVersion });

    if (await pkg.exists()) {
      //更新package
    } else {
      //安装package
      await pkg.install()
    }

  } else {

    pkg = new Package({ targetPath, packageName, packageVersion });

  };

  console.log(await pkg.exists())



  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    //读取文件并执行默认方法
    await executeFile(rootFile, ...arguments)
  }

}
