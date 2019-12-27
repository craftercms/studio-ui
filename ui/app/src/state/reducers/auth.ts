import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { SESSION_TIMEOUT } from '../actions/user';

const reducer  = createReducer<GlobalState['auth']>({ active: false }, {
  [SESSION_TIMEOUT]: () => ({ active: false })
});

export default reducer;
