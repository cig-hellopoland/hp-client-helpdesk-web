import { createLogic } from 'redux-logic';
import { actions as sightsActions } from '@hello-poland/commons/redux/sights';

const CREATE_SIGHT = 'helpdesk/sights/CREATE_SIGHT';

const createSight = ({
  data, options, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_SIGHT,
  payload: {
    url: '/sights',
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const createSightLogic = createLogic({
  type: CREATE_SIGHT,
  latest: true,
  process: async ({
    action: {
      payload, onFailure, onSuccess,
    },
    httpClient,
    cancelled$,
  }, dispatch, done) => {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 201 || status === 204) {
        dispatch(sightsActions.createItemSuccess(data));
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(sightsActions.createItemFailure(response));
        if (onFailure) {
          onFailure();
        }
      }
    } catch (error) {
      const response = error.response || error;
      dispatch(sightsActions.createItemFailure(response));
      if (onFailure) {
        onFailure();
      }
    }

    done();
  },
});

export const actions = {
  createSight,
};

export const logic = {
  createSightLogic,
};
