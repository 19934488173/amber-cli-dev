#! /usr/bin/env node

import importLocal from 'import-local';
import { fileURLToPath } from 'url';
import lib from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);

if (importLocal(__filename)) {
	console.log('cli', '正在使用 amber-cli 本地版本');
} else {
	lib();
}


