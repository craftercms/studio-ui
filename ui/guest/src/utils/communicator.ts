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
import StandardAction from '@craftercms/studio-ui/models/StandardAction';

export const message$: Observable<StandardAction> = fromEvent<MessageEvent>(window, 'message').pipe(
  filter((e) => Boolean(e.data?.type)),
  map((e) => e.data),
  share()
);

const meta = { craftercms: true, source: 'guest' };
const prepareAction = (type: string | StandardAction, payload?: any) =>
  typeof type === 'object' ? { ...type, meta } : { type, payload, meta };

interface PostFunction {
  (action: StandardAction): void;
  (type: string, payload?: any): void;
}

export const post: PostFunction = (type, payload?) => window.parent.postMessage(prepareAction(type, payload), '*');

export function fromTopic(type: string): Observable<StandardAction> {
  return message$.pipe(filter((e) => e.type === type));
}
