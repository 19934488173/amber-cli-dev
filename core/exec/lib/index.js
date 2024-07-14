'use strict';

import Package from '@amber-cli-dev/package';
import log from '@amber-cli-dev/log';

const SETTINGS = {
  init: '@amber-cli-dev/init',
  publish: '@amber-cli-dev/publish',
  add: '@amber-cli-dev/add',
};

export function exec() {
  let pkg;
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  pkg = new Package({ targetPath, packageName, packageVersion });

}
