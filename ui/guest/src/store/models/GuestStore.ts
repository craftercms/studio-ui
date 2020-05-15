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

import { EnhancedStore } from '@reduxjs/toolkit';
import { GuestStandardAction } from './GuestStandardAction';
import { Record } from '../../models/InContextEditing';
import { LookupTable } from '../../models/LookupTable';
import { StateObservable } from 'redux-observable';
import { EditingStatus } from '../../models/ICEStatus';

interface T {
  [K: string]: any
}

// TODO: Types
export interface GuestState {
  dragContext: {
    targetIndex: number;
    inZone: boolean;
    dropZone: any;
    players: any[];
    siblings: any[];
    containers: any[];
    over: any;
    prev: any;
    next: any;
    coordinates: any;
    // TODO: Dragged seems to be an ICE record, but there's code looking for dragged.path
    dragged: Record & { path?: string };
    dropZones: any;
    scrolling: boolean;
  };
  ICE_GUEST_INIT: boolean;
  status: EditingStatus;
  inEditMode: boolean;
  editable: T;
  draggable: T;
  highlighted: T;
  uploading: LookupTable<any>;
  onEvent: Function;
}

export type GuestStateObservable = StateObservable<GuestState>;
export type GuestStore = EnhancedStore<GuestState, GuestStandardAction>;
