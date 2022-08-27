import axios from 'axios';

export const http = axios.create({
  timeout: 30000,
  timeoutErrorMessage: 'TIMEOUT: 30s'
});
