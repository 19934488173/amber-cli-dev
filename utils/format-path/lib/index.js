'use strict';
import path from 'path';

/** 处理路径 */
export function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep;
    if (sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    };
  };
  return p;
}

