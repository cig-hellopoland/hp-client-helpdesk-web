import client, { compose, cancellableRequest, withRedux } from 'services/axiosClient';
import { selectors as configSelectors } from 'redux/config';

const requestInterceptors = [];
const responseInterceptors = [];

/*
 * INITIALIZE
 */

export default function createHTTPClient(store) {
  const instance = client.create();
  const state = store.getState();
  const appConfig = configSelectors.getAppConfig(state);
  const { axios: axiosConfig } = appConfig.public;

  // Configure axios
  Object.entries(axiosConfig).forEach((entry) => {
    const [key, value] = entry;

    instance.defaults[key] = value;
  });

  // Add request cancellation capabilities (not part of Axios API)
  instance.cancellable = cancellableRequest;

  // Initialize interceptors
  if (responseInterceptors && responseInterceptors.length) {
    responseInterceptors.forEach((interceptor) => {
      const { redux, reject, resolve } = interceptor;

      instance.interceptors.response.use(
        compose(resolve, withRedux(store, redux)),
        compose(reject, withRedux(store, redux)),
      );
    });
  }

  if (requestInterceptors && requestInterceptors.length) {
    requestInterceptors.forEach((interceptor) => {
      const { redux, reject, resolve } = interceptor;

      instance.interceptors.request.use(
        compose(resolve, withRedux(store, redux)),
        compose(reject, withRedux(store, redux)),
      );
    });
  }

  return instance;
}
