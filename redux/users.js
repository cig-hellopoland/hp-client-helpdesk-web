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

/**
 * Default state model.
 * @type {object}
 * @property {object} credentials - user authentication credentials
 * @property {object|null} error - submission error
 * @property {boolean} isAuthenticated - determines if user is authenticated
 * @property {object} profile - stores user profile information
 */
export const defaultInitialState = {
  errors: {},
  ushers: [],
  users: [],
};

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

/**
 * Type used for handling user fetching.
 * @type {string}
 */
const CLEAR_ERROR = `${prefix}CLEAR_ERROR`;

/**
 * Type used for handling resetting partner's main user email.
 * @type {string}
 */
const RESET_EMAIL = `${prefix}RESET_EMAIL`;

/**
 * Type used for handling resetting partner's main user email failure.
 * @type {string}
 */
const RESET_EMAIL_FAILURE = `${prefix}RESET_EMAIL_FAILURE`;

/**
 * Type used for handling resetting partner's main user email success.
 * @type {string}
 */
const RESET_EMAIL_SUCCESS = `${prefix}RESET_EMAIL_SUCCESS`;

/**
 * Type used for handling user delete.
 * @type {string}
 */
const DELETE_USER = `${prefix}DELETE_USER`;

/**
 * Type used for handling user delete failure.
 * @type {string}
 */
const DELETE_USER_FAILURE = `${prefix}DELETE_USER_FAILURE`;

/**
 * Type used for handling user delete success.
 * @type {string}
 */
const DELETE_USER_SUCCESS = `${prefix}DELETE_USER_SUCCESS`;

const CREATE_PARTNER_USER = `${prefix}CREATE_PARTNER_USER`;

const CREATE_PARTNER_USER_FAILURE = `${prefix}CREATE_PARTNER_USER_FAILURE`;

const CREATE_PARTNER_USER_SUCCESS = `${prefix}CREATE_PARTNER_USER_SUCCESS`;

const UPDATE_PARTNER_USER = `${prefix}UPDATE_PARTNER_USER`;

const UPDATE_PARTNER_USER_FAILURE = `${prefix}UPDATE_PARTNER_USER_FAILURE`;

const UPDATE_PARTNER_USER_SUCCESS = `${prefix}UPDATE_PARTNER_USER_SUCCESS`;

const CHANGE_PARTNER_USER_PASSWORD = `${prefix}CHANGE_PARTNER_USER_PASSWORD`;

const CHANGE_PARTNER_USER_PASSWORD_FAILURE = `${prefix}CHANGE_PARTNER_USER_PASSWORD_FAILURE`;

const CHANGE_PARTNER_USER_PASSWORD_SUCCESS = `${prefix}CHANGE_PARTNER_USER_PASSWORD_SUCCESS`;

const DELETE_PARTNER_USER = `${prefix}DELETE_PARTNER_USER`;

const DELETE_PARTNER_USER_FAILURE = `${prefix}DELETE_PARTNER_USER_FAILURE`;

const DELETE_PARTNER_USER_SUCCESS = `${prefix}DELETE_PARTNER_USER_SUCCESS`;

const FETCH_PARTNER_USERS = `${prefix}FETCH_PARTNER_USERS`;

const FETCH_PARTNER_USERS_FAILURE = `${prefix}FETCH_PARTNER_USERS_FAILURE`;

const FETCH_PARTNER_USERS_SUCCESS = `${prefix}FETCH_PARTNER_USERS_SUCCESS`;

const CREATE_PARTNER_USHER = `${prefix}CREATE_PARTNER_USHER`;

const CREATE_PARTNER_USHER_FAILURE = `${prefix}CREATE_PARTNER_USHER_FAILURE`;

const CREATE_PARTNER_USHER_SUCCESS = `${prefix}CREATE_PARTNER_USHER_SUCCESS`;

const UPDATE_PARTNER_USHER = `${prefix}UPDATE_PARTNER_USHER`;

const UPDATE_PARTNER_USHER_FAILURE = `${prefix}UPDATE_PARTNER_USHER_FAILURE`;

const UPDATE_PARTNER_USHER_SUCCESS = `${prefix}UPDATE_PARTNER_USHER_SUCCESS`;

