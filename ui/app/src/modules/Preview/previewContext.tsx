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

import { Subject } from 'rxjs';
import { StandardAction } from '../../models/StandardAction';

// region Declarations

let hostToGuest$: Subject<StandardAction>;
let guestToHost$: Subject<StandardAction>;
let hostToHost$: Subject<StandardAction>;

// endregion

// region Exports

export function getHostToGuestBus(): Subject<StandardAction> {
  if (!hostToGuest$) {
    hostToGuest$ = new Subject<StandardAction>();
  }
  return hostToGuest$;
}

export function getGuestToHostBus(): Subject<StandardAction> {
  if (!guestToHost$) {
    guestToHost$ = new Subject<StandardAction>();
  }
  return guestToHost$;
}

export function getHostToHostBus(): Subject<StandardAction> {
  if (!hostToHost$) {
    hostToHost$ = new Subject<StandardAction>();
  }
  return hostToHost$;
}

// endregion
