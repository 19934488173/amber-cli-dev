'use strict';

import axios from 'axios';
import urlJoin from 'url-join';
import semver from 'semver';


/** 获取npm版本信息 */
function getNpmInfo(npmName, registry) {
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  /** 调用接口返回包版本信息 */
  return axios.get(npmInfoUrl).then(res => {
    if (res.status === 200) {
      return res.data;
    }
    return null;
  }).catch(err => {
    return Promise.reject(err);
  });
};

export function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npmjs.org';
};

//2，调用npm API，获取所有的版本号
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

//获取最新版本号
export async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[versions.length - 1];
  }
  return null;
}


function getSemverVersions(baseVersion, versions) {
  return versions.filter(version => semver.satisfies(version, `^${baseVersion}`)
  ).sort((a, b) => semver.get(b, a));
}
//3，提取所有的版本号，比对哪些版本号是大于当前版本号
export default async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}


