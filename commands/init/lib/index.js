'use strict';

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import pkg from 'fs-extra';
import semver from 'semver';
import userHome from 'user-home';

import Command from '@amber-cli-dev/command';
import log from '@amber-cli-dev/log';
import request from '@amber-cli-dev/request';
import Package from '@amber-cli-dev/package';
import { spinnerStart, sleep } from '@amber-cli-dev/utils';

const { emptyDirSync, ensureDirSync, copySync } = pkg;

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

/** 调用api获取项目模版 */
function getProjectTemplate() {
  return request({
    url: '/project/template',
  });
}

export class InitCommand extends Command {
  //命令准备阶段具体实现
  init() {
    this.projectName = this._argv[0] || '';
    this.force = this._argv[1]?.force || false;
    log.verbose('projectName', this.projectName);
    log.verbose('force', this.force);
  }

  //命令执行阶段具体实现
  async exec() {
    try {
      //1，准备阶段
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2，下载模版
        log.verbose('projectInfo', projectInfo);
        this.projectInfo = projectInfo;
        await this.downLoadTemplate();
        // 3，安装模版
        await this.installTemplate();
      }
    } catch (e) {
      log.error(e.message);
    }
  }

  //安装模版
  async installTemplate() {
    if (this.templateInfo) {
      // 1，模版类型不存在，默认为normal
      if (!this.templateInfo.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      //2，模版累类型为normal走普通安装
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        await this.installNormalTemplate();
      }
      //3，模版类型为custom时，单独处理自定义安装
      else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        await this.installCustomTemplate();
      } else {
        throw new Error('无法识别项目模版类型！');
      }
    } else {
      throw new Error('项目模版信息不存在');
    }
  }

  //normal模版安装
  async installNormalTemplate() {
    log.verbose('templateNpm', this.templateNpm);
    //拷贝模版代码到当前目录
    let spinner = spinnerStart('正在安装模版...');
    await sleep();

    const targetPath = process.cwd();

    try {
      const templatePath = path.resolve(
        this.templateNpm.cacheFilePath,
        `node_modules/${this.templateInfo.npmName}/template`,
      );
      ensureDirSync(templatePath);
      ensureDirSync(targetPath);

      copySync(templatePath, targetPath);
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
      log.success('模板安装成功');
    }
  }

  //custom模版安装
  async installCustomTemplate() {}

  // 下载模板
  async downLoadTemplate() {
    // 1，通过项目模板API获取项目模板信息
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate,
    );

    const targetPath = path.resolve(userHome, '.amber-cli-dev', 'template');
    const storeDir = path.resolve(
      userHome,
      '.amber-cli-dev',
      'template',
      'node_modules',
    );
    const { npmName, version } = templateInfo;

    this.templateInfo = templateInfo;

    //调用Package开始下载模版
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });

    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart('正在下载模板...');
      await sleep();
      try {
        await templateNpm.install();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('下载模版成功！');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      const spinner = spinnerStart('正在更新模板...');
      await sleep();
      try {
        await templateNpm.update();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('更新模版成功！');
          this.templateNpm = templateNpm;
        }
      }
    }
  }

  //判断文件夹逻辑
  async prepare() {
    // 先看看有没有项目模版可用
    const template = await getProjectTemplate();
    if (!template || template.length === 0) throw new Error('项目模版不存在');
    this.template = template;
    // 1. 判断当前目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      //处理传进来的--force
      if (!this.force) {
        //询问是否继续创建
        ifContinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'ifContinue',
            default: false,
            message: '当前文件夹不为空，是否继续创建项目？',
          })
        ).ifContinue;
        if (ifContinue) return;
      }

      //2，是否启动强制更新
      if (ifContinue || this.force) {
        //在情况前给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？',
        });

        if (confirmDelete) {
          //清空当前目录
          emptyDirSync(localPath);
        }
      }
    }
    // return 项目的基本信息object
    return this.getProjectInfo();
  }

  //3，选择创建项目或组件 && 4,获取项目基本信息
  async getProjectInfo() {
    function isValidName(v) {
      return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
        v,
      );
    }
    let projectInfo = {};
    //1，选择创建项目或组件
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化项目类型：',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
        },
      ],
    });
    log.verbose('type', type);

    //2，获取项目的基本信息
    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称：',
          default: '',
          validate: async function (name) {
            return new Promise((resolve) => {
              setTimeout(() => {
                if (!isValidName(name)) {
                  resolve('请输入合法名称');
                } else {
                  resolve(true);
                }
              }, 0);
            });
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号：',
          default: '1.0.0',
          validate: function (version) {
            return new Promise((resolve) => {
              setTimeout(() => {
                if (!semver.valid(version)) {
                  resolve('请输入合法的版本号');
                } else {
                  resolve(true);
                }
              }, 0);
            });
          },
          filter: function (v) {
            //用semver拿到版本号
            return semver.valid(v) ? semver.valid(v) : v;
          },
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模版',
          choices: this.createTemplateChoice(),
        },
      ]);
      //赋值
      projectInfo = { type, ...project };
    } else if (type === TYPE_COMPONENT) {
    }

    return projectInfo;
  }

  //1，判断当前目录是否为空
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    // 文件过滤的逻辑
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0,
    );
    return !fileList || fileList.length <= 0;
  }

  //项目模版选项获取
  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
  }
}

// 初始化脚手架init事件
export function init() {
  const argv = JSON.parse(process.argv.slice(2));
  return new InitCommand(argv);
}

init();
