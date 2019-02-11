import errorInterceptor from '@fream/axios-commons/interceptors/errorInterceptor';
import requestJWTInterceptor from '@fream/axios-commons/interceptors/requestJWTInterceptor';
import { selectors as profileSelectors } from 'redux/profile';

function getRequestInterceptors(store) {
  return [
    { // JWT request interceptor
      onFulfilled: requestJWTInterceptor({
        getCredentials: () => {
          const state = store.getState();

          return profileSelectors.getCredentials(state);
        },
      }),
      onRejected: errorInterceptor,
    },
  ];
}

export default getRequestInterceptors;
