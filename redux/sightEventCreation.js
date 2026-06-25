import { createLogic } from 'redux-logic';
import { actions as sightEventsActions } from '@hello-poland/commons/redux/sightEvents';

const CREATE_SIGHT_EVENT = 'helpdesk/sightEvents/CREATE_SIGHT_EVENT';

const createSightEvent = ({
  data, options, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_SIGHT_EVENT,
  payload: {
    url: '/sight-events',
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const createSightEventLogic = createLogic({
  type: CREATE_SIGHT_EVENT,
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
        dispatch(sightEventsActions.createItemSuccess(data));
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(sightEventsActions.createItemFailure(response));
        if (onFailure) {
          onFailure(response);
        }
      }
    } catch (error) {
      const response = error.response || error;
      dispatch(sightEventsActions.createItemFailure(response));
      if (onFailure) {
        onFailure(response);
      }
    }

    done();
  },
});

export const actions = {
  createSightEvent,
};

export const logic = {
  createSightEventLogic,
};
