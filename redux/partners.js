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

/**
 * Default state model.
 * @type {object}
 * @property {object|null} error - submission error
 * @property {object} item - current entity data
 * @property {object[]} list - entity list data
 */
export const defaultInitialState = {
  error: null,
  item: null,
  list: [],
};


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

/**
 * Type used for handling translation creation.
 * @type {string}
 */
const CREATE_TRANSLATION = `${prefix}CREATE_TRANSLATION`;

/**
 * Type used for handling translation creation failure.
 * @type {string}
 */
const CREATE_TRANSLATION_FAILURE = `${prefix}CREATE_TRANSLATION_FAILURE`;

/**
 * Type used for handling translation creation success.
 * @type {string}
 */
const CREATE_TRANSLATION_SUCCESS = `${prefix}CREATE_TRANSLATION_SUCCESS`;

/**
 * Type used for handling entity fetching.
 * @type {string}
 */
const FETCH_ITEM = `${prefix}FETCH_ITEM`;

/**
 * Type used for handling entity list fetching cancellation.
 * @type {string}
 */
const FETCH_ITEM_CANCEL = `${prefix}FETCH_ITEM_CANCEL`;

/**
 * Type used for handling entity fetching failure.
 * @type {string}
 */
const FETCH_ITEM_FAILURE = `${prefix}FETCH_ITEM_FAILURE`;

/**
 * Type used for handling entity fetching success.
 * @type {string}
 */
const FETCH_ITEM_SUCCESS = `${prefix}FETCH_ITEM_SUCCESS`;

/**
 * Type used for handling entity list fetching.
 * @type {string}
 */
const FETCH_LIST = `${prefix}FETCH_LIST`;

/**
 * Type used for handling entity list fetching cancellation.
 * @type {string}
 */
const FETCH_LIST_CANCEL = `${prefix}FETCH_LIST_CANCEL`;

/**
 * Type used for handling entity list fetching failure.
 * @type {string}
 */
const FETCH_LIST_FAILURE = `${prefix}FETCH_LIST_FAILURE`;

/**
 * Type used for handling entity list fetching success.
 * @type {string}
 */
const FETCH_LIST_SUCCESS = `${prefix}FETCH_LIST_SUCCESS`;

/**
 * Type used for handling entity updates.
 * @type {string}
 */
const UPDATE_ITEM = `${prefix}UPDATE_ITEM`;

/**
 * Type used for handling entity updates failure.
 * @type {string}
 */
const UPDATE_ITEM_FAILURE = `${prefix}UPDATE_ITEM_FAILURE`;

/**
 * Type used for handling entity updates success.
 * @type {string}
 */
const UPDATE_ITEM_SUCCESS = `${prefix}UPDATE_ITEM_SUCCESS`;


