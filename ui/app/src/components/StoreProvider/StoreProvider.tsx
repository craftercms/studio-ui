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

import React, { PropsWithChildren } from 'react';
import { Resource } from '../../models/Resource';
import { CrafterCMSStore } from '../../state/store';
import { Provider } from 'react-redux';

type StoreProviderPropsA = PropsWithChildren<{ resource: Resource<CrafterCMSStore> }>;
type StoreProviderPropsB = PropsWithChildren<{ store: CrafterCMSStore }>;
export type StoreProviderProps = StoreProviderPropsA | StoreProviderPropsB;

export function StoreProvider(props: StoreProviderPropsA): JSX.Element;
export function StoreProvider(props: StoreProviderPropsB): JSX.Element;
export function StoreProvider(
  props: PropsWithChildren<{ store?: CrafterCMSStore; resource?: Resource<CrafterCMSStore> }>
) {
  const store = props.store ?? props.resource.read();
  return <Provider children={props.children} store={store} />;
}

export default StoreProvider;
