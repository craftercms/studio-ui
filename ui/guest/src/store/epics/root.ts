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

import { ActionsObservable, combineEpics, Epic, ofType } from 'redux-observable';
import { GuestStandardAction } from '../models/GuestStandardAction';
import { filter, ignoreElements, map, mapTo, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { not } from '../../utils/util';
import { post } from '../../utils/communicator';
import * as iceRegistry from '../../classes/ICERegistry';
import { dragOk, unwrapEvent } from '../util';
import * as contentController from '../../classes/ContentController';
import { merge, NEVER, of, Subject } from 'rxjs';
import { clearAndListen$, destroyDragSubjects, dragover$, escape$, initializeDragSubjects } from '../subjects';
import { initTinyMCE } from '../../controls/rte';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  CLEAR_CONTENT_TREE_FIELD_SELECTED,
  CLEAR_SELECTED_ZONES,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  CONTENT_TREE_FIELD_SELECTED,
  CONTENT_TREE_SWITCH_FIELD_INSTANCE,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  DESKTOP_ASSET_DRAG_ENDED,
  DESKTOP_ASSET_DRAG_STARTED,
  DESKTOP_ASSET_DROP,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_STARTED,
  EditingStatus,
  HighlightMode,
  ICE_ZONE_SELECTED,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED,
  TRASHED
} from '../../constants';
import { MouseEventActionObservable } from '../models/Actions';
import { GuestState, GuestStateObservable } from '../models/GuestStore';
import { isNullOrUndefined, notNullOrUndefined, pluckProps, reversePluckProps } from '../../utils/object';
import { ElementRecord, ICEProps } from '../../models/InContextEditing';
import * as ElementRegistry from '../../classes/ElementRegistry';
import { get } from '../../classes/ElementRegistry';
import { scrollToElement, scrollToIceProps } from '../../utils/dom';

