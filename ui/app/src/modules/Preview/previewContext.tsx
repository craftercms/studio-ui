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

import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { Subject } from 'rxjs';
import ContentInstance from '../../models/ContentInstance';
import { LookupTable } from '../../models/LookupTable';
import { StandardAction } from '../../models/StandardAction';

// region Declarations

export const DRAWER_WIDTH = 240;

const PreviewContext = React.createContext<PreviewContextValue>(undefined);
let hostToGuest$: Subject<StandardAction>;
let GuestToHost$: Subject<StandardAction>;

// endregion

// region Types

export interface EditSelection {
  modelId: string;
  fieldId: string[];
  index: number;
}

export interface GuestData {
  url: string;
  origin: string;
  location: string;
  models: LookupTable<ContentInstance>;
  modelId: string;
  selected: EditSelection[];
  itemBeingDragged: boolean;
}

type PreviewProviderProps = PropsWithChildren<{
  site?: string;
  url?: string;
}>;

interface PreviewContextValue {
  hostToGuest$: Subject<StandardAction>;
  guestToHost$: Subject<StandardAction>;
}

// endregion

export function getHostToGuestBus() {
  if (!hostToGuest$) {
    hostToGuest$ = new Subject<StandardAction>();
  }
  return hostToGuest$;
}

export function getGuestToHostBus() {
  if (!GuestToHost$) {
    GuestToHost$ = new Subject<StandardAction>();
  }
  return GuestToHost$;
}

export function usePreviewContext() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error(`usePreviewContext should be used inside a PreviewProvider`);
  }
  return context;
}

export function PreviewProvider(props: PreviewProviderProps) {
  const value = useMemo<PreviewContextValue>(() => ({
    hostToGuest$: getHostToGuestBus(),
    guestToHost$: getGuestToHostBus()
  }), []);
  return <PreviewContext.Provider value={value} {...props} />;
}
