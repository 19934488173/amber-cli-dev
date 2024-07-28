'use strict';

import semver from 'semver';
import colors from 'colors';
import log from '@amber-cli-dev/log';
export const LOWEST_NODE_VERSION = '12.0.0';


class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空');
    };
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    };
    if (argv.length < 1) {
      throw new Error('参数列表为空！');
    };

    this._argv = argv;

    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain = chain.then(resolve);
      chain.catch(err => {
        log.error(err.message);
        reject(err);
      });
    });
    this.runner = runner;
  };

  /** 检查node版本号 */
  checkNodeVersion() {
    //第一步，获取当前node版本号
    const currentVersion = process.version;
    //第二步，比对最低版本号
    if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
      throw new Error(colors.red(`amber-cli 需要安装v${LOWEST_NODE_VERSION}以上版本的Node.js`))
    }
  };

  //参数初始化操作
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  };

  //命令准备阶段
  init() {
    throw new Error('init必须实现');
  };

  //命令执行阶段
  exec() {
    throw new Error('exec必须实现');
  };
}

export default Command;

