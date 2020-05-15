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

import { combineEpics, Epic, ofType } from 'redux-observable';
import { GuestStandardAction } from '../models/GuestStandardAction';
import {
  debounceTime,
  filter,
  ignoreElements,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom
} from 'rxjs/operators';
import { not } from '../../utils/util';
import { post } from '../../communicator';
import iceRegistry from '../../classes/ICERegistry';
import { dragOk, unwrapEvent } from '../util';
import contentController from '../../classes/ContentController';
import { merge, NEVER, of } from 'rxjs';
import {
  clearAndListen$,
  destroyDragSubjects,
  dragover$,
  escape$,
  initializeDragSubjects,
  scrolling$
} from '../subjects';
import { initTinyMCE } from '../../rte';
import {
  CLEAR_SELECTED_ZONES,
  DESKTOP_ASSET_DROP,
  ICE_ZONE_SELECTED,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED
} from '../../constants';
import { MouseEventActionObservable } from '../models/Actions';
import { GuestState, GuestStateObservable } from '../models/GuestStore';
import { EditingStatus } from '../../models/ICEStatus';
import { isNullOrUndefined, notNullOrUndefined, pluckProps } from '../../utils/object';

const epic: Epic<GuestStandardAction, GuestStandardAction, GuestState> = combineEpics.apply(this, [
  function multiEventPropagationStopperEpic(
    action$: MouseEventActionObservable,
    state$: GuestStateObservable
  ) {
    return action$.pipe(
      ofType('mouseover', 'mouseleave'),
      withLatestFrom(state$),
      filter((args) => args[1].status === EditingStatus.LISTENING),
      tap(([action]) => action.payload.event.stopPropagation()),
      ignoreElements()
    );
  },

  // region mouseover
  // Propagation stopped by multiEventPropagationStopperEpic
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region mouseleave
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region dragstart
  // Propagation stopped by multiEventPropagationStopperEpic
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('dragstart'),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const {
          payload: { event, record }
        } = action;
        const iceId = state.draggable?.[record.id];
        if (isNullOrUndefined(iceId)) {
          console.error('No ice id found for this drag instance.');
        } else if (not(iceId)) {
          // Items that browser make draggable by default (images, etc)
          console.warn("Element is draggable but wasn't set draggable by craftercms");
        } else {
          event.stopPropagation();
          post({ type: INSTANCE_DRAG_BEGUN, payload: iceId });
          unwrapEvent<DragEvent>(event).dataTransfer.setData('text/plain', null);
          initializeDragSubjects();
          return merge(
            dragover$().pipe(
              throttleTime(100),
              map((payload) => ({ type: 'computed_dragover', payload }))
            ),
            scrolling$().pipe(
              throttleTime(200),
              withLatestFrom(state$),
              filter(([, state]) => !state.dragContext?.scrolling),
              map(() => ({ type: 'scrolling' }))
            ),
            // Scrolling ended
            scrolling$().pipe(
              // Emit values from scroll$ only after 200ms have
              // passed without another source emission should give
              // us the end of scrolling.
              debounceTime(200),
              map(() => ({ type: 'scrolling_stopped' }))
            )
          );
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region dragover
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('dragover'),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const {
          payload: { event, record }
        } = action;
        let { element } = record;
        if (
          dragOk(state.status) &&
          !state.dragContext?.scrolling &&
          state.dragContext.players.includes(element)
        ) {
          event.preventDefault();
          event.stopPropagation();
          dragover$().next({ event, record });
        }
      }),
      ignoreElements()
    );
  },
  // endregion

  // region dragleave
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region drop
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('drop'),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        if (dragOk(state.status)) {
          const {
            payload: { event, record }
          } = action;
          event.preventDefault();
          event.stopPropagation();
          const status = state.status;
          const dragContext = state.dragContext;
          switch (status) {
            case EditingStatus.PLACING_DETACHED_ASSET: {
              const { dropZone } = dragContext;
              if (dropZone && dragContext.inZone) {
                const record = iceRegistry.recordOf(dropZone.iceId);
                contentController.updateField(
                  record.modelId,
                  record.fieldId,
                  record.index,
                  dragContext.dragged.path
                );
              }
              break;
            }
            case EditingStatus.SORTING_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                moveComponent(dragContext);
              }
              break;
            }
            case EditingStatus.PLACING_NEW_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                return of({ type: 'insert_component' });
              }
              break;
            }
            case EditingStatus.PLACING_DETACHED_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                return of({ type: 'insert_instance' });
              }
              break;
            }
            case EditingStatus.UPLOAD_ASSET_FROM_DESKTOP: {
              if (dragContext.inZone) {
                const file = unwrapEvent<DragEvent>(event).dataTransfer.files[0];
                const reader = new FileReader();
                reader.onload = ((aImg: HTMLImageElement) => (event) => {
                  post(DESKTOP_ASSET_DROP, {
                    dataUrl: event.target.result,
                    name: file.name,
                    type: file.type,
                    modelId: record.modelId,
                    elementZoneId: record.id
                  });
                  aImg.src = event.target.result;
                })(record.element as HTMLImageElement);
                reader.readAsDataURL(file);
                return of({ type: 'computed_dragend' });
              }
              break;
            }
          }
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region dragend
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('dragend'),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        if (dragOk(state.status)) {
          action.payload.event.stopPropagation();
          post({ type: INSTANCE_DRAG_ENDED });
          return of({ type: 'computed_dragend' });
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region click
  // endregion

  // region hostComponentDragStarted
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('host_component_drag_started'),
      withLatestFrom(state$),
      switchMap(([action, state]) => {

        return NEVER;
      })
    );
  },
  // endregion

  // Dispatches stuff. Needs store access.
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('click'),
      withLatestFrom(state$),
      filter(([, state]) => state.status === EditingStatus.LISTENING),
      switchMap(([action]) => {
        const { record } = action.payload;
        const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
        const type = field?.type;
        switch (type) {
          case 'html':
          case 'text':
          case 'textarea': {
            if (!window.tinymce) {
              alert(
                'Looks like tinymce is not added on the page. ' +
                  'Please add tinymce on to the page to enable editing.'
              );
              return NEVER;
            } else {
              initTinyMCE(record);
              return of({ type: 'edit_component_inline' });
            }
          }
          default: {
            post(ICE_ZONE_SELECTED, pluckProps(record, 'modelId', 'index', 'fieldId'));
            return merge(
              escape$.pipe(
                takeUntil(clearAndListen$),
                tap(() => post(CLEAR_SELECTED_ZONES)),
                map(() => ({ type: 'start_listening' })),
                take(1)
              ),
              of({ type: 'ice_zone_selected', payload: action.payload })
            );
          }
        }
      })
    );
  },
  // endregion

  // region dblclick
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region computed_dragend
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('computed_dragend'),
      tap(() => destroyDragSubjects()),
      ignoreElements()
    );
  },
  // endregion

  // region computed_dragover
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region Desktop Asset Upload (Complete)
  // TODO: Carry or retrieve record for these events
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('desktop_asset_upload_complete'),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { record } = action.payload;
        // TODO: Path comes from Host. This is the real payload here.
        const path = '';
        contentController.updateField(record.modelId, record.fieldId[0], record.index, path);
      }),
      ignoreElements()
    );
  },
  // endregion

  // region Desktop Asset Upload (Progress)
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region Desktop Asset Upload (Started)
  // dropEpic does what these would
  // (action$: Action$, state$: State$) => {},
  // endregion

  // region Start listening
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('start_listening'),
      tap((action) => {
        post(CLEAR_SELECTED_ZONES);
      }),
      ignoreElements()
    );
  }
  // endregion
]);

