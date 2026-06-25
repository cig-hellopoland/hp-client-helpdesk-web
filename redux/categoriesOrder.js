import { createLogic } from 'redux-logic';

export const name = 'categoriesOrder';
const prefix = `${name}/`;

const SAVE_ORDER = `${prefix}SAVE_ORDER`;
const SAVE_ORDER_FAILURE = `${prefix}SAVE_ORDER_FAILURE`;
const SAVE_ORDER_SUCCESS = `${prefix}SAVE_ORDER_SUCCESS`;

export const types = {
  SAVE_ORDER,
  SAVE_ORDER_FAILURE,
  SAVE_ORDER_SUCCESS,
};

const saveOrder = ({
  data, onFailure, onSuccess,
} = {}) => ({
  type: SAVE_ORDER,
  payload: {
    url: '/categories/order',
    method: 'put',
    data,
  },
  onFailure,
  onSuccess,
});

const saveOrderFailure = ({ data, status } = {}) => ({
  type: SAVE_ORDER_FAILURE,
  error: {
    data,
    status,
  },
});

const saveOrderSuccess = () => ({
  type: SAVE_ORDER_SUCCESS,
});

export const actions = {
  saveOrder,
  saveOrderFailure,
  saveOrderSuccess,
};

const getState = state => state[name];
const getError = state => getState(state).error;
const isSaving = state => getState(state).saving;

export const selectors = {
  getError,
  getState,
  isSaving,
};

const saveOrderLogic = createLogic({
  type: [SAVE_ORDER],
  latest: true,
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient(payload);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(saveOrderSuccess());

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(saveOrderFailure(response));

        if (onFailure) {
          onFailure(data);
        }
      }
    } catch ({ response }) {
      dispatch(saveOrderFailure(response));

      if (onFailure) {
        onFailure(response && response.data);
      }
    }

    done();
  },
});

export const logic = {
  saveOrderLogic,
};

export const defaultInitialState = {
  error: null,
  saving: false,
};

const reducer = (initialState = defaultInitialState) => (state = initialState, action) => {
  switch (action.type) {
    case SAVE_ORDER:
      return {
        ...state,
        error: initialState.error,
        saving: true,
      };
    case SAVE_ORDER_FAILURE:
      return {
        ...state,
        error: action.error,
        saving: false,
      };
    case SAVE_ORDER_SUCCESS:
      return {
        ...state,
        error: initialState.error,
        saving: false,
      };
    default:
      return state;
  }
};

export default reducer;
