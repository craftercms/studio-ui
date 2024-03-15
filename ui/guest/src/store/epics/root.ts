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
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { not } from '../../utils/util';
import { post } from '../../utils/communicator';
import * as iceRegistry from '../../iceRegistry';
import { getById, getReferentialEntries, isTypeAcceptedAsByField } from '../../iceRegistry';
import { beforeWrite$, checkIfLockedOrModified, dragOk, unwrapEvent, getMoveComponentInfo } from '../util';
import * as contentController from '../../contentController';
import {
  createContentInstance,
  getCachedModel,
  getCachedModels,
  getCachedSandboxItem,
  getModelIdFromInheritedField,
  isInheritedField,
  modelHierarchyMap
} from '../../contentController';
import { interval, merge, NEVER, Observable, of, Subscriber } from 'rxjs';
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
  instanceDragBegun,
  instanceDragEnded,
  snackGuestMessage,
  trashed
} from '@craftercms/studio-ui/state/actions/preview';
import { MouseEventActionObservable } from '../models/Actions';
import { GuestState } from '../models/GuestStore';
import { notNullOrUndefined, nullOrUndefined } from '@craftercms/studio-ui/utils/object';
import { ElementRecord, ICEProps } from '../../models/InContextEditing';
import * as ElementRegistry from '../../elementRegistry';
import { get, getElementFromICEProps } from '../../elementRegistry';
import { scrollToElement } from '../../utils/dom';
import {
  computedDragEnd,
  desktopAssetDragEnded,
  desktopAssetDragStarted,
  desktopAssetUploadComplete,
  desktopAssetUploadFailed,
  desktopAssetUploadProgress,
  desktopAssetUploadStarted,
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
import { extractCollectionItem } from '@craftercms/studio-ui/utils/model';
import { getParentModelId } from '../../utils/ice';
import { unlockItem } from '@craftercms/studio-ui/state/actions/content';
import StandardAction from '@craftercms/studio-ui/models/StandardAction';
import { validateActionPolicy } from '@craftercms/studio-ui/services/sites';
import { processPathMacros } from '@craftercms/studio-ui/utils/path';
import { uploadDataUrl } from '@craftercms/studio-ui/services/content';
import { getRequestForgeryToken } from '@craftercms/studio-ui/utils/auth';
import { ensureSingleSlash } from '@craftercms/studio-ui/utils/string';

const createReader$ = (file: File) =>
  new Observable((subscriber: Subscriber<ProgressEvent<FileReader>>) => {
    const reader = new FileReader();
    let closed = false;
    reader.onload = (event) => {
      if (!closed) {
        subscriber.next(event);
        subscriber.complete();
      }
    };
    reader.readAsDataURL(file);
    return () => {
      closed = true;
      subscriber.complete();
    };
  });

const epic = combineEpics<GuestStandardAction, GuestStandardAction, GuestState>(
  // region mouseover, mouseleave
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
      ofType('mouseover', 'mouseleave'),
      withLatestFrom(state$),
      filter((args) => args[1].status === EditingStatus.LISTENING),
      tap(([action, state]: [action: GuestStandardAction, state: GuestState]) =>
        action.payload.event.stopPropagation()
      ),
      ignoreElements()
    ),
  // endregion
  // region dragstart
  (action$: MouseEventActionObservable, state$) =>
    action$.pipe(
      ofType('dragstart'),
      withLatestFrom(state$),
      switchMap(([action, state]: [action: GuestStandardAction, state: GuestState]) => {
        const {
          payload: { event, record }
        } = action;
        const iceId = state.draggable?.[record.id];
        const { isLocked, isExternallyModified } = checkIfLockedOrModified(state, record);
        if (isLocked || isExternallyModified) {
          return NEVER;
        } else if (nullOrUndefined(iceId)) {
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
          document.documentElement.classList.add(dragAndDropActiveClass);
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
      tap(([action, state]: [action: GuestStandardAction, state: GuestState]) => {
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
          map(() => desktopAssetDragEnded()),
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
      switchMap(([action, state]: [action: GuestStandardAction, state: GuestState]) => {
        const {
          payload: { event, record }
        } = action;
        event.preventDefault();
        event.stopPropagation();
        const status = state.status;
        const dragContext = state.dragContext;
        const file = unwrapEvent<DragEvent>(event).dataTransfer.files[0];

        const models = getCachedModels();
        const dropZone = dragContext.dropZone;

        // If dropzone doesn't exist it means that the item was dropped in an invalid section
        // so there should be no lock or other actions.
        if (dropZone) {
          const { modelId } = iceRegistry.getById(dropZone.iceId);
          // get parentModelId in case the current dropZone is an embedded component
          const parentModelId = getParentModelId(modelId, models, modelHierarchyMap);
          // if path of current model doesn't exist (current component is embedded), then use the parent model id (shared)
          const path = models[modelId].craftercms.path ?? models[parentModelId].craftercms.path;
          const cachedSandboxItem = getCachedSandboxItem(path);

          const pathToLock = record.inherited
            ? models[getModelIdFromInheritedField(modelId, record.fieldId)].craftercms.path
            : path;
          const { movedToSamePosition } = getMoveComponentInfo(dragContext);

          // If moving to the same position, there is no need of locking and other requests.
          if (movedToSamePosition) {
            post(instanceDragEnded());
            return of(computedDragEnd());
          } else {
            // TODO: In the case of "move", only locking the source dropzone currently.
            // The item unlock happens with write content API
            return beforeWrite$({
              path: pathToLock,
              site: state.activeSite,
              username: state.username,
              localItem: cachedSandboxItem
            }).pipe(
              switchMap(() => {
                switch (status) {
                  case EditingStatus.PLACING_DETACHED_ASSET: {
                    const { dropZone } = dragContext;
                    if (dropZone && dragContext.inZone) {
                      const record = iceRegistry.getById(dropZone.iceId);
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
                      post(instanceDragEnded());
                      moveComponent(dragContext);
                      return of(computedDragEnd());
                    }
                    break;
                  }
                  case EditingStatus.PLACING_NEW_COMPONENT: {
                    if (notNullOrUndefined(dragContext.targetIndex)) {
                      // `contentType` on the dragContext is the content type of the thing getting created
                      const { targetIndex, contentType, dropZone } = dragContext;
                      const record = iceRegistry.getById(dropZone.iceId);
                      const entries = getReferentialEntries(record);
                      // This assumes the validation of the type being accepted by the field has been performed prior
                      // to this running. Hence, create as embedded if accepted, otherwise create as shared.
                      const createAsEmbedded = isTypeAcceptedAsByField(entries.field, contentType.id, 'embedded');
                      const instance = createContentInstance(
                        contentType,
                        createAsEmbedded
                          ? null
                          : entries.contentType.dataSources?.find(
                              (ds) => ds.type === 'components' && ds.contentTypes.split(',').includes(contentType.id)
                            )?.baseRepoPath ?? null
                      );
                      setTimeout(() => {
                        contentController.insertComponent(
                          record.modelId,
                          record.fieldId,
                          record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
                          instance,
                          !createAsEmbedded,
                          true
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
                        contentController.insertComponent(
                          record.modelId,
                          record.fieldId,
                          record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
                          instance,
                          // Only shared components ever come through this path
                          true
                        );
                      });
                    }
                    break;
                  }
                  case EditingStatus.UPLOAD_ASSET_FROM_DESKTOP: {
                    if (dragContext.inZone) {
                      const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
                      const {
                        validations: { allowImageUpload }
                      } = field;

                      const path = allowImageUpload?.value
                        ? processPathMacros({
                            path: allowImageUpload.value,
                            objectId: record.modelId
                          })
                        : // TODO: Support path coming from content type definition
                          `/static-assets/images/${record.modelId}`;

                      return merge(
                        of(desktopAssetUploadStarted({ record })),
                        of(desktopAssetDragEnded()),
                        validateActionPolicy(state.activeSite, {
                          type: 'CREATE',
                          target: ensureSingleSlash(`${path}/${file.name}`),
                          contentMetadata: {
                            fileSize: file.size
                          }
                        }).pipe(
                          switchMap(({ allowed, modifiedValue, message }) => {
                            const aImg = record.element;
                            const originalSrc = aImg.src;
                            if (allowed) {
                              const readerObs = createReader$(file);
                              const fileName = modifiedValue
                                ? modifiedValue.replace(path, '').replace(/^\//, '')
                                : file.name;
                              return readerObs.pipe(
                                switchMap((event) => {
                                  aImg.src = event.target.result;

                                  post(snackGuestMessage({ id: 'assetUploadStarted' }));
                                  return uploadDataUrl(
                                    state.activeSite,
                                    {
                                      name: fileName,
                                      type: file.type,
                                      dataUrl: event.target.result
                                    },
                                    path,
                                    getRequestForgeryToken()
                                  ).pipe(
                                    switchMap((action) => {
                                      if (action.type === 'progress') {
                                        const { progress } = action.payload;
                                        const percentage = Math.floor(
                                          parseInt(((progress.bytesUploaded / progress.bytesTotal) * 100).toFixed(2))
                                        );
                                        return of(
                                          desktopAssetUploadProgress({
                                            record,
                                            percentage
                                          })
                                        );
                                      } else {
                                        if (modifiedValue) {
                                          post(snackGuestMessage({ id: message }));
                                        }
                                        return of(
                                          desktopAssetUploadComplete({
                                            record,
                                            path: `${path}${path.endsWith('/') ? '' : '/'}${fileName}`
                                          })
                                        );
                                      }
                                    }),
                                    catchError(() => {
                                      aImg.src = originalSrc;
                                      post(
                                        snackGuestMessage({
                                          id: 'uploadError',
                                          level: 'required'
                                        })
                                      );
                                      return of(desktopAssetUploadFailed({ record }));
                                    })
                                  );
                                })
                              );
                            } else {
                              aImg.src = originalSrc;
                              post(
                                snackGuestMessage({
                                  id: 'noPolicyComply',
                                  level: 'required',
                                  values: {
                                    fileName: file.name,
                                    detail: message
                                  }
                                })
                              );
                              return of(desktopAssetUploadFailed({ record }));
                            }
                          })
                        )
                      );
                    } else {
                      return of(desktopAssetDragEnded());
                    }
                  }
                }
                return NEVER;
              })
            );
          }
        } else {
          return NEVER;
        }
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
      switchMap(([action, state]: [action: GuestStandardAction, state: GuestState]) => {
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
      switchMap(([action, state]: [action: GuestStandardAction, state: GuestState]) => {
        const { record, event } = action.payload;
        const { isLocked, isExternallyModified } = checkIfLockedOrModified(state, record);
        if (isLocked || isExternallyModified) {
          return NEVER;
        } else if (state.highlightMode === HighlightMode.ALL && state.status === EditingStatus.LISTENING) {
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

                const pathToLock = isInheritedField(modelId, field.id)
                  ? models[getModelIdFromInheritedField(modelId, field.id)].craftercms.path
                  : path;

                return beforeWrite$({
                  path: pathToLock,
                  site: state.activeSite,
                  username: state.username,
                  localItem: cachedSandboxItem
                }).pipe(switchMap(() => initTinyMCE(pathToLock, record, validations, type === 'html' ? setup : {})));
              }
              break;
            }
            default: {
              const sources: Observable<StandardAction>[] = [
                escape$.pipe(
                  takeUntil(clearAndListen$),
                  tap(() => post(clearSelectedZones.type)),
                  map(() => startListening()),
                  take(1)
                ),
                of(setEditingStatus({ status: EditingStatus.FIELD_SELECTED }))
              ];
              // Rapid clicking (double-clicking) outside an RTE will cause the normal
              // FIELD_SELECTED status but without a previous mouseover setting the highlight.
              if (Object.values(state.highlighted).length === 0) {
                sources.unshift(of({ type: 'mouseover', payload: { record, event } }));
              }
              return merge(...sources);
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
        document.documentElement.classList.remove(dragAndDropActiveClass);
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
      map(() => computedDragEnd())
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
          post(snackGuestMessage(validation));
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
          post(snackGuestMessage(validation));
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
              snackGuestMessage({
                id: 'dropTargetsNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              })
            );
          } else {
            document.documentElement.classList.add(dragAndDropActiveClass);
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
              snackGuestMessage({
                id: 'dropTargetsNotFound',
                level: 'info',
                values: { contentType: state.dragContext.contentType.name }
              })
            );
          } else {
            document.documentElement.classList.add(dragAndDropActiveClass);
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
            snackGuestMessage({
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
    originDropZone = dropZones.find((dropZone) => dropZone.origin);
  const containerRecord = iceRegistry.getById(originDropZone.iceId);
  const {
    movedToSameZone,
    movedToSamePosition,
    draggedElementIndex,
    targetIndex: newTargetIndex
  } = getMoveComponentInfo(dragContext);
  targetIndex = newTargetIndex;

  // Determine whether the component is to be sorted or moved.
  if (movedToSameZone) {
    if (!movedToSamePosition) {
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
    } else {
      // if draggedElementIndex equals targetIndex it means that item wasn't moved, but it was locked, so it needs
      // to be unlocked.
      const models = contentController.getCachedModels();
      const id = dragged.modelId;
      const path = models[id].craftercms.path;
      post(unlockItem({ path }));
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