export default epic;

const moveComponent = (dragContext) => {
  let { dragged, dropZone, dropZones, targetIndex } = dragContext,
    record = dragged,
    draggedElementIndex = record.index,
    originDropZone = dropZones.find((dropZone) => dropZone.origin),
    currentDZ = dropZone.element;

  if (typeof draggedElementIndex === 'string') {
    // If the index is a string, it's a nested index with dot notation.
    // At this point, we only care for the last index piece, which is
    // the index of this item in the collection that's being manipulated.
    draggedElementIndex = parseInt(
      draggedElementIndex.substr(draggedElementIndex.lastIndexOf('.') + 1),
      10
    );
  }

  const containerRecord = iceRegistry.recordOf(originDropZone.iceId);

  // Determine whether the component is to be sorted or moved.
  if (currentDZ === originDropZone.element) {
    // Same drop zone: Sort identified

    // If moving the item down the array of items, need to account
    // for all the originally subsequent items shifting up.
    if (draggedElementIndex < targetIndex) {
      // Hence the final target index in reality is
      // the drop marker's index minus 1
      --targetIndex;
    }

    if (draggedElementIndex !== targetIndex) {
      setTimeout(() => {
        contentController.sortItem(
          containerRecord.modelId,
          containerRecord.fieldId,
          containerRecord.fieldId.includes('.')
            ? `${containerRecord.index}.${draggedElementIndex}`
            : draggedElementIndex,
          containerRecord.fieldId.includes('.')
            ? `${containerRecord.index}.${targetIndex}`
            : targetIndex
        );
      });
    }
  } else {
    // Different drop zone: Move identified

    const rec = iceRegistry.recordOf(dropZone.iceId);

    // Chrome didn't trigger the dragend event
    // without the set timeout.
    setTimeout(() => {
      contentController.moveItem(
        containerRecord.modelId,
        containerRecord.fieldId,
        containerRecord.fieldId.includes('.')
          ? `${containerRecord.index}.${draggedElementIndex}`
          : draggedElementIndex,
        rec.modelId,
        rec.fieldId,
        rec.fieldId.includes('.') ? `${rec.index}.${targetIndex}` : targetIndex
      );
    }, 20);
  }
};
