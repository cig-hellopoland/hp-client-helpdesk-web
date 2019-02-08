import axios from 'axios';
import { cancellableRequest } from 'utils/axiosCommons';

const requestInterceptors = [];
const responseInterceptors = [];

/*
 * INITIALIZE
 */

export default function createHTTPClient(axiosConfig, store) {
  const instance = axios.create();

  // Configure axios
  Object.entries(axiosConfig).forEach(([key, value]) => {
    instance.defaults[key] = value;
  });

  // Add request cancellation capabilities (not part of Axios API)
  instance.cancellable = cancellableRequest;

  // Initialize interceptors
  if (responseInterceptors && responseInterceptors.length) {
    responseInterceptors.forEach(({ redux, reject, resolve }) => {
      instance.interceptors.response.use(
        args => resolve({ ...args, store, redux }),
        args => reject({
          ...args, store, redux, axiosConfig,
        }),
      );
    });
  }

  if (requestInterceptors && requestInterceptors.length) {
    requestInterceptors.forEach(({ redux, reject, resolve }) => {
      instance.interceptors.request.use(
        args => resolve({ ...args, store, redux }),
        args => reject({ ...args, store, redux }),
      );
    });
  }

  return instance;
}
