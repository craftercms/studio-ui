import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';
import { SESSION_TIMEOUT } from '../actions/user';
import {
  LOG_IN,
  LOG_IN_COMPLETE,
  LOG_IN_FAILED,
  VALIDATE_SESSION,
  VALIDATE_SESSION_COMPLETE,
  VALIDATE_SESSION_FAILED
} from '../actions/auth';

const reducer = createReducer<GlobalState['auth']>(
  {
    error: null,
    active: false,
    isFetching: false
  },
  {
    [VALIDATE_SESSION]: (state) => ({ ...state, isFetching: true }),
    [VALIDATE_SESSION_COMPLETE]: (state, { payload: active }) => ({ ...state, isFetching: false, active }),
    [VALIDATE_SESSION_FAILED]: (state) => ({ ...state, isFetching: false }),
    [SESSION_TIMEOUT]: (state) => ({ ...state, active: false }),
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
    })
  }
);

export default reducer;
