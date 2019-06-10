import reducer, {
  actions,
  apiURL,
  name,
  types,
  selectors,
  defaultInitialState,
} from './users';

/*
 * Initial state
 */
const initialState = defaultInitialState;

const appState = {
  config: {},
  [name]: initialState,
};

function onFailure() {}
function onSuccess() {}

const axiosResponseError = {
  data: {
    a: 1,
  },
  status: 500,
};

/*
 * Helper functions
 */

function generateState(data) {
  return {
    ...initialState,
    ...data,
  };
}

function generateAppState(data) {
  return {
    ...appState,
    [name]: {
      ...generateState(data),
    },
  };
}

/*
 * Tests
 */

describe('actions', () => {
  describe('using clearError', () => {
    it('should create an action to clear error from state', () => {
      const { clearError } = actions;
      const { CLEAR_ERROR } = types;
      const expectedValue = {
        type: CLEAR_ERROR,
      };

      expect(clearError()).toEqual(expectedValue);
    });
  });

  describe('using createItem', () => {
    it('should create an action with request payload', () => {
      const { createItem } = actions;
      const { CREATE_ITEM } = types;
      const data = { a: 1 };
      const options = { b: 2 };
      const expectedValue = {
        type: CREATE_ITEM,
        payload: {
          url: apiURL,
          method: 'post',
          data,
        },
      };

      expect(createItem({ data })).toEqual(expectedValue);

      expectedValue.payload = {
        ...expectedValue.payload,
        ...options,
      };

      expect(createItem({ data, options })).toEqual(expectedValue);

      expectedValue.onFailure = onFailure;
      expectedValue.onSuccess = onSuccess;

      expect(createItem({
        data, options, onFailure, onSuccess,
      })).toEqual(expectedValue);
    });

    it('should create an action for failed request', () => {
      const { createItemFailure } = actions;
      const { CREATE_ITEM_FAILURE } = types;
      const expectedValue = {
        type: CREATE_ITEM_FAILURE,
        error: {},
      };

      expect(createItemFailure()).toEqual(expectedValue);

      expectedValue.error = axiosResponseError;

      expect(createItemFailure(axiosResponseError)).toEqual(expectedValue);
    });

    it('should create an action for successful request', () => {
      const { createItemSuccess } = actions;
      const { CREATE_ITEM_SUCCESS } = types;
      const data = { a: 1 };
      const expectedValue = {
        type: CREATE_ITEM_SUCCESS,
        data,
      };

      expect(createItemSuccess(data)).toEqual(expectedValue);
    });
  });

  describe('using fetchList', () => {
    it('should create an action with request payload', () => {
      const { fetchList } = actions;
      const { FETCH_LIST } = types;
      const data = { a: 1 };
      const options = { b: 2 };
      const expectedValue = {
        type: FETCH_LIST,
        payload: {
          url: apiURL,
          method: 'get',
        },
      };

      expect(fetchList()).toEqual(expectedValue);

      expectedValue.payload = {
        ...expectedValue.payload,
        data,
        ...options,
      };

      expect(fetchList({ data, options })).toEqual(expectedValue);

      expectedValue.onFailure = onFailure;
      expectedValue.onSuccess = onSuccess;

      expect(fetchList({
        data, options, onFailure, onSuccess,
      })).toEqual(expectedValue);
    });

    it('should create an action for cancelled request', () => {
      const { fetchListCancel } = actions;
      const { FETCH_LIST_CANCEL } = types;
      const expectedValue = {
        type: FETCH_LIST_CANCEL,
      };

      expect(fetchListCancel()).toEqual(expectedValue);
    });

    it('should create an action for failed request', () => {
      const { fetchListFailure } = actions;
      const { FETCH_LIST_FAILURE } = types;
      const expectedValue = {
        type: FETCH_LIST_FAILURE,
        error: {},
      };

      expect(fetchListFailure()).toEqual(expectedValue);

      expectedValue.error = axiosResponseError;

      expect(fetchListFailure(axiosResponseError)).toEqual(expectedValue);
    });

    it('should create an action for successful request', () => {
      const { fetchListSuccess } = actions;
      const { FETCH_LIST_SUCCESS } = types;
      const data = { a: 1 };
      const expectedValue = {
        type: FETCH_LIST_SUCCESS,
        data,
      };

      expect(fetchListSuccess(data)).toEqual(expectedValue);
    });
  });
});

describe('selectors', () => {
  describe('using getState', () => {
    const { getState } = selectors;

    it(`should return ${name} state`, () => {
      expect(getState(appState)).toEqual(initialState);
    });
  });

  describe('using getError', () => {
    const { getError } = selectors;

    it('should return null if there was no error', () => {
      expect(getError(appState)).toBeNull();
    });

    it('should return some error message if there was an error', () => {
      const error = 'omg';
      const state = generateAppState({ error });

      expect(getError(state)).toEqual(error);
    });
  });

  describe('using getList', () => {
    const { getList } = selectors;

    it('should return empty array if there is no list data', () => {
      const expectedValue = [];

      expect(getList(appState)).toEqual(expectedValue);
    });

    it('should return list data', () => {
      const expectedValue = [
        { id: 1 },
        { id: 2 },
      ];
      const state = generateAppState({ list: expectedValue });

      expect(getList(state)).toEqual(expectedValue);
    });
  });
});

describe('reducer', () => {
  it('should return default initial state', () => {
    expect(reducer()(undefined, {})).toEqual(defaultInitialState);
  });

  it('should return custom initial state', () => {
    expect(reducer(initialState)(undefined, {})).toEqual(initialState);
  });

  it('should return current state if action type was not found', () => {
    expect(reducer()(undefined, { type: 'INVALID_TYPE' })).toEqual(defaultInitialState);
  });

  it('should handle CLEAR_ERROR', () => {
    const action = actions.clearError();
    const expectedValue = {
      ...defaultInitialState,
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });

  it('should handle CREATE_ITEM_FAILURE', () => {
    let action = actions.createItemFailure();
    const expectedValue = {
      ...defaultInitialState,
      error: {},
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);

    action = actions.createItemFailure(axiosResponseError);
    expectedValue.error = axiosResponseError;

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });

  it('should handle CREATE_ITEM_SUCCESS', () => {
    const action = actions.createItemSuccess();
    const expectedValue = {
      ...defaultInitialState,
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });

  it('should handle FETCH_LIST_FAILURE', () => {
    let action = actions.fetchListFailure();
    const expectedValue = {
      ...defaultInitialState,
      error: {},
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);

    action = actions.fetchListFailure(axiosResponseError);
    expectedValue.error = axiosResponseError;

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });

  it('should handle FETCH_LIST_SUCCESS', () => {
    const data = {
      config: {},
      items: [
        { id: 1 },
        { id: 2 },
      ],
    };
    const action = actions.fetchListSuccess(data);
    const expectedValue = {
      ...defaultInitialState,
      list: data.items,
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });
});
