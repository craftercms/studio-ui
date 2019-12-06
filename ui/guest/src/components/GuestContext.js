/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useContext, useMemo, useReducer } from 'react';
import { foo } from '../util';

export const GuestContext = React.createContext({

  ICE_GUEST_INIT: false,

  onEvent: foo,
  register: foo,
  deregister: foo,

  inEditMode: false,
  status: 'OFF',

  dragged: {},
  editable: {},
  draggable: {},
  highlighted: {}

});

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {

    default:
      return state;
  }
};

const INITIAL_STATE = {

};

export function useGuestContext() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error(`useGuestContext should be used inside a GuestContextProvider`);
  }
  return context;
}

export function GuestContextProvider(props) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const value = useMemo(() => [state, dispatch], [state]);
  return (
    <GuestContext.Provider value={value} {...props}/>
  );
}
