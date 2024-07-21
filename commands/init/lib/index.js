'use strict';

import Command from '@amber-cli-dev/command';
import log from '@amber-cli-dev/log';


export class InitCommand extends Command {
  //命令准备阶段具体实现
  init() {
    this.projectName = this._argv[0] || '';
    // this.force = !!this._cmd._optionValues.force;
    log.verbose('projectName', this.projectName);
    // log.verbose('force', this.force);

  };

  //命令执行阶段具体实现
  exec() {

  }

};


export default function init(argv) {
  // log.verbose('argv', argv);
  return new InitCommand(argv);
};



