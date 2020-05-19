/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useContext, useMemo } from 'react';

export type GuestContextProps = {
  // onEvent: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>
  onEvent: (event, elementRegistryId?: number) => any
};

const GuestContext = React.createContext<GuestContextProps>(undefined);

export function useGuestContext(): GuestContextProps {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuestContext should be used inside a GuestContextProvider');
  }
  return context;
}

export function GuestContextProvider(props): JSX.Element {
  const value = useMemo(() => props.value, [props.value]);
  return <GuestContext.Provider {...props} value={value} />;
}
