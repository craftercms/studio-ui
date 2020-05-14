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

import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { debounceTime, delay, filter, tap, throttleTime } from 'rxjs/operators';
import { Record } from '../models/InContextEditing';
import $ from 'jquery';
import { SyntheticEvent } from 'react';

export const clearAndListen$ = new Subject();

export const escape$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter((e) => e.key === 'Escape')
);

type DragOver$ = {
  event: DragEvent | SyntheticEvent | JQueryEventObject;
  record: Record;
};
let dragover$: Subject<DragOver$>;

const getDragOver = () => dragover$;

let scrolling$: BehaviorSubject<boolean>;
const getScrolling = () => scrolling$;

export { getDragOver as dragover$, getScrolling as scrolling$ };

export function initializeSubjects(/*dispatch*/) {

  dragover$ = new Subject<DragOver$>();
  scrolling$ = new BehaviorSubject<boolean>(false);
  // let onScroll = () => scrolling$.next(true);

  // dragover$
  //   .pipe(throttleTime(100))
  //   .subscribe((value) => {
  //     dispatch({ type: 'computed_dragover', payload: value });
  //   });

  // scrolling$
  //   .pipe(
  //     tap(() => {
  //       state?.dragContext?.inZone &&
  //       fn.onScroll()
  //     }),
  //     filter(is => is),
  //     debounceTime(200),
  //     delay(50)
  //   )
  //   .subscribe(
  //     () => {
  //       scrolling$.next(false);
  //       fn.onScrollStopped();
  //     }
  //   );

  // $(document).bind('scroll', (e) => {
  //   persistence.onScroll(e)
  // });

}

export function destroySubjects() {

  dragover$.complete();
  dragover$.unsubscribe();
  dragover$ = null;

  scrolling$.complete();
  scrolling$.unsubscribe();
  scrolling$ = null;

  // $(document).off('scroll', persistence.onScroll);
  // persistence.onScroll = null;

}