const epic: Epic<GuestStandardAction, GuestStandardAction, GuestState> = combineEpics.apply(this, [
  function multiEventPropagationStopperEpic(action$: MouseEventActionObservable, state$: GuestStateObservable) {
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
          const e = unwrapEvent<DragEvent>(event);
          e.dataTransfer.setData('text/plain', `${record.id}`);
          const image = document.querySelector('craftercms-dragged-element');
          e.dataTransfer.setDragImage(image, 20, 20);
          return initializeDragSubjects(state$);
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
        if (dragOk(state.status) && !state.dragContext?.scrolling && state.dragContext.players.includes(element)) {
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
        if (dragOk(state.status) && !state.dragContext.invalidDrop) {
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
                const record = iceRegistry.getById(dropZone.iceId);
                contentController.updateField(record.modelId, record.fieldId, record.index, dragContext.dragged.path);
              }
              break;
            }
            case EditingStatus.SORTING_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                moveComponent(dragContext);
                // return of({ type: 'move_component' });
              }
              break;
            }
            case EditingStatus.PLACING_NEW_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                const { targetIndex, contentType, dropZone } = dragContext;
                const record = iceRegistry.getById(dropZone.iceId);

                setTimeout(() => {
                  contentController.insertComponent(
                    record.modelId,
                    record.fieldId,
                    record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
                    contentType
                  );
                });
                // return of({ type: 'insert_component' });
              }
              break;
            }
            case EditingStatus.PLACING_DETACHED_COMPONENT: {
              if (notNullOrUndefined(dragContext.targetIndex)) {
                const { targetIndex, instance, dropZone } = dragContext;
                const record = iceRegistry.getById(dropZone.iceId);

                setTimeout(() => {
                  contentController.insertInstance(
                    record.modelId,
                    record.fieldId,
                    record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
                    instance
                  );
                });
                // return of({ type: 'insert_instance' });
              }
              break;
            }
            case EditingStatus.UPLOAD_ASSET_FROM_DESKTOP: {
              if (dragContext.inZone) {
                const file = unwrapEvent<DragEvent>(event).dataTransfer.files[0];
                const stream$ = new Subject();
                const reader = new FileReader();
                reader.onload = ((aImg: HTMLImageElement) => (event) => {
                  post(DESKTOP_ASSET_DROP, {
                    dataUrl: event.target.result,
                    name: file.name,
                    type: file.type,
                    record: reversePluckProps(record, 'element')
                  });
                  aImg.src = event.target.result;
                  // Timeout gives the browser a chance to render the image so later rect
                  // calculations are working with the updated paint.
                  setTimeout(() => {
                    stream$.next({ type: DESKTOP_ASSET_UPLOAD_STARTED, payload: { record } });
                    stream$.complete();
                    stream$.unsubscribe();
                  });
                })(record.element as HTMLImageElement);
                reader.readAsDataURL(file);
                return stream$;
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

  // region dragend_listener
  (action$: MouseEventActionObservable) => {
    return action$.pipe(
      ofType(ASSET_DRAG_ENDED, COMPONENT_DRAG_ENDED, COMPONENT_INSTANCE_DRAG_ENDED, DESKTOP_ASSET_DRAG_ENDED),
      map(() => ({ type: 'computed_dragend' }))
    );
  },
  // endregion

  // region click
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('click'),
      withLatestFrom(state$),
      filter(([, state]) => state.status === EditingStatus.LISTENING),
      switchMap(([action, state]) => {
        const { record } = action.payload;
        const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
        const draggable = ElementRegistry.getDraggable(record.id);
        const validations = field?.validations;
        const type = field?.type;
        const iceZoneSelected = () => {
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
        };
        if (state.highlightMode === HighlightMode.ALL) {
          switch (type) {
            case 'html':
            case 'text':
            case 'textarea': {
              if (!window.tinymce) {
                alert(
                  'Looks like tinymce is not added on the page. ' +
                    'Please add tinymce on to the page to enable editing.'
                );
              } else if (not(validations?.readOnly?.value)) {
                return initTinyMCE(record, validations);
              }
              return NEVER;
            }
            default: {
              return iceZoneSelected();
            }
          }
        } else if (draggable) {
          return iceZoneSelected();
        } else {
          return NEVER;
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

  // region Desktop Asset Upload (Complete)
  (action$: ActionsObservable<GuestStandardAction<{ path: string; record: ElementRecord }>>) => {
    return action$.pipe(
      ofType(DESKTOP_ASSET_UPLOAD_COMPLETE),
      tap((action) => {
        const { record, path } = action.payload;
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

  // region content_type_receptacles_request
  (action$: ActionsObservable<GuestStandardAction<{ contentTypeId: string }>>) => {
    return action$.pipe(
      ofType(CONTENT_TYPE_RECEPTACLES_REQUEST),
      tap((action) => {
        const { contentTypeId } = action.payload;
        const receptacles = iceRegistry.getContentTypeReceptacles(contentTypeId).map((item) => {
          let { elementRecordId } = ElementRegistry.compileDropZone(item.id);
          let highlight = ElementRegistry.getHoverData(elementRecordId);
          return {
            modelId: item.modelId,
            fieldId: item.fieldId,
            label: highlight.label,
            id: item.id,
            contentTypeId
          };
        });
        post({
          type: CONTENT_TYPE_RECEPTACLES_RESPONSE,
          payload: { contentTypeId, receptacles }
        });
      }),
      ignoreElements()
    );
  },
  // endregion

  // region Start listening
  (action$: MouseEventActionObservable) => {
    return action$.pipe(
      ofType('start_listening'),
      tap(() => post(CLEAR_SELECTED_ZONES)),
      ignoreElements()
    );
  },
  // endregion

  // region TRASHED
  (action$: ActionsObservable<GuestStandardAction<{ iceId: number }>>) => {
    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    return action$.pipe(
      ofType(TRASHED),
      tap((action) => {
        const { iceId } = action.payload;
        let { modelId, fieldId, index } = iceRegistry.getById(iceId);
        contentController.deleteItem(modelId, fieldId, index);
        post({ type: INSTANCE_DRAG_ENDED });
      }),
      // There's a raise condition where sometimes the dragend is
      // fired and sometimes is not upon dropping on the rubbish bin.
      // Manually firing here may incur in double firing of computed_dragend
      // in those occasions.
      mapTo({ type: 'computed_dragend' })
    );
  },
  // endregion

  // region drop_zone_enter
  (action$: ActionsObservable<GuestStandardAction<{ elementRecordId: number }>>, state$: GuestStateObservable) => {
    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    return action$.pipe(
      ofType('drop_zone_enter'),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { elementRecordId } = action.payload;
        const { validations } = state.dragContext.dropZones.find(
          (dropZone) => dropZone.elementRecordId === elementRecordId
        );
        Object.values(validations).forEach((validation) => {
          post({ type: 'VALIDATION_MESSAGE', payload: validation });
        });
      }),
      ignoreElements()
    );
  },
  // endregion

  // region drop_zone_leave
  (action$: ActionsObservable<GuestStandardAction<{ elementRecordId: number }>>, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType('drop_zone_leave'),
      withLatestFrom(state$),
      tap(([action, state]) => {
        if (!state.dragContext) {
          return;
        }
        const { elementRecordId } = action.payload;
        const { validations } = state.dragContext.dropZones.find(
          (dropZone) => dropZone.elementRecordId === elementRecordId
        );
        if (validations.minCount) {
          post({ type: INSTANCE_DRAG_ENDED });
        }
        Object.values(validations).forEach((validation) => {
          // We dont want to show a validation message for maxCount on Leaving Dropzone
          if (validations.maxCount) {
            return;
          }
          post({ type: 'VALIDATION_MESSAGE', payload: validation });
        });
      }),
      ignoreElements()
    );
  },
  // endregion

  // region hostComponentDragStarted
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType(COMPONENT_DRAG_STARTED),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const contentType = state.dragContext.contentType;
        if (isNullOrUndefined(contentType.id)) {
          console.error('No contentTypeId found for this drag instance.');
        } else {
          if (state.dragContext.dropZones.length === 0) {
            post({
              type: 'VALIDATION_MESSAGE',
              payload: {
                id: 'receptaclesNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              }
            });
          }
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region host_instance_drag_started
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType(COMPONENT_INSTANCE_DRAG_STARTED),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        if (isNullOrUndefined(state.dragContext.instance.craftercms.contentTypeId)) {
          console.error('No contentTypeId found for this drag instance.');
        } else {
          if (state.dragContext.dropZones.length === 0) {
            post({
              type: 'VALIDATION_MESSAGE',
              payload: {
                id: 'receptaclesNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              }
            });
          }
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region asset_drag_started
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType(ASSET_DRAG_STARTED),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        if (isNullOrUndefined(state.dragContext.dragged.path)) {
          console.error('No path found for this drag asset.');
        } else {
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region desktop_asset_drag_started
  (action$: MouseEventActionObservable, state$: GuestStateObservable) => {
    return action$.pipe(
      ofType(DESKTOP_ASSET_DRAG_STARTED),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        if (isNullOrUndefined(state.dragContext.dragged)) {
          console.error('No file found for this drag asset.');
        } else {
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion

  // region content_tree_field_selected
  (action$: ActionsObservable<GuestStandardAction<{ iceProps: ICEProps; scrollElement: string; name: string }>>) => {
    return action$.pipe(
      ofType(CONTENT_TREE_FIELD_SELECTED),
      switchMap((action) => {
        const { iceProps, scrollElement, name } = action.payload;

        if (scrollToIceProps(iceProps, scrollElement)) {
          return escape$.pipe(
            takeUntil(clearAndListen$),
            map(() => ({ type: CLEAR_CONTENT_TREE_FIELD_SELECTED })),
            take(1)
          );
        } else {
          post({
            type: 'VALIDATION_MESSAGE',
            payload: { id: 'registerNotFound', level: 'suggestion', values: { name } }
          });
          return NEVER;
        }
      })
    );
  },

  (
    action$: ActionsObservable<GuestStandardAction<{ type: string; scrollElement: string }>>,
    state$: GuestStateObservable
  ) => {
    return action$.pipe(
      ofType(CONTENT_TREE_SWITCH_FIELD_INSTANCE),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { scrollElement } = action.payload;
        let registryEntryId = state.fieldSwitcher.registryEntryIds[state.fieldSwitcher.currentElement];
        scrollToElement(get(registryEntryId).element, scrollElement);
      }),
      ignoreElements()
    );
  }
  // endregion

  // region ice_zone_selected

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
    draggedElementIndex = parseInt(draggedElementIndex.substr(draggedElementIndex.lastIndexOf('.') + 1), 10);
  }

  const containerRecord = iceRegistry.getById(originDropZone.iceId);

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
          containerRecord.fieldId.includes('.') ? `${containerRecord.index}.${targetIndex}` : targetIndex
        );
      });
    }
  } else {
    // Different drop zone: Move identified

    const rec = iceRegistry.getById(dropZone.iceId);

    // Chrome didn't trigger the dragend event
    // without the set timeout.
    setTimeout(() => {
      contentController.moveItem(
        containerRecord.modelId,
        containerRecord.fieldId,
        containerRecord.fieldId.includes('.') ? `${containerRecord.index}.${draggedElementIndex}` : draggedElementIndex,
        rec.modelId,
        rec.fieldId,
        rec.fieldId.includes('.') ? `${rec.index}.${targetIndex}` : targetIndex
      );
    }, 20);
  }
};
