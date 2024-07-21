'use strict';

import path from 'path';
import { pathToFileURL } from 'url';
import Package from '@amber-cli-dev/package';
import log from '@amber-cli-dev/log';
import { exec as spawn } from '@amber-cli-dev/utils';


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
      await pkg.update();
    } else {
      //安装package
      await pkg.install()
    }

  } else {

    pkg = new Package({ targetPath, packageName, packageVersion });

  };

  const rootFile = pkg.getRootFilePath();

  if (rootFile) {
    try {
      // 在node子进程中调用
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent') {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;

      const fileUrl = pathToFileURL(rootFile);
      const module = await import(fileUrl.href);
      const code = `${module.default.call(null, JSON.stringify(args))}`;

      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      child.on('error', e => {
        log.error(e.message);
        process.exit(1);
      });
      child.on('exit', e => {
        log.verbose('命令执行成功:' + e);
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    };

  };
};
