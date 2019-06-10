import { createLogic } from 'redux-logic';

/**
 * Defines set of methods for managing ushers.
 * @module Ushers
 */

/**
 * Base API URL.
 * @type {string}
 */
export const apiURL = '/partners';


/**
 * Module name.
 * @type {string}
 */
export const name = 'partners';

/**
 * Reducer prefix.
 * @type {string}
 */
const prefix = `${name}/`;

/*
 * TYPES
 */

/**
 * Type used for clear error.
 * @type {string}
 */
const CLEAR_ERROR = `${prefix}CLEAR_ERROR`;

/**
 * Type used for handling create item request.
 * @type {string}
 */
const CREATE_ITEM = `${prefix}CREATE_ITEM`;

/**
 * Type used for handling create item request.
 * @type {string}
 */
const CREATE_ITEM_FAILURE = `${prefix}CREATE_ITEM_FAILURE`;

/**
 * Type used for handling create item request.
 * @type {string}
 */
const CREATE_ITEM_SUCCESS = `${prefix}CREATE_ITEM_SUCCESS`;

export const types = {
  CLEAR_ERROR,
  CREATE_ITEM,
  CREATE_ITEM_FAILURE,
  CREATE_ITEM_SUCCESS,
};

/*
 * ACTIONS
 */

/**
 * Creates action for clear error
 * @method
 * @return {{type: string}}
 */
const clearError = () => ({ type: CLEAR_ERROR });


/**
 * Creates action for create item request.
 * @method
 * @callback failureCallback
 * @callback successCallback
 * @param {Object} params
 * @param {Object} [params.options] - request config
 * @param {failureCallback} [params.onFailure] - failure callback
 * @param {successCallback} [params.onSuccess] - success callback
 * @return {{
 *   type: string,
 *   payload: {url: string, method: string, data: *, options: *},
 *   onFailure: failureCallback,
 *   onSuccess: successCallback
 * }}
 */
const createItem = ({
  options, data, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_ITEM,
  payload: {
    url: `${apiURL}`,
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});
/**
 * Creates action for create item request failing.
 * @method
 * @param {Object} params - axios response schema
 * @param params.data - response body
 * @param params.status - response status
 * @return {{
 *   type: string,
 *   error: {data, status: number}
 * }}
 */
const createItemFailure = ({ data, status } = {}) => ({
  type: CREATE_ITEM_FAILURE,
  error: {
    data,
    status,
  },
});

/**
 * Creates action for successful create partner request.
 * @method
 * @return {{type: string}}
 */
const createItemSuccess = () => ({
  type: CREATE_ITEM_SUCCESS,
});

export const actions = {
  clearError,
  createItem,
  createItemFailure,
  createItemSuccess,
};

/**
 * Logic used for handling create item request.
 * @method
 */
const createItemLogic = createLogic({
  type: [
    CREATE_ITEM,
  ],
  latest: true,
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(createItemSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(createItemFailure(response));
        if (onFailure) {
          onFailure();
        }
      }
    } catch ({ response }) {
      dispatch(createItemFailure(response));
      if (onFailure) {
        onFailure();
      }
    }

    done();
  },
});

export const logic = {
  createItemLogic,
};


/*
 * SELECTORS
 */

/**
 * Returns current state.
 * @method
 * @param {Object} state - redux state
 * @return {*}
 */
const getState = state => state[name];

/**
 * Returns request error.
 * @method
 * @param {Object} state - redux state
 * @return {*}
 */
const getError = state => getState(state).error;

export const selectors = {
  getError,
  getState,
};

/*
 * REDUCERS
 */

/**
 * Default state model.
 * @type {object}
 * @property {object|null} error - submission error
 * @property {object} item - current entity data
 * @property {object[]} list - entity list data
 */
export const defaultInitialState = {
  error: null,
  item: {},
  list: [],
};

/**
 * Module's reducer function.
 * @method
 * @param {object} initialState - allows initializing reducer with custom state
 * @return {object}
 */
const reducer = (initialState = defaultInitialState) => (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ITEM_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    case CLEAR_ERROR:
    case CREATE_ITEM_SUCCESS:
      return {
        ...state,
        error: initialState.error,
      };
    default:
      return state;
  }
};

export default reducer;