export const types = {
  CLEAR_ERROR,
  CREATE_ITEM,
  CREATE_ITEM_FAILURE,
  CREATE_ITEM_SUCCESS,
  CREATE_TRANSLATION,
  CREATE_TRANSLATION_FAILURE,
  CREATE_TRANSLATION_SUCCESS,
  FETCH_ITEM,
  FETCH_ITEM_CANCEL,
  FETCH_ITEM_FAILURE,
  FETCH_ITEM_SUCCESS,
  FETCH_LIST,
  FETCH_LIST_CANCEL,
  FETCH_LIST_FAILURE,
  FETCH_LIST_SUCCESS,
  UPDATE_ITEM,
  UPDATE_ITEM_FAILURE,
  UPDATE_ITEM_SUCCESS,
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
 * Creates action for successful item creation request.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const createItemSuccess = data => ({
  type: CREATE_ITEM_SUCCESS,
  data,
});

/**
 * Creates action with translation creation request details.
 * @method
 * @param {Object} params
 * @param {Object} params.data - request data
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
const createTranslation = ({
  data, options, onFailure, onSuccess,
} = {}) => ({
  type: CREATE_TRANSLATION,
  payload: {
    url: apiURL,
    method: 'post',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for item request failing.
 * @method
 * @param {Object[]} error - response body
 * @return {{ type: string, error: Object }}
 */
const createTranslationFailure = ({ data = defaultInitialState.error } = {}) => ({
  type: CREATE_TRANSLATION_FAILURE,
  error: data,
});

/**
 * Creates action for successful item request.
 * @method
 * @param {Object} data - response body
 * @return {{ type: string, data: Object }}
 */
const createTranslationSuccess = ({ data = defaultInitialState.item } = {}) => ({
  type: CREATE_TRANSLATION_SUCCESS,
  data,
});

/**
 * Creates action with item request details.
 * @method
 * @callback failureCallback
 * @callback successCallback
 * @param {number} id - item id
 * @param {Object} [options] - request config
 * @param {failureCallback} [onFailure] - failure callback
 * @param {successCallback} [onSuccess] - success callback
 * @return {{
 *   type: string,
 *   payload: {url: string, method: string},
 *   onFailure: failureCallback,
 *   onSuccess: successCallback
 * }}
 */
const fetchItem = ({
  id, options = {}, onFailure, onSuccess,
} = {}) => ({
  type: FETCH_ITEM,
  payload: {
    url: `${apiURL}/${id}`,
    method: 'get',
    ...options,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for item request cancelling.
 * @method
 * @return {{type: string}}
 */
const fetchItemCancel = () => ({
  type: FETCH_ITEM_CANCEL,
});

/**
 * Creates action for item request failing.
 * @method
 * @param {Object[]} error - response body
 * @return {{ type: string, error: Object }}
 */
const fetchItemFailure = ({ data = defaultInitialState.error } = {}) => ({
  type: FETCH_ITEM_FAILURE,
  error: data,
});

/**
 * Creates action for successful item request.
 * @method
 * @param {Object} data - response body
 * @return {{ type: string, data: Object }}
 */
const fetchItemSuccess = ({ data = defaultInitialState.item } = {}) => ({
  type: FETCH_ITEM_SUCCESS,
  data,
});

/**
 * Creates action with list request details.
 * @method
 * @param {Object} params
 * @param {Object} [params.data] - request data
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
const fetchList = ({
  data, options, onFailure, onSuccess,
} = {}) => ({
  type: FETCH_LIST,
  payload: {
    url: apiURL,
    method: 'get',
    ...options,
    data,
  },
  onFailure,
  onSuccess,
});

/**
 * Creates action for list request cancelling.
 * @method
 * @return {{type: string}}
 */
const fetchListCancel = () => ({
  type: FETCH_LIST_CANCEL,
});

/**
 * Creates action for list request failing.
 * @method
 * @param {Object} params - axios response schema
 * @param params.data - response body
 * @param params.status - response status
 * @return {{
 *   type: string,
 *   error: {data, status: number}
 * }}
 */
const fetchListFailure = ({ data, status } = {}) => ({
  type: FETCH_LIST_FAILURE,
  error: {
    data,
    status,
  },
});

/**
 * Creates action for successful list request.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const fetchListSuccess = data => ({
  type: FETCH_LIST_SUCCESS,
  data,
});

/**
 * Creates action with item update request details.
 * @method
 * @param {Object} params
 * @param {Object} id - item id
 * @param {Object} data - request body
 * @param {Object} pathParams - URL path params
 * @param {Object} [options] - request config
 * @param {failureCallback} [onFailure] - failure callback
 * @param {successCallback} [onSuccess] - success callback
 * @return {{
 *   type: string,
 *   payload: {url: string, method: string, data: *, options: *},
 *   onFailure: failureCallback,
 *   onSuccess: successCallback
 * }}
 */
const updateItem = ({
  id, data, pathParams, options, onFailure, onSuccess,
} = {}) => {
  let path = '';

  if (pathParams) {
    path = Object.entries(pathParams).reduce((acc, [key, value]) => `${acc}/${key}/${value}`, '');
  }

  return ({
    type: UPDATE_ITEM,
    payload: {
      url: `${apiURL}/${id}${path}`,
      method: 'put',
      ...options,
      data,
    },
    onFailure,
    onSuccess,
  });
};

/**
 * Creates action for item update request failing.
 * @method
 * @param {Object} data - response body
 * @return {{
 *   type: string,
 *   error: {Object}
 * }}
 */
const updateItemFailure = ({ data = defaultInitialState.error } = {}) => ({
  type: UPDATE_ITEM_FAILURE,
  error: data,
});

/**
 * Creates action for successful item update request.
 * @method
 * @param {Object} data - response body
 * @return {{type: string, data: *}}
 */
const updateItemSuccess = ({ data = defaultInitialState.item } = {}) => ({
  type: UPDATE_ITEM_SUCCESS,
  data,
});

export const actions = {
  clearError,
  createItem,
  createItemFailure,
  createItemSuccess,
  createTranslation,
  createTranslationFailure,
  createTranslationSuccess,
  fetchItem,
  fetchItemCancel,
  fetchItemFailure,
  fetchItemSuccess,
  fetchList,
  fetchListCancel,
  fetchListFailure,
  fetchListSuccess,
  updateItem,
  updateItemFailure,
  updateItemSuccess,
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
const getState = (state) => {
  if (!state[name]) {
    const msg = [
      `State for '${name}' not found in redux store.`,
      'Check root reducer and logic configuration.',
    ];

    throw new Error(msg.join(' '));
  }

  return state[name];
};

/**
 * Returns request error.
 * @method
 * @param {Object} state - redux state
 * @return {*}
 */
const getError = state => getState(state).error;

/**
 * Returns currently loaded Promotion.
 * @method
 * @param {Object} state - redux state
 * @return {*}
 */
const getItem = state => getState(state).item;

/**
 * Returns currently loaded entity list.
 * @method
 * @param {Object} state - redux state
 * @return {*}
 */
const getList = state => getState(state).list;

export const selectors = {
  getError,
  getItem,
  getList,
  getState,
};


/*
 * LOGIC
 */

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
    } catch (error) {
      const { response = {} } = error;

      dispatch(createItemFailure(response));

      if (onFailure) {
        onFailure();
      }
    } finally {
      done();
    }
  },
});

/**
 * Logic used for handling translation creation.
 * @method
 */
const createTranslationLogic = createLogic({
  type: [
    CREATE_TRANSLATION,
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
    } catch (error) {
      const { response = {} } = error;
      const { data } = response;

      dispatch(createItemFailure(data));

      if (onFailure) {
        onFailure();
      }
    } finally {
      done();
    }
  },
});

