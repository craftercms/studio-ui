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

import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';
import { Record } from '../models/InContextEditing';
import { SyntheticEvent } from 'react';

type DragOver$ = {
  event: DragEvent | SyntheticEvent | JQueryMouseEventObject | Event;
  record: Record;
};

export const clearAndListen$ = new Subject();

export const escape$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter((e) => e.key === 'Escape')
);

let dragover$: Subject<DragOver$>;
const getDragOver = () => dragover$;

let killSignal$: Subject<void>;
let scrolling$: Observable<Event>;
const getScrolling = () => scrolling$;

export { getDragOver as dragover$, getScrolling as scrolling$ };

export function initializeDragSubjects() {
  killSignal$ = new Subject();
  dragover$ = new Subject<DragOver$>();
  scrolling$ = fromEvent(document, 'scroll').pipe(takeUntil(killSignal$), share());
}

export function destroyDragSubjects() {

  // scrolling$ is terminated by killSignal$
  killSignal$.next();
  killSignal$.complete();
  killSignal$.unsubscribe();
  killSignal$ = null;

  dragover$.complete();
  dragover$.unsubscribe();
  dragover$ = null;

}
