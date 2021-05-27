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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  changeCurrentUrl,
  checkInGuest,
  checkOutGuest,
  CLEAR_SELECTED_ZONES,
  clearSelectForEdit,
  COMPONENT_INSTANCE_HTML_REQUEST,
  COMPONENT_INSTANCE_HTML_RESPONSE,
  CONTENT_TYPE_DROP_TARGETS_RESPONSE,
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  DELETE_ITEM_OPERATION_COMPLETE,
  DESKTOP_ASSET_DROP,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_PROGRESS,
  DESKTOP_ASSET_UPLOAD_STARTED,
  EDIT_MODE_CHANGED,
  FETCH_GUEST_MODEL,
  fetchGuestModelComplete,
  fetchPrimaryGuestModelComplete,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  GUEST_SITE_LOAD,
  guestModelUpdated,
  HOST_CHECK_IN,
  ICE_ZONE_SELECTED,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  INSERT_ITEM_OPERATION,
  INSERT_OPERATION_COMPLETE,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED,
  MOVE_ITEM_OPERATION,
  pushToolsPanelPage,
  selectForEdit,
  setContentTypeDropTargets,
  setHighlightMode,
  setItemBeingDragged,
  setPreviewChoice,
  setPreviewEditMode,
  SORT_ITEM_OPERATION,
  SORT_ITEM_OPERATION_COMPLETE,
  TRASHED,
  UPDATE_FIELD_VALUE_OPERATION,
  VALIDATION_MESSAGE
} from '../../state/actions/preview';
import {
  deleteItem,
  fetchComponentInstanceHTML,
  fetchContentInstance,
  fetchContentInstanceDescriptor,
  insertComponent,
  insertInstance,
  moveItem,
  sortItem,
  updateField,
  uploadDataUrl
} from '../../services/content';
import { filter, map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import ContentType from '../../models/ContentType';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import Button from '@material-ui/core/Button';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from './previewContext';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useActiveUser,
  useContentTypes,
  useItemsByPath,
  useMount,
  usePreviewState,
  useSelection
} from '../../utils/hooks';
import { findParentModelId, nnou, pluckProps } from '../../utils/object';
import RubbishBin from './Tools/RubbishBin';
import { useSnackbar } from 'notistack';
import { PreviewCompatibilityDialogContainer } from '../../components/Dialogs/PreviewCompatibilityDialog';
import { getQueryVariable } from '../../utils/path';
import {
  getStoredClipboard,
  getStoredEditModeChoice,
  getStoredHighlightModeChoice,
  getStoredPreviewToolsPanelPage,
  removeStoredClipboard
} from '../../utils/state';
import { restoreClipboard } from '../../state/actions/content';
import EditFormPanel from './Tools/EditFormPanel';
import {
  createChildModelLookup,
  getComputedEditMode,
  normalizeModel,
  normalizeModelsLookup,
  parseContentXML
} from '../../utils/content';
import moment from 'moment-timezone';
import ContentInstance from '../../models/ContentInstance';
import LookupTable from '../../models/LookupTable';
import { getModelIdFromInheritedField, isInheritedField } from '../../utils/model';
import { fetchGlobalProperties, setProperties } from '../../services/users';
import Snackbar from '@material-ui/core/Snackbar';
import CloseRounded from '@material-ui/icons/CloseRounded';
import IconButton from '@material-ui/core/IconButton';

