import responseJWTInterceptor from '@fream/axios-commons/interceptors/responseJWTInterceptor';
import { actions as profileActions, selectors as profileSelectors } from 'redux/profile';

function getResponseInterceptors(store) {
  return [
    { // JWT response interceptor
      onFulfilled: axiosResponse => axiosResponse,
      onRejected: responseJWTInterceptor({
        getCredentials: () => {
          const state = store.getState();

          return Promise.resolve(profileSelectors.getCredentials(state));
        },
        getRefreshConfig: () => {
          const state = store.getState();
          const data = profileSelectors.getCredentials(state);
          const options = {
            headers: {
              authorization: `Bearer ${data.refreshToken}`,
            },
          };

          const { payload } = profileActions.refreshAccessToken({ data, options });

          return Promise.resolve(payload);
        },
        onRefreshFailure: (axiosRefreshError) => {
          store.dispatch(profileActions.errorUnauthorized(axiosRefreshError));
        },
        onRefreshSuccess: (axiosRefreshResponse) => {
          const { data } = axiosRefreshResponse;

          store.dispatch(profileActions.refreshAccessTokenSuccess(data));
        },
      }),
    },
  ];
}

export default getResponseInterceptors;
