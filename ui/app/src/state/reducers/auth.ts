import { GlobalState } from '../../models/GlobalState';
import { createReducer } from '@reduxjs/toolkit';

const reducer  = createReducer<GlobalState['auth']>({ active: false }, {

});

export default reducer;
