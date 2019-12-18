import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducer from './reducers/root';
import { nou } from '../utils/object';
import Cookies from 'js-cookie';
import GlobalState from '../models/GlobalState';
import { createEpicMiddleware } from 'redux-observable';
import { StandardAction } from '../models/StandardAction';
import epic from './epics/root';

const epicMiddleware = createEpicMiddleware();
const middleware = getDefaultMiddleware({ thunk: false }).concat(epicMiddleware);

epicMiddleware.run(epic);

const store = configureStore<GlobalState, StandardAction>({
  reducer,
  middleware,
  preloadedState: createInitialState()
});

function createInitialState(): GlobalState {
  let state = {} as GlobalState;
  const script = document.querySelector('#initialState');
  if (script) {
    try {
      state = JSON.parse(script.innerHTML);
      if (nou(state.sites.active)) {
        state.sites.active = Cookies.get(state.env.SITE_COOKIE);
      }
    } catch {
      console.error('[GlobalContext] Malformed initial global state.');
    }
  } else {
    console.error('[GlobalContext] Initial global state not found.')
  }
  if (process.env.NODE_ENV === 'production') {
    script.parentNode.removeChild(script);
  }
  return state;
}

export default store;
