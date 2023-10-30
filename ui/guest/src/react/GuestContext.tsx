/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { GuestState } from '../store/models/GuestStore';
import { createDispatchHook, createSelectorHook, createStoreHook, ReactReduxContextValue } from 'react-redux';
import { Dispatch, Store } from 'redux';
import { HighlightMode, StandardAction } from '@craftercms/studio-ui/models';
import { GuestStandardAction } from '../store/models/GuestStandardAction';

export type GuestContextProps = {
  hasHost: boolean;
  editMode: boolean;
  draggable: GuestState['draggable'];
  highlightMode: HighlightMode;
  // onEvent: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onEvent: (event, elementRegistryId?: number) => any;
};

export const GuestReduxContext: React.Context<ReactReduxContextValue> =
  React.createContext<ReactReduxContextValue>(null);
if (process.env.NODE_ENV !== 'production') {
  GuestReduxContext.displayName = 'GuestRedux';
}

export const useDispatch: () => Dispatch<StandardAction> = createDispatchHook(GuestReduxContext);

export const useSelector = createSelectorHook(GuestReduxContext);

export const useStore: () => Store<GuestState, StandardAction> = createStoreHook(GuestReduxContext);

const GuestContext = React.createContext<GuestContextProps>(null);

export function useGuestContext(): GuestContextProps {
  return useContext(GuestContext);
}

export function useIsAuthoring(): boolean {
  const context = useGuestContext();
  return Boolean(context?.editMode && context.hasHost);
}

export function GuestContextProvider(props): JSX.Element {
  const value = useMemo(() => props.value, [props.value]);
  return <GuestContext.Provider {...props} value={value} />;
}