/**
 * Logic used for handling entity fetching.
 * @method
 */
const fetchItemLogic = createLogic({
  type: [
    FETCH_ITEM,
  ],
  cancelType: [
    FETCH_ITEM_CANCEL,
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
        dispatch(fetchItemSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(fetchItemFailure(data));

        if (onFailure) {
          onFailure();
        }
      }
    } catch (error) {
      const { response = {} } = error;
      const { data } = response;

      dispatch(fetchItemFailure(data));

      if (onFailure) {
        onFailure();
      }
    } finally {
      done();
    }
  },
});

/**
 * Logic used for handling entity list fetching.
 * @method
 */
const fetchListLogic = createLogic({
  type: [
    FETCH_LIST,
  ],
  cancelType: [
    FETCH_LIST_CANCEL,
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

      if (status === 200) {
        dispatch(fetchListSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(fetchListFailure(response));

        if (onFailure) {
          onFailure();
        }
      }
    } catch ({ response }) {
      dispatch(fetchListFailure(response));

      if (onFailure) {
        onFailure();
      }
    } finally {
      done();
    }
  },
});

/**
 * Logic used for handling entity updates.
 * @method
 */
const updateItemLogic = createLogic({
  type: [
    UPDATE_ITEM,
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

      if (status === 200 || status === 201) {
        dispatch(updateItemSuccess(data));

        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch(updateItemFailure(response));

        if (onFailure) {
          onFailure();
        }
      }
    } catch (error) {
      const { response = {} } = error;
      const { data } = response;
      dispatch(updateItemFailure(data));

      if (onFailure) {
        onFailure();
      }
    } finally {
      done();
    }
  },
});

export const logic = {
  createItemLogic,
  createTranslationLogic,
  fetchItemLogic,
  fetchListLogic,
  updateItemLogic,
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
    case CREATE_ITEM_FAILURE:
    case CREATE_TRANSLATION_FAILURE:
    case FETCH_ITEM_FAILURE:
    case FETCH_LIST_FAILURE:
    case UPDATE_ITEM_FAILURE:
      return {
        ...state,
        error: action.error,
      };
    case CLEAR_ERROR:
    case CREATE_ITEM_SUCCESS:
    case CREATE_TRANSLATION_SUCCESS:
    case UPDATE_ITEM_SUCCESS:
      return {
        ...state,
        error: initialState.error,
      };
    case FETCH_ITEM_SUCCESS:
      return {
        ...state,
        errors: initialState.errors,
        item: action.data,
      };
    case FETCH_LIST_SUCCESS:
      return {
        ...state,
        error: initialState.error,
        list: action.data.items,
      };
    default:
      return state;
  }
};

export default reducer;
