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

import { fromEvent, Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';

const useBroadcastChannel = (
  (window.parent === window) &&
  (window.BroadcastChannel !== undefined)
);

const broadcastChannel = useBroadcastChannel
  ? new BroadcastChannel('org.craftercms.accommodationChannel')
  : null;

export const message$ = fromEvent<MessageEvent>(useBroadcastChannel ? broadcastChannel : window, 'message').pipe(share());

export const post = useBroadcastChannel
  ? (type, payload?) => broadcastChannel.postMessage((typeof type === 'object') ? type : { type, payload })
  : (type, payload?) => window.parent.postMessage((typeof type === 'object') ? type : { type, payload }, '*');

export function fromTopic(type: string): Observable<{ type: string, payload?: any }> {
  return message$.pipe(
    filter((e: MessageEvent) => e.data?.type === type),
    map(e => e.data)
  );
}
