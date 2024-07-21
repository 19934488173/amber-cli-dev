'use strict';

import path from 'path';
import { packageDirectorySync } from 'pkg-dir';
import npminstall from 'npminstall';
import { pathExistsSync } from 'path-exists';
import fse from 'fs-extra';

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
    //package的混存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '+');
  };

  async prepare() {
    // 当缓存目录字符串存在，但是实际路径不存在的时候，先把路径创建起来
    if (this.storeDir && !pathExistsSync(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }

    //拿到最新的版本号
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  };


  // 生成当前版本文件路径
  get cacheFilePath() {
    return path.resolve(this.storeDir, `.store/${this.cacheFilePathPrefix}@${this.packageVersion}`);
  }

  // get cacheFilePath1() {
  //   return path.resolve(this.storeDir, `@${this.packageVersion}`);
  // }

  // 生成指定版本文件路径
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir || '', `.store/${this.cacheFilePathPrefix}@${packageVersion}`);
  }


  //判断当前package是否存在
  async exists() {


    if (this.storeDir) {
      await this.prepare();
      return pathExistsSync(this.cacheFilePath);

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



  // 更新package
  async update() {
    await this.prepare();
    // 1，获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2，查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    // 3，如果不存在，则直接安装最新版本
    if (!pathExistsSync(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName,
          version: latestPackageVersion,
        }],
      });

      this.packageVersion = latestPackageVersion;
    } else {
      this.packageVersion = latestPackageVersion;
    }
  }



  // 获取入口文件路径
  getRootFilePath() {
    // console.log(this.cacheFilePath1)
    function _getRootFile(targetPath) {
      // 1，获取package.json所在目录
      const dir = packageDirectorySync({ cwd: targetPath });
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
    // 走缓存逻辑的情况
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }

  };


}

export default Package;
