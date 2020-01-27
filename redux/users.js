import { createLogic } from 'redux-logic';

/**
 * Defines set of methods for managing user's profile.
 * @module Profile
 */

/**
 * Module name.
 * @type {string}
 */
export const name = 'users';

/**
 * Reducer prefix.
 * @type {string}
 */
const prefix = `${name}/`;


/*
 * TYPES
 */

/**
 * Type used for handling user fetching.
 * @type {string}
 */
const CHANGE_PASSWORD = `${prefix}CHANGE_PASSWORD`;

/**
 * Type used for handling profile fetching failure.
 * @type {string}
 */
const CHANGE_PASSWORD_FAILURE = `${prefix}CHANGE_PASSWORD_FAILURE`;

/**
 * Type used for handling profile fetching success.
 * @type {string}
 */
const CHANGE_PASSWORD_SUCCESS = `${prefix}CHANGE_PASSWORD_SUCCESS`;

export const types = {
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAILURE,
  CHANGE_PASSWORD_SUCCESS,
};


/*
 * ACTIONS
 */

/**
 * Creates action with profile request details.
 * @method
 * @callback failureCallback
 * @callback successCallback
 * @param {Object} [options] - request config
 * @param {Number} [id] - item id
 * @param {Object} [data] - request data
 * @param {failureCallback} [onFailure] - failure callback
 * @param {successCallback} [onSuccess] - success callback
 * @return {{
 *   type: string,
 *   payload: {url: string, method: string, data: *, options: *},
 *   onFailure: failureCallback,
 *   onSuccess: successCallback
 * }}
 */
const changePassword = ({
  id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: CHANGE_PASSWORD,
  payload: {
    url: `/users/${id}/password`,
    method: 'patch',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for profile request failing.
 * @method
 * @param {Object[]} errors - list of errors returned from response
 * @return {{
 *   type: string,
 *   errors: [{details: string, status: string}]
 * }}
 */
const changePasswordFailure = ({ errors } = {}) => ({
  type: CHANGE_PASSWORD_FAILURE,
  errors: errors || [],
});

/**
 * Creates action for successful profile request.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const changePasswordSuccess = data => ({
  type: CHANGE_PASSWORD_SUCCESS,
  data,
});

export const actions = {
  changePassword,
  changePasswordFailure,
  changePasswordSuccess,
};


/*
 * SELECTORS
 */

/**
 * Returns current state.
 * @method
 * @param {Object} state
 * @return {*}
 */
const getState = state => state[name];

/**
 * Returns request errors.
 * @method
 * @param {Object} state
 * @return {Object[]}
 */
const getErrors = state => getState(state).errors;

export const selectors = {
  getErrors,
  getState,
};


/*
 * LOGIC
 */

/**
 * Logic used for handling profile fetching.
 * @method
 */
const changePasswordLogic = createLogic({
  type: [
    CHANGE_PASSWORD,
  ],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(changePasswordSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(changePasswordFailure(data));

        if (onFailure) {
          onFailure();
        }
      }
    } catch ({ response }) {
      const { data } = response;

      dispatch(changePasswordFailure(data));

      if (onFailure) {
        onFailure();
      }
    }

    done();
  },
});

export const logic = {
  changePasswordLogic,
};

/*
 * REDUCERS
 */

/**
 * Default state model.
 * @type {object}
 * @property {object} credentials - user authentication credentials
 * @property {object|null} error - submission error
 * @property {boolean} isAuthenticated - determines if user is authenticated
 * @property {object} profile - stores user profile information
 */
export const defaultInitialState = {
  errors: [],
  users: [],
};

/**
 * Module's reducer function.
 * @method
 * @param {object} initialState - allows initializing reducer with custom state
 * @return {object}
 */
const reducer = (initialState = defaultInitialState) => (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        errors: action.errors,
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        errors: initialState.errors,
      };
    default:
      return state;
  }
};

export default reducer;
