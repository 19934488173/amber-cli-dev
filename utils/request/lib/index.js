'use strict';

import axios from 'axios';

const BASE_URL = process.env.BASE_CLI_URL
  ? process.env.BASE_CLI_URL
  : 'HTTP://book.hjbaobao.cli:7001';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default request;
