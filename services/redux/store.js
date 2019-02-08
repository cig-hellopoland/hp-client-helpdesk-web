import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogicMiddleware } from 'redux-logic';
import config from 'config';
import createHTTPClient from 'services/httpClient';
import rootReducer from './rootReducer';
import logic from './logic';
import getPersistedState, { subscribers as localStorageSubscribers } from './localStorage';

export default function createInitializedStore(initialState = {}) {
  const logicMiddleware = createLogicMiddleware(logic);


  const store = createStore(
    rootReducer,
    {
      ...initialState,
      ...getPersistedState(initialState),
    },
    composeWithDevTools((
      applyMiddleware((
        logicMiddleware
      ))
    )),
  );

  const httpClient = createHTTPClient(config.public.axios, store);

  logicMiddleware.addDeps({
    httpClient,
  });

  // assign httpClient to logicMiddleware instance to have an easy access to it
  logicMiddleware.httpClient = httpClient;

  store.logicMiddleware = logicMiddleware;

  // load LocalStorage subscribers
  localStorageSubscribers.forEach(subscriber => store.subscribe(subscriber(store)));

  // Uncomment to debug redux in browser console
  // logicMiddleware.monitor$.subscribe(o$ => console.log(o$));

  return store;
}
