import axios from 'axios';
import { compose } from 'redux';
import { cancellableRequest, withRedux } from 'utils/axiosCommons';
import { selectors as configSelectors } from 'redux/config';

const requestInterceptors = [];
const responseInterceptors = [];

/*
 * INITIALIZE
 */

export default function createHTTPClient(store) {
  const instance = axios.create();
  const state = store.getState();
  const appConfig = configSelectors.getAppConfig(state);
  const { axios: axiosConfig } = appConfig.public;

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
        compose(resolve, withRedux(store, redux)),
        compose(reject, withRedux(store, redux)),
      );
    });
  }

  if (requestInterceptors && requestInterceptors.length) {
    requestInterceptors.forEach(({ redux, reject, resolve }) => {
      instance.interceptors.request.use(
        compose(resolve, withRedux(store, redux)),
        compose(reject, withRedux(store, redux)),
      );
    });
  }

  return instance;
}