const guestMessages = defineMessages({
  maxCount: {
    id: 'validations.maxCount',
    defaultMessage: 'The max number of items is {maxCount}'
  },
  minCount: {
    id: 'validations.minCount',
    defaultMessage: 'The min number of items is {minCount}'
  },
  required: {
    id: 'validations.required',
    defaultMessage: '{field} is required'
  },
  maxLength: {
    id: 'validations.maxLength',
    defaultMessage: 'The max length ({maxLength}) reached'
  },
  yes: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  registerNotFound: {
    id: 'register.notFound',
    defaultMessage: '{name} is not visible or was not registered by developers'
  },
  dropTargetsNotFound: {
    id: 'register.dropTargetsNotFound',
    defaultMessage: 'There are no drop targets for {contentType} components'
  },
  sortOperationComplete: {
    id: 'operations.sortOperationComplete',
    defaultMessage: 'Sort operation completed.'
  },
  sortOperationFailed: {
    id: 'operations.sortOperationFailed',
    defaultMessage: 'Sort operation failed.'
  },
  insertOperationComplete: {
    id: 'operations.insertOperationComplete',
    defaultMessage: 'Insert component operation completed.'
  },
  insertOperationFailed: {
    id: 'operations.insertOperationFailed',
    defaultMessage: 'Insert component operation failed.'
  },
  insertItemOperation: {
    id: 'operations.insertItemOperation',
    defaultMessage: 'Insert item operation not implemented.'
  },
  moveOperationComplete: {
    id: 'operations.moveOperationComplete',
    defaultMessage: 'Move operation completed'
  },
  moveOperationFailed: {
    id: 'operations.moveOperationFailed',
    defaultMessage: 'Move operation failed.'
  },
  deleteOperationComplete: {
    id: 'operations.deleteOperationComplete',
    defaultMessage: 'Delete operation completed.'
  },
  deleteOperationFailed: {
    id: 'operations.deleteOperationFailed',
    defaultMessage: 'Delete operation failed.'
  },
  updateOperationComplete: {
    id: 'operations.updateOperationComplete',
    defaultMessage: 'Update operation completed.'
  },
  updateOperationFailed: {
    id: 'operations.updateOperationFailed',
    defaultMessage: 'Update operation failed.'
  },
  assetUploadStarted: {
    id: 'operations.assetUploadStarted',
    defaultMessage: 'Asset upload started.'
  },
  assetUploadFailed: {
    id: 'operations.assetUploadFailed',
    defaultMessage: 'Asset Upload failed.'
  }
});

const originalDocDomain = document.domain;

const startGuestDetectionTimeout = (timeoutRef, setShowSnackbar, timeout = 5000) => {
  clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => setShowSnackbar(true), timeout);
};

// region const issueDescriptorRequest = () => {...}
const issueDescriptorRequest = (props) => {
  const { site, path, contentTypes, requestedSourceMapPaths, flatten = true, dispatch, completeAction } = props;
  const hostToGuest$ = getHostToGuestBus();
  const guestToHost$ = getGuestToHostBus();

  fetchContentInstanceDescriptor(site, path, { flatten }, contentTypes)
    .pipe(
      // If another check in comes while loading, this request should be cancelled.
      // This may happen if navigating rapidly from one page to another (guest-side).
      takeUntil(guestToHost$.pipe(filter(({ type }) => [GUEST_CHECK_IN, GUEST_CHECK_OUT].includes(type)))),
      switchMap((obj: { model: ContentInstance; modelLookup: LookupTable<ContentInstance> }) => {
        let requests: Array<Observable<ContentInstance>> = [];
        Object.values(obj.model.craftercms.sourceMap).forEach((path) => {
          if (!requestedSourceMapPaths.current[path]) {
            requestedSourceMapPaths.current[path] = true;
            requests.push(fetchContentInstance(site, path, contentTypes));
          }
        });
        if (requests.length) {
          return forkJoin(requests).pipe(
            map((response) => {
              let lookup = obj.modelLookup;
              response.forEach((contentInstance) => {
                lookup = {
                  ...lookup,
                  [contentInstance.craftercms.id]: contentInstance
                };
              });
              return {
                ...obj,
                modelLookup: lookup
              };
            })
          );
        } else {
          return of(obj);
        }
      })
    )
    .subscribe(({ model, modelLookup }) => {
      const childrenMap = createChildModelLookup(modelLookup, contentTypes);
      const normalizedModels = normalizeModelsLookup(modelLookup);
      const normalizedModel = normalizedModels[model.craftercms.id];
      const modelIdByPath = {};
      Object.values(modelLookup).forEach((model) => {
        // Embedded components don't have a path.
        if (model.craftercms.path) {
          modelIdByPath[model.craftercms.path] = model.craftercms.id;
        }
      });
      dispatch(
        completeAction({
          model: normalizedModel,
          modelLookup: normalizedModels,
          modelIdByPath: modelIdByPath,
          childrenMap
        })
      );
      hostToGuest$.next({
        type: 'FETCH_GUEST_MODEL_COMPLETE',
        payload: {
          path,
          model: normalizedModel,
          modelLookup: normalizedModels,
          childrenMap,
          modelIdByPath: modelIdByPath
        }
      });
    });
};
// endregion

