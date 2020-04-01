import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { SESSION_TIMEOUT } from '../actions/user';
import {
  LOG_IN,
  LOG_IN_COMPLETE,
  LOG_IN_FAILED, LOG_OUT_COMPLETE,
  VALIDATE_SESSION,
  VALIDATE_SESSION_COMPLETE,
  VALIDATE_SESSION_FAILED
} from '../actions/auth';

const initialState = {
  error: null,
  active: false,
  isFetching: false
};

const reducer = createReducer<GlobalState['auth']>(
  initialState,
  {
    [VALIDATE_SESSION]: (state) => ({ ...state, isFetching: true }),
    [VALIDATE_SESSION_COMPLETE]: (state, { payload: active }) => ({ ...state, isFetching: false, active }),
    [VALIDATE_SESSION_FAILED]: (state) => ({ ...state, isFetching: false }),
    [SESSION_TIMEOUT]: () => initialState,
    [LOG_IN]: (state) => ({ ...state, isFetching: true }),
    [LOG_IN_COMPLETE]: () => ({ active: true, error: null, isFetching: true }),
    [LOG_IN_FAILED]: (state, action) => ({
      ...state,
      isFetching: false,
      error: (action.payload.status === 401) ? {
        code: 6004,
        message: 'Incorrect password',
        remedialAction: 'Please use correct password'
      } : {
        code: 1000,
        message: 'Internal System Failure',
        remedialAction: 'Please try again momentarily or contact support'
      }
    }),
    [LOG_OUT_COMPLETE]: () => initialState
  }
);

export default reducer;
