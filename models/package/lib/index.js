'use strict';

import path from 'path';
import { packageDirectorySync } from 'pkg-dir';
import npminstall from 'npminstall';
import { pathExistsSync } from 'path-exists'

import { isObject, parsePackageJSON } from '@amber-cli-dev/utils';
import { formatPath } from '@amber-cli-dev/format-path';
import { getDefaultRegistry, getNpmLatestVersion } from '@amber-cli-dev/git-pnpm-info';


class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空！');
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象！');
    }
    // package的目标路径
    this.targetPath = options.targetPath;
    // 缓存package的路径
    this.storeDir = options.storeDir;
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.packageVersion;
  };

  async prepare() {
    //拿到最新的版本号
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    console.log(this.packageVersion)
  }

  //判断当前package是否存在
  async exists() {
    if (this.storeDir) {
      console.log(111, this.storeDir)
      await this.prepare();

    } else {
      return pathExistsSync(this.targetPath)
    }

  };


  //安装package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion,
      }],
    });
  };



  // 获取入口文件路径
  getRootFilePath() {
    // 1，获取package.json所在目录
    const dir = packageDirectorySync({ cwd: this.targetPath });
    // 2，读取package.json
    if (dir) {
      const pkgFile = parsePackageJSON(path.resolve(dir, 'package.json'));
      // 3，寻找main/bin
      if (pkgFile && pkgFile.main) {
        // 4，路径兼容（macOS / windows）
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    };
    return null;
  };


}

export default Package;