const CHANGE_PARTNER_USHER_PASSWORD = `${prefix}CHANGE_PARTNER_USHER_PASSWORD`;

const CHANGE_PARTNER_USHER_PASSWORD_FAILURE = `${prefix}CHANGE_PARTNER_USHER_PASSWORD_FAILURE`;

const CHANGE_PARTNER_USHER_PASSWORD_SUCCESS = `${prefix}CHANGE_PARTNER_USHER_PASSWORD_SUCCESS`;

const DELETE_PARTNER_USHER = `${prefix}DELETE_PARTNER_USHER`;

const DELETE_PARTNER_USHER_FAILURE = `${prefix}DELETE_PARTNER_USHER_FAILURE`;

const DELETE_PARTNER_USHER_SUCCESS = `${prefix}DELETE_PARTNER_USHER_SUCCESS`;

const FETCH_PARTNER_USHERS = `${prefix}FETCH_PARTNER_USHERS`;

const FETCH_PARTNER_USHERS_FAILURE = `${prefix}FETCH_PARTNER_USHERS_FAILURE`;

const FETCH_PARTNER_USHERS_SUCCESS = `${prefix}FETCH_PARTNER_USHERS_SUCCESS`;

export const types = {
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAILURE,
  CHANGE_PASSWORD_SUCCESS,
  CLEAR_ERROR,
  RESET_EMAIL,
  DELETE_USER,
  CREATE_PARTNER_USER,
  UPDATE_PARTNER_USER,
  CHANGE_PARTNER_USER_PASSWORD,
  DELETE_PARTNER_USER,
  FETCH_PARTNER_USERS,
  CREATE_PARTNER_USHER,
  UPDATE_PARTNER_USHER,
  CHANGE_PARTNER_USHER_PASSWORD,
  DELETE_PARTNER_USHER,
  FETCH_PARTNER_USHERS,
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
const changePasswordFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: CHANGE_PASSWORD_FAILURE,
  errors: data,
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

/**
 * Creates action for error clearing
 * @method
 * @return {{type: string}}
 */
const clearErrors = () => ({ type: CLEAR_ERROR });

/**
 * Creates action for partner's default user email reset.
 * @method
 * @return {{type: string, data: *}}
 */
const resetEmail = ({
  id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: RESET_EMAIL,
  payload: {
    url: `/partners/${id}/reset`,
    method: 'patch',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for partner's default user email reset failure.
 * @method
 * @param {Object[]} errors - list of errors returned from response
 * @return {{
 *   type: string,
 *   errors: [{details: string, status: string}]
 * }}
 */
const resetEmailFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: RESET_EMAIL_FAILURE,
  errors: data,
});

/**
 * Creates action for partner's default user email reset success.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const resetEmailSuccess = data => ({
  type: RESET_EMAIL_SUCCESS,
  data,
});

/**
 * Creates action for user delete.
 * @method
 * @return {{type: string, data: *}}
 */
const deleteUser = ({
  id, options, onFailure, onSuccess,
} = {}) => ({
  type: DELETE_USER,
  payload: {
    url: `/users/${id}`,
    method: 'delete',
    ...options,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for user delete failure.
 * @method
 * @param {Object[]} errors - list of errors returned from response
 * @return {{
 *   type: string,
 *   errors: [{details: string, status: string}]
 * }}
 */
const deleteUserFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: DELETE_USER_FAILURE,
  errors: data,
});

/**
 * Creates action for user delete success.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const deleteUserSuccess = data => ({
  type: DELETE_USER_SUCCESS,
  data,
});

const createPartnerUser = ({
  partnerId, data, options, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_PARTNER_USER,
  payload: {
    url: `/partners/${partnerId}/users`,
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const createPartnerUserFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: CREATE_PARTNER_USER_FAILURE,
  errors: data,
});

const createPartnerUserSuccess = data => ({
  type: CREATE_PARTNER_USER_SUCCESS,
  data,
});

const updatePartnerUser = ({
  partnerId, id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: UPDATE_PARTNER_USER,
  payload: {
    url: `/partners/${partnerId}/users/${id}`,
    method: 'put',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const setPartnerUserBlocked = ({
  partnerId, id, blocked, options, onFailure, onSuccess,
} = {}) => ({
  type: UPDATE_PARTNER_USER,
  payload: {
    url: `/partners/${partnerId}/users/${id}/blocked`,
    method: 'patch',
    ...options,
    data: { blocked },
  },
  onFailure,
  onSuccess,
});

const updatePartnerUserFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: UPDATE_PARTNER_USER_FAILURE,
  errors: data,
});

const updatePartnerUserSuccess = data => ({
  type: UPDATE_PARTNER_USER_SUCCESS,
  data,
});

const changePartnerUserPassword = ({
  partnerId, id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: CHANGE_PARTNER_USER_PASSWORD,
  payload: {
    url: `/partners/${partnerId}/users/${id}/password`,
    method: 'patch',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const changePartnerUserPasswordFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: CHANGE_PARTNER_USER_PASSWORD_FAILURE,
  errors: data,
});

const changePartnerUserPasswordSuccess = data => ({
  type: CHANGE_PARTNER_USER_PASSWORD_SUCCESS,
  data,
});

const deletePartnerUser = ({
  partnerId, id, options, onFailure, onSuccess,
} = {}) => ({
  type: DELETE_PARTNER_USER,
  payload: {
    url: `/partners/${partnerId}/users/${id}`,
    method: 'delete',
    ...options,
  },
  onFailure,
  onSuccess,
});

const deletePartnerUserFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: DELETE_PARTNER_USER_FAILURE,
  errors: data,
});

const deletePartnerUserSuccess = data => ({
  type: DELETE_PARTNER_USER_SUCCESS,
  data,
});

const fetchPartnerUsers = ({
  partnerId, options, onFailure, onSuccess,
} = {}) => ({
  type: FETCH_PARTNER_USERS,
  payload: {
    url: `/partners/${partnerId}/users`,
    method: 'get',
    ...options,
  },
  onFailure,
  onSuccess,
});

const fetchPartnerUsersFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: FETCH_PARTNER_USERS_FAILURE,
  errors: data,
});

const fetchPartnerUsersSuccess = data => ({
  type: FETCH_PARTNER_USERS_SUCCESS,
  data,
});

const createPartnerUsher = ({
  partnerId, data, options, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_PARTNER_USHER,
  payload: {
    url: `/partners/${partnerId}/ushers`,
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const createPartnerUsherFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: CREATE_PARTNER_USHER_FAILURE,
  errors: data,
});

const createPartnerUsherSuccess = data => ({
  type: CREATE_PARTNER_USHER_SUCCESS,
  data,
});

const updatePartnerUsher = ({
  partnerId, id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: UPDATE_PARTNER_USHER,
  payload: {
    url: `/partners/${partnerId}/ushers/${id}`,
    method: 'patch',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const setPartnerUsherBlocked = ({
  partnerId, id, blocked, options, onFailure, onSuccess,
} = {}) => ({
  type: UPDATE_PARTNER_USHER,
  payload: {
    url: `/partners/${partnerId}/ushers/${id}/blocked`,
    method: 'patch',
    ...options,
    data: { blocked },
  },
  onFailure,
  onSuccess,
});

const updatePartnerUsherFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: UPDATE_PARTNER_USHER_FAILURE,
  errors: data,
});

const updatePartnerUsherSuccess = data => ({
  type: UPDATE_PARTNER_USHER_SUCCESS,
  data,
});

const changePartnerUsherPassword = ({
  partnerId, id, data, options, onFailure, onSuccess,
} = {}) => ({
  type: CHANGE_PARTNER_USHER_PASSWORD,
  payload: {
    url: `/partners/${partnerId}/ushers/${id}/password`,
    method: 'patch',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

const changePartnerUsherPasswordFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: CHANGE_PARTNER_USHER_PASSWORD_FAILURE,
  errors: data,
});

const changePartnerUsherPasswordSuccess = data => ({
  type: CHANGE_PARTNER_USHER_PASSWORD_SUCCESS,
  data,
});

const deletePartnerUsher = ({
  partnerId, id, options, onFailure, onSuccess,
} = {}) => ({
  type: DELETE_PARTNER_USHER,
  payload: {
    url: `/partners/${partnerId}/ushers/${id}`,
    method: 'delete',
    ...options,
  },
  onFailure,
  onSuccess,
});

const deletePartnerUsherFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: DELETE_PARTNER_USHER_FAILURE,
  errors: data,
});

const deletePartnerUsherSuccess = data => ({
  type: DELETE_PARTNER_USHER_SUCCESS,
  data,
});

const fetchPartnerUshers = ({
  partnerId, options, onFailure, onSuccess,
} = {}) => ({
  type: FETCH_PARTNER_USHERS,
  payload: {
    url: `/partners/${partnerId}/ushers`,
    method: 'get',
    ...options,
  },
  onFailure,
  onSuccess,
});

const fetchPartnerUshersFailure = ({ data = defaultInitialState.errors } = {}) => ({
  type: FETCH_PARTNER_USHERS_FAILURE,
  errors: data,
});

const fetchPartnerUshersSuccess = data => ({
  type: FETCH_PARTNER_USHERS_SUCCESS,
  data,
});

export const actions = {
  changePartnerUserPassword,
  changePartnerUserPasswordFailure,
  changePartnerUserPasswordSuccess,
  changePartnerUsherPassword,
  changePartnerUsherPasswordFailure,
  changePartnerUsherPasswordSuccess,
  changePassword,
  changePasswordFailure,
  changePasswordSuccess,
  clearErrors,
  createPartnerUser,
  createPartnerUserFailure,
  createPartnerUserSuccess,
  createPartnerUsher,
  createPartnerUsherFailure,
  createPartnerUsherSuccess,
  deletePartnerUser,
  deletePartnerUserFailure,
  deletePartnerUserSuccess,
  deletePartnerUsher,
  deletePartnerUsherFailure,
  deletePartnerUsherSuccess,
  resetEmail,
  resetEmailFailure,
  resetEmailSuccess,
  deleteUser,
  deleteUserFailure,
  deleteUserSuccess,
  fetchPartnerUsers,
  fetchPartnerUsersFailure,
  fetchPartnerUsersSuccess,
  fetchPartnerUshers,
  fetchPartnerUshersFailure,
  fetchPartnerUshersSuccess,
  setPartnerUserBlocked,
  setPartnerUsherBlocked,
  updatePartnerUser,
  updatePartnerUserFailure,
  updatePartnerUserSuccess,
  updatePartnerUsher,
  updatePartnerUsherFailure,
  updatePartnerUsherSuccess,
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

const getUshers = state => getState(state).ushers;

const getUsers = state => getState(state).users;

export const selectors = {
  getErrors,
  getState,
  getUshers,
  getUsers,
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
        dispatch(changePasswordFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(changePasswordFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    }

    done();
  },
});

const resetEmailLogic = createLogic({
  type: [
    RESET_EMAIL,
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
        dispatch(resetEmailSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(resetEmailFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(resetEmailFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const deleteUserLogic = createLogic({
  type: [
    DELETE_USER,
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
        dispatch(deleteUserSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(deleteUserFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(deleteUserFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const createPartnerUserLogic = createLogic({
  type: [CREATE_PARTNER_USER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 201) {
        dispatch(createPartnerUserSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(createPartnerUserFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(createPartnerUserFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const updatePartnerUserLogic = createLogic({
  type: [UPDATE_PARTNER_USER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 201) {
        dispatch(updatePartnerUserSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(updatePartnerUserFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(updatePartnerUserFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const changePartnerUserPasswordLogic = createLogic({
  type: [CHANGE_PARTNER_USER_PASSWORD],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(changePartnerUserPasswordSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(changePartnerUserPasswordFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(changePartnerUserPasswordFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const deletePartnerUserLogic = createLogic({
  type: [DELETE_PARTNER_USER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(deletePartnerUserSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(deletePartnerUserFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(deletePartnerUserFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const fetchPartnerUsersLogic = createLogic({
  type: [FETCH_PARTNER_USERS],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200) {
        dispatch(fetchPartnerUsersSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(fetchPartnerUsersFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(fetchPartnerUsersFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const createPartnerUsherLogic = createLogic({
  type: [CREATE_PARTNER_USHER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 201) {
        dispatch(createPartnerUsherSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(createPartnerUsherFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(createPartnerUsherFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const updatePartnerUsherLogic = createLogic({
  type: [UPDATE_PARTNER_USHER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 201) {
        dispatch(updatePartnerUsherSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(updatePartnerUsherFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(updatePartnerUsherFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const changePartnerUsherPasswordLogic = createLogic({
  type: [CHANGE_PARTNER_USHER_PASSWORD],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(changePartnerUsherPasswordSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(changePartnerUsherPasswordFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(changePartnerUsherPasswordFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const deletePartnerUsherLogic = createLogic({
  type: [DELETE_PARTNER_USHER],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200 || status === 204) {
        dispatch(deletePartnerUsherSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(deletePartnerUsherFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(deletePartnerUsherFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

const fetchPartnerUshersLogic = createLogic({
  type: [FETCH_PARTNER_USHERS],
  async process(
    { action: { payload, onFailure, onSuccess }, httpClient, cancelled$ },
    dispatch,
    done,
  ) {
    try {
      const response = await httpClient.cancellable(payload, cancelled$);
      const { data, status } = response;

      if (status === 200) {
        dispatch(fetchPartnerUshersSuccess(data));

        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        dispatch(fetchPartnerUshersFailure(response));

        if (onFailure) {
          onFailure(response);
        }
      }
    } catch ({ response }) {
      dispatch(fetchPartnerUshersFailure(response));

      if (onFailure) {
        onFailure(response);
      }
    } finally {
      done();
    }
  },
});

export const logic = {
  changePartnerUsherPasswordLogic,
  changePartnerUserPasswordLogic,
  changePasswordLogic,
  createPartnerUsherLogic,
  createPartnerUserLogic,
  deletePartnerUsherLogic,
  deletePartnerUserLogic,
  resetEmailLogic,
  deleteUserLogic,
  fetchPartnerUshersLogic,
  fetchPartnerUsersLogic,
  updatePartnerUsherLogic,
  updatePartnerUserLogic,
};

/*
 * REDUCERS
 */

/**
 * Module's reducer function.
 * @method
 * @param {object} initialState - allows initializing reducer with custom state
 * @return {object}
 */
const reducer = (initialState = defaultInitialState) => (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_PASSWORD_FAILURE:
    case CHANGE_PARTNER_USHER_PASSWORD_FAILURE:
    case CHANGE_PARTNER_USER_PASSWORD_FAILURE:
    case CREATE_PARTNER_USHER_FAILURE:
    case CREATE_PARTNER_USER_FAILURE:
    case DELETE_PARTNER_USHER_FAILURE:
    case DELETE_PARTNER_USER_FAILURE:
    case FETCH_PARTNER_USHERS_FAILURE:
    case FETCH_PARTNER_USERS_FAILURE:
    case RESET_EMAIL_FAILURE:
    case DELETE_USER_FAILURE:
    case UPDATE_PARTNER_USHER_FAILURE:
    case UPDATE_PARTNER_USER_FAILURE:
      return {
        ...state,
        errors: action.errors,
      };
    case CHANGE_PASSWORD_SUCCESS:
    case CHANGE_PARTNER_USHER_PASSWORD_SUCCESS:
    case CHANGE_PARTNER_USER_PASSWORD_SUCCESS:
    case CREATE_PARTNER_USHER_SUCCESS:
    case CREATE_PARTNER_USER_SUCCESS:
    case DELETE_PARTNER_USHER_SUCCESS:
    case DELETE_PARTNER_USER_SUCCESS:
    case RESET_EMAIL_SUCCESS:
    case DELETE_USER_SUCCESS:
    case UPDATE_PARTNER_USHER_SUCCESS:
    case UPDATE_PARTNER_USER_SUCCESS:
    case CLEAR_ERROR:
      return {
        ...state,
        errors: initialState.errors,
      };
    case FETCH_PARTNER_USHERS_SUCCESS:
      return {
        ...state,
        errors: initialState.errors,
        ushers: action.data,
      };
    case FETCH_PARTNER_USERS_SUCCESS:
      return {
        ...state,
        errors: initialState.errors,
        users: action.data,
      };
    default:
      return state;
  }
};

export default reducer;
