import reducer, {
  actions,
  name,
  types,
  selectors,
  defaultInitialState,
} from './partners';

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
  it('should create an action to make create item request', () => {
    const { createItem } = actions;
    const { CREATE_ITEM } = types;
    const options = { b: 2 };
    const data = {};
    const expectedValue = {
      type: CREATE_ITEM,
      payload: {
        url: '/partners',
        method: 'post',
      },
    };

    expect(createItem()).toEqual(expectedValue);

    expectedValue.payload = {
      ...expectedValue.payload,
      ...options,
      data,
    };

    expect(createItem({ options, data })).toEqual(expectedValue);

    expectedValue.onFailure = onFailure;
    expectedValue.onSuccess = onSuccess;

    expect(createItem({
      data, options, onFailure, onSuccess,
    })).toEqual(expectedValue);
  });

  it('should create an action to fail profile request', () => {
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

  it('should create an action to succeed profile request', () => {
    const { createItemSuccess } = actions;
    const { CREATE_ITEM_SUCCESS } = types;
    const expectedValue = {
      type: CREATE_ITEM_SUCCESS,
    };

    expect(createItemSuccess()).toEqual(expectedValue);
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

  it('should handle CREATE_ITEM_SUCCESS', () => {
    const action = actions.createItemSuccess();
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
});
