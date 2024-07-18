'use strict';

export default function init(projectName, cmdObj) {
  console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH)
};
