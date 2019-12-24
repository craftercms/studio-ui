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

import { Subject } from 'rxjs';
import ContentInstance from '../../models/ContentInstance';
import { LookupTable } from '../../models/LookupTable';
import { StandardAction } from '../../models/StandardAction';

// region Declarations

export const DRAWER_WIDTH = 240;

let hostToGuest$: Subject<StandardAction>;
let guestToHost$: Subject<StandardAction>;
let hostToHost$: Subject<StandardAction>;

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

// endregion

export function getHostToGuestBus() {
  if (!hostToGuest$) {
    hostToGuest$ = new Subject<StandardAction>();
  }
  return hostToGuest$;
}

export function getGuestToHostBus() {
  if (!guestToHost$) {
    guestToHost$ = new Subject<StandardAction>();
  }
  return guestToHost$;
}

export function getHostToHostBus() {
  if (!hostToHost$) {
    hostToHost$ = new Subject<StandardAction>();
  }
  return hostToHost$;
}
