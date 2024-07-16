'use strict';

import path from 'path';
import Package from '@amber-cli-dev/package';
import log from '@amber-cli-dev/log';

const SETTINGS = {
  init: '@amber-cli-dev/init',
  publish: '@amber-cli-dev/publish',
  add: '@amber-cli-dev/add',
};
const CACHE_DIR = 'dependencies';

export function exec() {
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
  };
  pkg = new Package({ targetPath, storeDir, packageName, packageVersion });
  console.log(pkg.getRootFilePath());

}
