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
 * Type used for handling create partner request.
 * @type {string}
 */
const CREATE_PARTNER = `${prefix}CREATE_PARTNER`;

/**
 * Type used for handling create partner request.
 * @type {string}
 */
const CREATE_PARTNER_FAILURE = `${prefix}CREATE_PARTNER_FAILURE`;

/**
 * Type used for handling create partner request.
 * @type {string}
 */
const CREATE_PARTNER_SUCCESS = `${prefix}CREATE_PARTNER_SUCCESS`;

export const types = {
  CREATE_PARTNER,
  CREATE_PARTNER_FAILURE,
  CREATE_PARTNER_SUCCESS,
};

/*
 * ACTIONS
 */

/**
 * Creates action for create partner request.
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
const createPartner = ({
  options, data, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_PARTNER,
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
 * Creates action for create partner request failing.
 * @method
 * @param {Object} params - axios response schema
 * @param params.data - response body
 * @param params.status - response status
 * @return {{
 *   type: string,
 *   error: {data, status: number}
 * }}
 */
const createPartnerFailure = ({ data, status } = {}) => ({
  type: CREATE_PARTNER_FAILURE,
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
const createPartnerSuccess = () => ({
  type: CREATE_PARTNER_SUCCESS,
});

export const actions = {
  createPartner,
  createPartnerFailure,
  createPartnerSuccess,
};

/**
 * Logic used for handling create partner request.
 * @method
 */
const createPartnerLogic = createLogic({
  type: [
    CREATE_PARTNER,
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
        dispatch(createPartnerSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(createPartnerFailure(response));
        if (onFailure) {
          onFailure();
        }
      }
    } catch ({ response }) {
      dispatch(createPartnerFailure(response));
      if (onFailure) {
        onFailure(response.message);
      }
    }

    done();
  },
});

export const logic = {
  createPartnerLogic,
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
    case CREATE_PARTNER_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    case CREATE_PARTNER_SUCCESS:
      return {
        ...state,
        error: initialState.error,
      };
    default:
      return state;
  }
};

export default reducer;