export function PreviewConcierge(props: any) {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const user = useActiveUser();
  const items = useItemsByPath();
  const { guest, currentUrl, computedUrl, editMode, highlightMode, previewChoice } = usePreviewState();
  const contentTypes = useContentTypes();
  const { authoringBase, guestBase, xsrfArgument } = useSelection((state) => state.env);
  const priorState = useRef({ site });
  const { enqueueSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const models = guest?.models;
  const modelIdByPath = guest?.modelIdByPath;
  const childrenMap = guest?.childrenMap;
  const contentTypes$ = useMemo(() => new ReplaySubject<ContentType[]>(1), []);
  const [previewCompatibilityDialogOpen, setPreviewCompatibilityDialogOpen] = useState(false);
  const requestedSourceMapPaths = useRef({});
  // Controls that the preview compatibility dialog is only shown once per this tab session (once per refresh).
  // Avoids it showing over and over when navigating studio pages.
  const previewNextCheckInNotificationRef = useRef(false);
  const handlePreviewCompatibilityDialogGo = useCallback(() => {
    window.location.href = `${authoringBase}/preview#/?page=${computedUrl}&site=${site}`;
  }, [authoringBase, computedUrl, site]);
  // guestDetectionSnackbarOpen, guestDetectionTimeout
  const guestDetectionTimeoutRef = useRef<number>();
  const [guestDetectionSnackbarOpen, setGuestDetectionSnackbarOpen] = useState(false);

  function clearSelectedZonesHandler() {
    dispatch(clearSelectForEdit());
    getHostToGuestBus().next({ type: CLEAR_SELECTED_ZONES });
  }

  // region Permissions and fetch of DetailedItem
  const currentItemPath = guest?.path;

  useEffect(() => {
    if (items[currentItemPath]) {
      getHostToGuestBus().next({
        type: EDIT_MODE_CHANGED,
        payload: { editMode: getComputedEditMode({ item: items[currentItemPath], username: user.username, editMode }) }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items[currentItemPath], editMode, user.username]);
  // endregion

  // Guest detection, document domain restoring, editMode/highlightMode preference retrieval, clipboard retrieval
  // and contentType subject cleanup.
  useMount(() => {
    const localEditMode = getStoredEditModeChoice(user.username)
      ? getStoredEditModeChoice(user.username) === 'true'
      : null;
    if (nnou(localEditMode) && editMode !== localEditMode) {
      dispatch(setPreviewEditMode({ editMode: localEditMode }));
    }

    const localHighlightMode = getStoredHighlightModeChoice(user.username);
    if (nnou(localHighlightMode) && highlightMode !== localHighlightMode) {
      dispatch(setHighlightMode({ highlightMode: localHighlightMode }));
    }

    startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);

    return () => {
      contentTypes$.complete();
      contentTypes$.unsubscribe();
      document.domain = originalDocDomain;
    };
  });

  // Retrieve stored site clipboard, retrieve stored tools panel page.
  useEffect(() => {
    const localClipboard = getStoredClipboard(site, user.username);
    if (localClipboard) {
      let hours = moment().diff(moment(localClipboard.timestamp), 'hours');
      if (hours >= 24) {
        removeStoredClipboard(site, user.username);
      } else {
        dispatch(
          restoreClipboard({
            type: localClipboard.type,
            paths: localClipboard.paths,
            sourcePath: localClipboard.sourcePath
          })
        );
      }
    }
    const storedPage = getStoredPreviewToolsPanelPage(site, user.username);
    if (storedPage) {
      dispatch(pushToolsPanelPage(storedPage));
    }
  }, [dispatch, site, user.username]);

  // Post content types
  useEffect(() => {
    contentTypes && contentTypes$.next(Object.values(contentTypes));
  }, [contentTypes, contentTypes$]);

  // guestToHost$ subscription
  useEffect(() => {
    const hostToGuest$ = getHostToGuestBus();
    const guestToHost$ = getGuestToHostBus();
    const hostToHost$ = getHostToHostBus();
    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const { type, payload } = action;
      switch (type) {
        case GUEST_SITE_LOAD:
        case GUEST_CHECK_IN:
          clearTimeout(guestDetectionTimeoutRef.current);
          setGuestDetectionSnackbarOpen(false);
          break;
      }
      switch (type) {
        case GUEST_SITE_LOAD:
          // Legacy sites (guest v1) send this message.
          let previewNextCheckInNotification = previewNextCheckInNotificationRef.current;
          let compatibilityQueryArg = getQueryVariable(window.location.search, 'compatibility');
          let compatibilityForceStay = compatibilityQueryArg === 'stay';
          let compatibilityAsk = compatibilityQueryArg === 'ask';
          if (!previewNextCheckInNotification && !compatibilityForceStay) {
            // Avoid recurrently showing the notification over and over as long as the page is not refreshed
            previewNextCheckInNotificationRef.current = true;
            if (compatibilityAsk) {
              setPreviewCompatibilityDialogOpen(true);
            }
          }
          if (previewChoice[site] !== '1') {
            fetchGlobalProperties()
              .pipe(
                switchMap((properties) =>
                  setProperties({
                    previewChoice: JSON.stringify(
                      Object.assign(JSON.parse(properties.previewChoice ?? '{}'), {
                        [site]: '1'
                      })
                    )
                  })
                )
              )
              .subscribe((k) => {
                handlePreviewCompatibilityDialogGo();
              });
          } else if (!compatibilityAsk && !compatibilityForceStay) {
            handlePreviewCompatibilityDialogGo();
          }
          break;
        case GUEST_CHECK_IN:
        case FETCH_GUEST_MODEL: {
          if (type === GUEST_CHECK_IN) {
            if (previewChoice[site] !== '2') {
              dispatch(setPreviewChoice({ site, choice: '2' }));
            }
            getHostToGuestBus().next({
              type: HOST_CHECK_IN,
              payload: { editMode: false, highlightMode }
            });
            dispatch(checkInGuest(payload));

            if (payload.documentDomain) {
              try {
                document.domain = payload.documentDomain;
              } catch (e) {
                console.error(e);
              }
            } else if (document.domain !== originalDocDomain) {
              document.domain = originalDocDomain;
            }

            if (payload.__CRAFTERCMS_GUEST_LANDING__) {
              nnou(site) && dispatch(changeCurrentUrl('/'));
            } else {
              const path = payload.path;
              // If the content types have already been loaded, contentTypes$ subject will emit
              // immediately. If not, it will emit when the content type fetch payload does arrive.
              contentTypes$.pipe(take(1)).subscribe((payload) => {
                hostToGuest$.next({ type: CONTENT_TYPES_RESPONSE, payload });
              });

              issueDescriptorRequest({
                site,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchPrimaryGuestModelComplete
              });
            }
          } /* else if (type === FETCH_GUEST_MODEL) */ else {
            if (payload.path?.startsWith('/')) {
              issueDescriptorRequest({
                site,
                path: payload.path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });
            } else {
              return console.warn(`Ignoring FETCH_GUEST_MODEL request since "${payload.path}" is not a valid path.`);
            }
          }
          break;
        }
        case GUEST_CHECK_OUT: {
          requestedSourceMapPaths.current = {};
          dispatch(checkOutGuest());
          startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);
          break;
        }
        case SORT_ITEM_OPERATION: {
          const { fieldId, currentIndex, targetIndex } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;
          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          sortItem(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            currentIndex,
            targetIndex,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            ({ updatedDocument }) => {
              const updatedModels = {};
              parseContentXML(
                updatedDocument,
                parentModelId ? models[parentModelId].craftercms.path : models[modelId].craftercms.path,
                contentTypes,
                updatedModels
              );
              dispatch(guestModelUpdated({ model: normalizeModel(updatedModels[modelId]) }));

              issueDescriptorRequest({
                site,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });
              hostToHost$.next({
                type: SORT_ITEM_OPERATION_COMPLETE,
                payload
              });
              enqueueSnackbar(formatMessage(guestMessages.sortOperationComplete));
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.sortOperationFailed));
            }
          );
          break;
        }
        case INSERT_COMPONENT_OPERATION: {
          const { fieldId, targetIndex, instance, shared } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          insertComponent(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            contentTypes[instance.craftercms.contentTypeId],
            instance,
            parentModelId ? models[parentModelId].craftercms.path : null,
            shared
          ).subscribe(
            () => {
              issueDescriptorRequest({
                site,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToGuest$.next({
                type: INSERT_OPERATION_COMPLETE,
                payload: { ...payload, currentUrl }
              });
              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationFailed));
            }
          );
          break;
        }
        case INSERT_INSTANCE_OPERATION:
          const { fieldId, targetIndex, instance } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          insertInstance(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            instance,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              issueDescriptorRequest({
                site,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationFailed));
            }
          );
          break;
        case INSERT_ITEM_OPERATION: {
          enqueueSnackbar(formatMessage(guestMessages.insertItemOperation));
          break;
        }
        case MOVE_ITEM_OPERATION: {
          const { originalFieldId, originalIndex, targetFieldId, targetIndex } = payload;
          let { originalModelId, originalParentModelId, targetModelId, targetParentModelId } = payload;

          if (isInheritedField(models[originalModelId], originalFieldId)) {
            originalModelId = getModelIdFromInheritedField(models[originalModelId], originalFieldId, modelIdByPath);
            originalParentModelId = findParentModelId(originalModelId, childrenMap, models);
          }

          if (isInheritedField(models[targetModelId], targetFieldId)) {
            targetModelId = getModelIdFromInheritedField(models[targetModelId], targetFieldId, modelIdByPath);
            targetParentModelId = findParentModelId(targetModelId, childrenMap, models);
          }

          moveItem(
            site,
            originalParentModelId ? originalModelId : models[originalModelId].craftercms.path,
            originalFieldId,
            originalIndex,
            targetParentModelId ? targetModelId : models[targetModelId].craftercms.path,
            targetFieldId,
            targetIndex,
            originalParentModelId ? models[originalParentModelId].craftercms.path : null,
            targetParentModelId ? models[targetParentModelId].craftercms.path : null
          ).subscribe(
            () => {
              enqueueSnackbar(formatMessage(guestMessages.moveOperationComplete));
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.moveOperationFailed));
            }
          );
          break;
        }
        case DELETE_ITEM_OPERATION: {
          const { fieldId, index } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          deleteItem(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              issueDescriptorRequest({
                site,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToHost$.next({
                type: DELETE_ITEM_OPERATION_COMPLETE,
                payload
              });
              enqueueSnackbar(formatMessage(guestMessages.deleteOperationComplete));
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.deleteOperationFailed));
            }
          );
          break;
        }
        case UPDATE_FIELD_VALUE_OPERATION: {
          const { fieldId, index, value } = payload;
          let { modelId, parentModelId } = payload;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          updateField(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? models[parentModelId].craftercms.path : null,
            value
          ).subscribe(
            () => {
              enqueueSnackbar(formatMessage(guestMessages.updateOperationComplete));
            },
            () => {
              enqueueSnackbar(formatMessage(guestMessages.updateOperationFailed));
            }
          );
          break;
        }
        case ICE_ZONE_SELECTED: {
          dispatch(selectForEdit(payload));
          break;
        }
        case CLEAR_SELECTED_ZONES: {
          dispatch(clearSelectForEdit());
          break;
        }
        case INSTANCE_DRAG_BEGUN:
        case INSTANCE_DRAG_ENDED: {
          dispatch(setItemBeingDragged(type === INSTANCE_DRAG_BEGUN ? payload : null));
          break;
        }
        case DESKTOP_ASSET_DROP: {
          enqueueSnackbar(formatMessage(guestMessages.assetUploadStarted));
          hostToHost$.next({ type: DESKTOP_ASSET_UPLOAD_STARTED, payload });
          const uppySubscription = uploadDataUrl(
            site,
            pluckProps(payload, 'name', 'type', 'dataUrl'),
            `/static-assets/images/${payload.record.modelId}`,
            xsrfArgument
          )
            .pipe(
              filter(({ type }) => type === 'progress'),
              pluck('payload')
            )
            .subscribe(
              ({ progress }) => {
                const percentage = Math.floor(
                  parseInt(((progress.bytesUploaded / progress.bytesTotal) * 100).toFixed(2))
                );
                hostToGuest$.next({
                  type: DESKTOP_ASSET_UPLOAD_PROGRESS,
                  payload: {
                    record: payload.record,
                    percentage
                  }
                });
              },
              (error) => {
                console.log(error);
                enqueueSnackbar(formatMessage(guestMessages.assetUploadFailed));
              },
              () => {
                hostToGuest$.next({
                  type: DESKTOP_ASSET_UPLOAD_COMPLETE,
                  payload: {
                    record: payload.record,
                    path: `/static-assets/images/${payload.record.modelId}/${payload.name}`
                  }
                });
              }
            );
          const sub = hostToHost$.subscribe((action) => {
            const { type, payload: uploadFile } = action;
            if (type === DESKTOP_ASSET_UPLOAD_STARTED && uploadFile.record.id === payload.record.id) {
              sub.unsubscribe();
              uppySubscription.unsubscribe();
            }
          });
          break;
        }
        case CONTENT_TYPE_DROP_TARGETS_RESPONSE: {
          dispatch(setContentTypeDropTargets(payload));
          break;
        }
        case COMPONENT_INSTANCE_HTML_REQUEST: {
          fetchComponentInstanceHTML(payload.path).subscribe((htmlString) => {
            hostToGuest$.next({
              type: COMPONENT_INSTANCE_HTML_RESPONSE,
              payload: { response: htmlString, id: payload.id }
            });
          });
          break;
        }
        case VALIDATION_MESSAGE: {
          enqueueSnackbar(formatMessage(guestMessages[payload.id], payload.values ?? {}), {
            variant: payload.level === 'required' ? 'error' : payload.level === 'suggestion' ? 'warning' : 'info'
          });
          break;
        }
      }
    });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [
    authoringBase,
    contentTypes$,
    contentTypes,
    currentUrl,
    computedUrl,
    dispatch,
    enqueueSnackbar,
    formatMessage,
    models,
    modelIdByPath,
    childrenMap,
    guestBase,
    site,
    xsrfArgument,
    highlightMode,
    previewChoice,
    handlePreviewCompatibilityDialogGo
  ]);

  useEffect(() => {
    if (priorState.current.site !== site) {
      priorState.current.site = site;
      startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);
      if (guest) {
        // Changing the site will force-reload the iFrame and 'beforeunload'
        // event won't trigger withing; guest won't be submitting it's own checkout
        // in such cases.
        dispatch(checkOutGuest());
      }
    }
  }, [site, guest, dispatch]);

  return (
    <>
      {props.children}
      <RubbishBin
        open={nnou(guest?.itemBeingDragged)}
        onTrash={() => getHostToGuestBus().next({ type: TRASHED, payload: guest.itemBeingDragged })}
      />
      <EditFormPanel open={nnou(guest?.selected)} onDismiss={clearSelectedZonesHandler} />
      <PreviewCompatibilityDialogContainer
        isPreviewNext={false}
        open={previewCompatibilityDialogOpen}
        onClose={() => setPreviewCompatibilityDialogOpen(false)}
        onOk={handlePreviewCompatibilityDialogGo}
        onCancel={() => {
          setPreviewCompatibilityDialogOpen(false);
        }}
      />
      <Snackbar
        open={guestDetectionSnackbarOpen}
        onClose={() => void 0}
        message={
          <FormattedMessage id="guestDetectionMessage" defaultMessage="Communication with guest site not detected." />
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        action={
          <>
            <Button key="learnMore" color="secondary" size="small">
              Learn More
            </Button>
            <IconButton color="secondary" size="small" onClick={() => setGuestDetectionSnackbarOpen(false)}>
              <CloseRounded />
            </IconButton>
          </>
        }
      />
    </>
  );
}
