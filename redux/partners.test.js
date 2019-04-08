import reducer, {
  actions,
  types,
  defaultInitialState,
} from './partners';

/*
 * Initial state
 */
const initialState = defaultInitialState;

function onFailure() {}
function onSuccess() {}

const axiosResponseError = {
  data: {
    a: 1,
  },
  status: 500,
};

/*
 * Tests
 */

describe('actions', () => {
  it('should create an action to make create partner request', () => {
    const { createPartner } = actions;
    const { CREATE_PARTNER } = types;
    const options = { b: 2 };
    const data = {};
    const expectedValue = {
      type: CREATE_PARTNER,
      payload: {
        url: '/partners',
        method: 'post',
      },
    };

    expect(createPartner()).toEqual(expectedValue);

    expectedValue.payload = {
      ...expectedValue.payload,
      ...options,
      data,
    };

    expect(createPartner({ options, data })).toEqual(expectedValue);

    expectedValue.onFailure = onFailure;
    expectedValue.onSuccess = onSuccess;

    expect(createPartner({
      data, options, onFailure, onSuccess,
    })).toEqual(expectedValue);
  });

  it('should create an action to fail profile request', () => {
    const { createPartnerFailure } = actions;
    const { CREATE_PARTNER_FAILURE } = types;
    const expectedValue = {
      type: CREATE_PARTNER_FAILURE,
      error: {},
    };

    expect(createPartnerFailure()).toEqual(expectedValue);

    expectedValue.error = axiosResponseError;

    expect(createPartnerFailure(axiosResponseError)).toEqual(expectedValue);
  });

  it('should create an action to succeed profile request', () => {
    const { createPartnerSuccess } = actions;
    const { CREATE_PARTNER_SUCCESS } = types;
    const expectedValue = {
      type: CREATE_PARTNER_SUCCESS,
    };

    expect(createPartnerSuccess()).toEqual(expectedValue);
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

  it('should handle CREATE_PARTNER_SUCCESS', () => {
    const action = actions.createPartnerSuccess();
    const expectedValue = {
      ...defaultInitialState,
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });

  it('should handle CREATE_PARTNER_FAILURE', () => {
    let action = actions.createPartnerFailure();
    const expectedValue = {
      ...defaultInitialState,
      error: {},
    };

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);

    action = actions.createPartnerFailure(axiosResponseError);
    expectedValue.error = axiosResponseError;

    expect(reducer()(defaultInitialState, action)).toEqual(expectedValue);
  });
});
