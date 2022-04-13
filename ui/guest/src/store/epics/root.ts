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

import { combineEpics, ofType } from 'redux-observable';
import { GuestStandardAction } from '../models/GuestStandardAction';
import {
  catchError,
  filter,
  ignoreElements,
  map,
  mapTo,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { not } from '../../utils/util';
import { message$, post } from '../../utils/communicator';
import * as iceRegistry from '../../iceRegistry';
import { getById } from '../../iceRegistry';
import { dragOk, unwrapEvent } from '../util';
import * as contentController from '../../contentController';
import { getCachedModel, getCachedModels, getCachedSandboxItem, modelHierarchyMap } from '../../contentController';
import { interval, merge, NEVER, Observable, of, Subject } from 'rxjs';
import { clearAndListen$, destroyDragSubjects, dragover$, escape$, initializeDragSubjects } from '../subjects';
import { initTinyMCE } from '../../controls/rte';
import { dragAndDropActiveClass, EditingStatus, HighlightMode } from '../../constants';
import {
  assetDragEnded,
  assetDragStarted,
  clearContentTreeFieldSelected,
  clearSelectedZones,
  componentDragEnded,
  componentDragStarted,
  componentInstanceDragEnded,
  componentInstanceDragStarted,
  contentTreeFieldSelected,
  contentTreeSwitchFieldInstance,
  contentTypeDropTargetsRequest,
  contentTypeDropTargetsResponse,
  desktopAssetDrop,
  desktopAssetUploadComplete,
  desktopAssetUploadStarted,
  instanceDragBegun,
  instanceDragEnded,
  requestWorkflowCancellationDialog,
  requestWorkflowCancellationDialogOnResult,
  trashed,
  validationMessage
} from '@craftercms/studio-ui/state/actions/preview';
import { MouseEventActionObservable } from '../models/Actions';
import { GuestState } from '../models/GuestStore';
import { notNullOrUndefined, nullOrUndefined, reversePluckProps } from '@craftercms/studio-ui/utils/object';
import { ElementRecord, ICEProps } from '../../models/InContextEditing';
import * as ElementRegistry from '../../elementRegistry';
import { get, getElementFromICEProps } from '../../elementRegistry';
import { scrollToElement } from '../../utils/dom';
import {
  computedDragEnd,
  desktopAssetDragEnded,
  desktopAssetDragStarted,
  documentDragEnd,
  documentDragLeave,
  documentDragOver,
  documentDrop,
  dropzoneEnter,
  dropzoneLeave,
  exitComponentInlineEdit,
  setEditingStatus,
  startListening
} from '../actions';
import $ from 'jquery';
import { extractCollectionItem } from '@craftercms/studio-ui/utils/model';
import { getParentModelId } from '../../utils/ice';
import { fetchSandboxItem, lock } from '@craftercms/studio-ui/services/content';
import { unlockItem } from '@craftercms/studio-ui/state/actions/content';
import StandardAction from '@craftercms/studio-ui/models/StandardAction';

const epic = combineEpics<GuestStandardAction, GuestStandardAction, GuestState>(
  // region mouseover, mouseleave
  (action$, state$) =>
    action$.pipe(
      ofType('mouseover', 'mouseleave'),
      withLatestFrom(state$),
      filter((args) => args[1].status === EditingStatus.LISTENING),
      tap(([action]) => action.payload.event.stopPropagation()),
      ignoreElements()
    ),
  // endregion
  // region dragstart
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
      ofType('dragstart'),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const {
          payload: { event, record }
        } = action;
        const iceId = state.draggable?.[record.id];
        if (nullOrUndefined(iceId)) {
          // When the drag starts on a child element of the item, it passes through here.
          console.error('No ice id found for this drag instance.', record, state.draggable);
        } else if (not(iceId)) {
          // Items that browser make draggable by default (images, etc).
          console.warn("Element is draggable but wasn't set draggable by craftercms");
        } else {
          post(instanceDragBegun(iceId));
          if (event) {
            event.stopPropagation();
            const e = unwrapEvent<DragEvent>(event);
            e.dataTransfer.setData('text/plain', `${record.id}`);
            e.dataTransfer.setDragImage(document.querySelector('.craftercms-dragged-element'), 20, 20);
          }
          $('html').addClass(dragAndDropActiveClass);
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    ),
  // endregion
  // region dragover
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
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
    ),
  (action$) =>
    action$.pipe(
      ofType(documentDragOver.type),
      tap(({ payload: { event } }) => event.preventDefault()),
      ignoreElements()
    ),
  // endregion
  // region dragleave
  (action$, state$) =>
    action$.pipe(
      ofType('dragleave', documentDragLeave.type),
      withLatestFrom(state$),
      filter(([, state]) => state.status === EditingStatus.UPLOAD_ASSET_FROM_DESKTOP),
      switchMap(() =>
        interval(100).pipe(
          mapTo(desktopAssetDragEnded()),
          takeUntil(action$.pipe(ofType(documentDragOver.type, 'dragover')))
        )
      )
    ),
  // endregion
  // region drop
  (action$: MouseEventActionObservable, state$) => {
    return action$.pipe(
      ofType('drop'),
      withLatestFrom(state$),
      filter(([, state]) => dragOk(state.status) && !state.dragContext.invalidDrop),
      switchMap(([action, state]) => {
        const {
          payload: { event, record }
        } = action;
        event.preventDefault();
        event.stopPropagation();
        const status = state.status;
        const dragContext = state.dragContext;
        const file = unwrapEvent<DragEvent>(event).dataTransfer.files[0];

        const processDrop = (): Observable<StandardAction> => {
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
                post(instanceDragEnded());
                moveComponent(dragContext);
                return of(computedDragEnd());
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
                const stream$ = new Subject<StandardAction>();
                const reader = new FileReader();
                reader.onload = ((aImg: HTMLImageElement) => (event) => {
                  const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
                  post(desktopAssetDrop.type, {
                    dataUrl: event.target.result,
                    name: file.name,
                    type: file.type,
                    record: reversePluckProps(record, 'element'),
                    field
                  });
                  aImg.src = event.target.result;
                  // Timeout gives the browser a chance to render the image so later rect
                  // calculations are working with the updated paint.
                  setTimeout(() => {
                    stream$.next({ type: desktopAssetUploadStarted.type, payload: { record } });
                    stream$.next({ type: desktopAssetDragEnded.type });
                    stream$.complete();
                    stream$.unsubscribe();
                  });
                })(record.element as HTMLImageElement);
                reader.readAsDataURL(file);
                return stream$;
              } else {
                return of(desktopAssetDragEnded());
              }
            }
          }
        };

        const models = getCachedModels();
        const dropZone = dragContext.dropZone;
        const { modelId } = iceRegistry.getById(dropZone.iceId);
        const path = models[modelId].craftercms.path;
        const cachedSandboxItem = getCachedSandboxItem(path);

        // TODO: In the case of "move", only locking the source dropzone currently.
        // The item unlock happens with write content API
        return lock(state.activeSite, path).pipe(
          switchMap(() =>
            fetchSandboxItem(state.activeSite, path).pipe(
              switchMap((item) => {
                if (item.stateMap.submitted || item.stateMap.scheduled) {
                  post(
                    requestWorkflowCancellationDialog({
                      siteId: state.activeSite,
                      path
                    })
                  );
                  return message$.pipe(
                    filter((e) => e.type === requestWorkflowCancellationDialogOnResult.type),
                    take(1),
                    tap(({ payload }) => {
                      if (payload.type !== 'onContinue') {
                        post(unlockItem({ path }));
                      }
                    }),
                    filter(({ payload }) => payload.type === 'onContinue'),
                    switchMap(() => processDrop())
                  );
                } else {
                  if (item.commitId !== cachedSandboxItem.commitId) {
                    post(
                      validationMessage({
                        id: 'outOfSyncContent',
                        level: 'suggestion'
                      })
                    );
                    post(unlockItem({ path }));
                    setTimeout(() => {
                      window.location.reload();
                    });
                  } else {
                    return processDrop();
                  }
                  return NEVER;
                }
              })
            )
          ),
          catchError(({ response, status }) => {
            if (status === 409) {
              post(
                validationMessage({
                  id: 'itemLocked',
                  level: 'suggestion',
                  values: { lockOwner: response.person }
                })
              );
            }
            return NEVER;
          })
        );
      })
    );
  },
  // endregion
  // region documentDrop
  (action$, state$) =>
    action$.pipe(
      ofType(documentDrop.type),
      withLatestFrom(state$),
      switchMap(([action, state]) => {
        const {
          payload: { event }
        } = action;
        const status = state.status;
        event.preventDefault();
        event.stopPropagation();
        switch (status) {
          case EditingStatus.UPLOAD_ASSET_FROM_DESKTOP:
            return of(desktopAssetDragEnded());
          case EditingStatus.SORTING_COMPONENT:
          case EditingStatus.PLACING_NEW_COMPONENT: {
            if (status === EditingStatus.SORTING_COMPONENT) {
              post(instanceDragEnded());
            }
            return [computedDragEnd(), startListening()];
          }
          default:
            return NEVER;
        }
      })
    ),
  // endregion
  // region dragend, documentDragEnd
  (action$: MouseEventActionObservable, state$) => {
    return action$.pipe(
      ofType('dragend'),
      withLatestFrom(state$),
      filter(([, state]) => dragOk(state.status)),
      switchMap(([action]) => {
        const { event } = action.payload;
        event.preventDefault();
        event.stopPropagation();
        post(instanceDragEnded());
        return of(computedDragEnd());
      })
    );
  },
  (action$) =>
    action$.pipe(
      ofType(documentDragEnd.type),
      tap(({ payload }) => payload.event.preventDefault()),
      ignoreElements()
    ),
  // endregion
  // region assetDragEnded, componentDragEnded, componentInstanceDragEnded, desktopAssetDragEnded
  (action$: MouseEventActionObservable) =>
    action$.pipe(
      ofType(assetDragEnded.type, componentDragEnded.type, componentInstanceDragEnded.type, desktopAssetDragEnded.type),
      map(() => computedDragEnd())
    ),
  // endregion
  // region click
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
      ofType('click'),
      withLatestFrom(state$),
      filter(
        ([, state]) =>
          (state.highlightMode === HighlightMode.ALL && state.status === EditingStatus.LISTENING) ||
          (state.highlightMode === HighlightMode.MOVE_TARGETS && state.status === EditingStatus.LISTENING) ||
          (state.highlightMode === HighlightMode.MOVE_TARGETS && state.status === EditingStatus.FIELD_SELECTED)
      ),
      switchMap(([action, state]) => {
        const { record, event } = action.payload;
        if (state.highlightMode === HighlightMode.ALL && state.status === EditingStatus.LISTENING) {
          let selected = {
            modelId: null,
            fieldId: [],
            index: null,
            coordinates: { x: event.clientX, y: event.clientY }
          };
          if (getById(record.iceIds[0]).recordType === 'node-selector-item') {
            // When selecting the item on a node-selector the desired edit will be the item itself.
            // The following will send the component model id instead of the item model id
            selected.modelId = extractCollectionItem(getCachedModel(record.modelId), record.fieldId[0], record.index);
          } else {
            selected.modelId = record.modelId;
            selected.index = record.index;
            selected.fieldId = record.fieldId;
          }
          const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
          const validations = field?.validations;
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
              } else if (not(validations?.readOnly?.value)) {
                const setupId = field.properties?.rteConfiguration?.value ?? 'generic';
                const setup = state.rteConfig[setupId] ?? Object.values(state.rteConfig)[0] ?? {};
                // Only pass rte setup to html type, text/textarea (plaintext) controls won't show full rich-text-editing.

                const models = getCachedModels();
                const modelId = action.payload.record.modelId;
                const parentModelId = getParentModelId(modelId, models, modelHierarchyMap);
                const path = models[parentModelId ?? modelId].craftercms.path;
                const cachedSandboxItem = getCachedSandboxItem(path);

                return lock(state.activeSite, path).pipe(
                  switchMap(() => {
                    return fetchSandboxItem(state.activeSite, path).pipe(
                      switchMap((item) => {
                        if (item.stateMap.submitted || item.stateMap.scheduled) {
                          post(
                            requestWorkflowCancellationDialog({
                              siteId: state.activeSite,
                              path
                            })
                          );
                          return message$.pipe(
                            filter((e) => e.type === requestWorkflowCancellationDialogOnResult.type),
                            take(1),
                            switchMap(({ payload }) => {
                              if (payload.type === 'onContinue') {
                                return initTinyMCE(path, record, validations, type === 'html' ? setup : {});
                              } else {
                                post(unlockItem({ path }));
                                return NEVER;
                              }
                            })
                          );
                        } else if (item.commitId !== cachedSandboxItem.commitId) {
                          post(
                            validationMessage({
                              id: 'outOfSyncContent',
                              level: 'suggestion'
                            })
                          );
                          post(unlockItem({ path }));
                          window.location.reload();
                          return NEVER;
                        } else {
                          return initTinyMCE(path, record, validations, type === 'html' ? setup : {});
                        }
                      })
                    );
                  }),
                  catchError(({ response, status }) => {
                    if (status === 409) {
                      post(
                        validationMessage({
                          id: 'itemLocked',
                          level: 'suggestion',
                          values: { lockOwner: response.person }
                        })
                      );
                    }
                    return NEVER;
                  })
                );
              }
              break;
            }
            default: {
              return merge(
                escape$.pipe(
                  takeUntil(clearAndListen$),
                  tap(() => post(clearSelectedZones.type)),
                  map(() => startListening()),
                  take(1)
                ),
                of(setEditingStatus({ status: EditingStatus.FIELD_SELECTED }))
              );
            }
          }
        } else if (state.highlightMode === HighlightMode.MOVE_TARGETS && state.status === EditingStatus.LISTENING) {
          const movableRecordId = iceRegistry.getMovableParentRecord(record.iceIds[0]);
          if (notNullOrUndefined(movableRecordId)) {
            // Inform host of the field selection
            // post();
            // By this point element is already highlighted. We just need to freeze
            // and change mode to reveal the move/sort options.
            return merge(
              escape$.pipe(
                takeUntil(clearAndListen$),
                // TODO: stop & map to startListening when any pivoting action occurs
                // takeUntil(action$.pipe(ofType(componentInstanceDragStarted.type))),
                tap(() => post(clearSelectedZones.type)),
                map(() => startListening()),
                take(1)
              ),
              of(setEditingStatus({ status: EditingStatus.FIELD_SELECTED }))
            );
          }
        } else if (
          state.status === EditingStatus.FIELD_SELECTED &&
          state.highlightMode === HighlightMode.MOVE_TARGETS
        ) {
          const movableRecordId = iceRegistry.getMovableParentRecord(record.iceIds[0]);
          if (state.highlighted[movableRecordId] === void 0) {
            post(clearSelectedZones.type);
            return of(startListening());
          }
        }
        // Note: Returning NEVER will unsubscribe from any previous stream returned on a prior click.
        return NEVER;
      })
    ),
  // endregion
  // region computedDragEnd
  (action$: MouseEventActionObservable) =>
    action$.pipe(
      ofType(computedDragEnd.type),
      tap(() => {
        $('html').removeClass(dragAndDropActiveClass);
        destroyDragSubjects();
      }),
      ignoreElements()
    ),
  // endregion
  // region desktopAssetUploadComplete
  (action$: Observable<GuestStandardAction<{ path: string; record: ElementRecord }>>) => {
    return action$.pipe(
      ofType(desktopAssetUploadComplete.type),
      tap((action) => {
        const { record, path } = action.payload;
        contentController.updateField(record.modelId, record.fieldId[0], record.index, path);
      }),
      ignoreElements()
    );
  },
  // endregion
  // region contentTypeDropTargetsRequest
  (action$: Observable<GuestStandardAction<{ contentTypeId: string }>>) => {
    return action$.pipe(
      ofType(contentTypeDropTargetsRequest.type),
      tap((action) => {
        const { contentTypeId } = action.payload;
        const dropTargets = iceRegistry.getContentTypeDropTargets(contentTypeId).map((item) => {
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
        post(contentTypeDropTargetsResponse({ contentTypeId, dropTargets }));
      }),
      ignoreElements()
    );
  },
  // endregion
  // region startListening
  (action$: MouseEventActionObservable) => {
    return action$.pipe(
      ofType(startListening.type),
      tap(() => post(clearSelectedZones.type)),
      ignoreElements()
    );
  },
  // endregion
  // region trashed
  (action$: Observable<GuestStandardAction<{ iceId: number }>>) => {
    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    return action$.pipe(
      ofType(trashed.type),
      tap((action) => {
        const { iceId } = action.payload;
        let { modelId, fieldId, index } = iceRegistry.getById(iceId);
        contentController.deleteItem(modelId, fieldId, index);
        post(instanceDragEnded());
      }),
      // There's a raise condition where sometimes the dragend is
      // fired and sometimes is not upon dropping on the rubbish bin.
      // Manually firing here may incur in double firing of computed_dragend
      // in those occasions.
      mapTo(computedDragEnd())
    );
  },
  // endregion
  // region dropzoneEnter
  (action$: Observable<GuestStandardAction<{ elementRecordId: number }>>, state$) => {
    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    return action$.pipe(
      ofType(dropzoneEnter.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { elementRecordId } = action.payload;
        const { validations } = state.dragContext.dropZones.find(
          (dropZone) => dropZone.elementRecordId === elementRecordId
        );
        Object.values(validations).forEach((validation) => {
          post(validationMessage(validation));
        });
      }),
      ignoreElements()
    );
  },
  // endregion
  // region dropzoneLeave
  (action$: Observable<GuestStandardAction<{ elementRecordId: number }>>, state$) => {
    return action$.pipe(
      ofType(dropzoneLeave.type),
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
          post({ type: instanceDragEnded.type });
        }
        Object.values(validations).forEach((validation) => {
          // We dont want to show a validation message for maxCount on Leaving Dropzone
          if (validations.maxCount) {
            return;
          }
          post(validationMessage(validation));
        });
      }),
      ignoreElements()
    );
  },
  // endregion
  // region componentDragStarted
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
      ofType(componentDragStarted.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        const contentType = state.dragContext.contentType;
        if (nullOrUndefined(contentType.id)) {
          console.error('No contentTypeId found for this drag instance.');
        } else {
          if (state.dragContext.dropZones.length === 0) {
            post(
              validationMessage({
                id: 'dropTargetsNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              })
            );
          } else {
            $('html').addClass(dragAndDropActiveClass);
            return initializeDragSubjects(state$);
          }
        }
        return NEVER;
      })
    ),
  // endregion
  // region componentInstanceDragStarted
  (action$: MouseEventActionObservable, state$) => {
    return action$.pipe(
      ofType(componentInstanceDragStarted.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        if (nullOrUndefined(state.dragContext.instance.craftercms.contentTypeId)) {
          console.error('No contentTypeId found for this drag instance.');
        } else {
          if (state.dragContext.dropZones.length === 0) {
            post(
              validationMessage({
                id: 'dropTargetsNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              })
            );
          } else {
            $('html').addClass(dragAndDropActiveClass);
            return initializeDragSubjects(state$);
          }
        }
        return NEVER;
      })
    );
  },
  // endregion
  // region assetDragStarted
  (action$: MouseEventActionObservable, state$) => {
    return action$.pipe(
      ofType(assetDragStarted.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        if (nullOrUndefined(state.dragContext.dragged.path)) {
          console.error('No path found for this drag asset.');
        } else {
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion
  // region desktopAssetDragStarted
  (action$: MouseEventActionObservable, state$) => {
    return action$.pipe(
      ofType(desktopAssetDragStarted.type),
      withLatestFrom(state$),
      switchMap(([, state]) => {
        if (nullOrUndefined(state.dragContext.dragged)) {
          console.error('No file found for this drag asset.');
        } else {
          return initializeDragSubjects(state$);
        }
        return NEVER;
      })
    );
  },
  // endregion
  // region contentTreeFieldSelected
  (action$: Observable<GuestStandardAction<{ iceProps: ICEProps; scrollElement: string; name: string }>>) => {
    return action$.pipe(
      ofType(contentTreeFieldSelected.type),
      switchMap((action) => {
        const { iceProps, scrollElement, name } = action.payload;
        const element = getElementFromICEProps(iceProps.modelId, iceProps.fieldId, iceProps.index);
        if (scrollToElement(element, scrollElement)) {
          return escape$.pipe(
            takeUntil(clearAndListen$),
            map(() => clearContentTreeFieldSelected()),
            take(1)
          );
        } else {
          post(
            validationMessage({
              id: 'registerNotFound',
              level: 'suggestion',
              values: { name }
            })
          );
          return NEVER;
        }
      })
    );
  },
  // endregion
  // region contentTreeSwitchFieldInstance
  (action$: Observable<GuestStandardAction<{ type: string; scrollElement: string }>>, state$) => {
    return action$.pipe(
      ofType(contentTreeSwitchFieldInstance.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const { scrollElement } = action.payload;
        let registryEntryId = state.fieldSwitcher.registryEntryIds[state.fieldSwitcher.currentElement];
        scrollToElement(get(registryEntryId).element, scrollElement);
      }),
      ignoreElements()
    );
  },
  // endregion
  // region exitComponentInlineEdit
  (action$: Observable<GuestStandardAction<{ path: string; saved: boolean }>>) => {
    return action$.pipe(
      ofType(exitComponentInlineEdit.type),
      tap((action) => {
        const { path, saved } = action.payload;
        // When the content is saved, the api1/write-content api unlocks
        !saved && path && post(unlockItem({ path }));
      }),
      ignoreElements()
    );
  }
  // endregion
);

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

export default epic;
