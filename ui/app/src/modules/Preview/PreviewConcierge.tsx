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
  clearSelectedZones,
  clearSelectForEdit,
  contentTypeDropTargetsResponse,
  contentTypesResponse,
  deleteItemOperation,
  deleteItemOperationComplete,
  desktopAssetDrop,
  desktopAssetUploadComplete,
  desktopAssetUploadProgress,
  desktopAssetUploadStarted,
  editModeToggleHotkey,
  fetchGuestModel,
  fetchGuestModelComplete,
  fetchPrimaryGuestModelComplete,
  guestCheckIn,
  guestCheckOut,
  guestSiteLoad,
  guestModelUpdated,
  hostCheckIn,
  iceZoneSelected,
  initRichTextEditorConfig,
  insertComponentOperation,
  insertInstanceOperation,
  insertItemOperation,
  insertOperationComplete,
  instanceDragBegun,
  instanceDragEnded,
  moveItemOperation,
  selectForEdit,
  setContentTypeDropTargets,
  setHighlightMode,
  setItemBeingDragged,
  setPreviewEditMode,
  showEditDialog as showEditDialogAction,
  sortItemOperation,
  sortItemOperationComplete,
  trashed,
  updateFieldValueOperation,
  validationMessage,
  updateRteConfig
} from '../../state/actions/preview';
import {
  deleteItem,
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
import Button from '@mui/material/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from './previewContext';
import { useDispatch } from 'react-redux';
import { findParentModelId, nnou, pluckProps } from '../../utils/object';
import RubbishBin from './Tools/RubbishBin';
import { useSnackbar } from 'notistack';
import {
  getStoredClipboard,
  getStoredEditModeChoice,
  getStoredHighlightModeChoice,
  removeStoredClipboard
} from '../../utils/state';
import { fetchSandboxItem, restoreClipboard } from '../../state/actions/content';
import EditFormPanel from './Tools/EditFormPanel';
import {
  createChildModelLookup,
  getComputedEditMode,
  hasEditAction,
  isItemLockedForMe,
  normalizeModel,
  normalizeModelsLookup,
  parseContentXML
} from '../../utils/content';
import moment from 'moment-timezone';
import ContentInstance from '../../models/ContentInstance';
import LookupTable from '../../models/LookupTable';
import { getModelIdFromInheritedField, isInheritedField } from '../../utils/model';
import Snackbar from '@mui/material/Snackbar';
import CloseRounded from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelection } from '../../utils/hooks/useSelection';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { useContentTypes } from '../../utils/hooks/useContentTypes';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useMount } from '../../utils/hooks/useMount';
import { usePreviewNavigation } from '../../utils/hooks/usePreviewNavigation';
import { useActiveSite } from '../../utils/hooks/useActiveSite';
import { getPathFromPreviewURL } from '../../utils/path';
import { showEditDialog } from '../../state/actions/dialogs';
import { UNDEFINED } from '../../utils/constants';
import { useCurrentPreviewItem } from '../../utils/hooks/useCurrentPreviewItem';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';
import { useRTEConfig } from '../../utils/hooks/useRTEConfig';
import { guestMessages } from '../../assets/guestMessages';
import { HighlightMode } from '../../models/GlobalState';

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
      takeUntil(guestToHost$.pipe(filter(({ type }) => [guestCheckIn.type, guestCheckOut.type].includes(type)))),
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
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const { guest, editMode, highlightMode, icePanelWidth, toolsPanelWidth, hostSize, showToolsPanel } =
    usePreviewState();
  const item = useCurrentPreviewItem();
  const { currentUrlPath } = usePreviewNavigation();
  const contentTypes = useContentTypes();
  const { authoringBase, guestBase, xsrfArgument } = useSelection((state) => state.env);
  const priorState = useRef({ site: siteId });
  const { enqueueSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const models = guest?.models;
  const modelIdByPath = guest?.modelIdByPath;
  const childrenMap = guest?.childrenMap;
  const contentTypes$ = useMemo(() => new ReplaySubject<ContentType[]>(1), []);
  const requestedSourceMapPaths = useRef({});
  // guestDetectionSnackbarOpen, guestDetectionTimeout
  const guestDetectionTimeoutRef = useRef<number>();
  const [guestDetectionSnackbarOpen, setGuestDetectionSnackbarOpen] = useState(false);
  const currentItemPath = guest?.path;
  const uiConfig = useSiteUIConfig();
  const { cdataEscapedFieldPatterns } = uiConfig;
  const rteConfig = useRTEConfig();

  function clearSelectedZonesHandler() {
    dispatch(clearSelectForEdit());
    getHostToGuestBus().next({ type: clearSelectedZones.type });
  }

  // region Legacy Guest pencil repaint
  // When the guest screen size changes, pencils need to be repainted.
  useEffect(() => {
    if (editMode) {
      let timeout = setTimeout(() => {
        getHostToGuestBus().next({ type: 'REPAINT_PENCILS' });
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [icePanelWidth, toolsPanelWidth, hostSize, editMode, showToolsPanel]);
  // endregion

  // region Permissions and fetch of DetailedItem

  useEffect(() => {
    if (item) {
      getHostToGuestBus().next({
        type: setPreviewEditMode.type,
        payload: { editMode: getComputedEditMode({ item, username: user.username, editMode }) }
      });
    }
  }, [item, editMode, user.username]);

  useEffect(() => {
    if (currentItemPath && siteId) {
      dispatch(fetchSandboxItem({ path: currentItemPath, force: true }));
    }
  }, [dispatch, currentItemPath, siteId]);

  const conditionallyToggleEditMode = useCallback(
    (nextHighlightMode?: HighlightMode) => {
      if (item && !isItemLockedForMe(item, user.username) && hasEditAction(item.availableActions)) {
        dispatch(
          setPreviewEditMode({
            // If switching from highlight modes (all vs move), we just want to switch modes without turning off edit mode.
            editMode: nextHighlightMode !== highlightMode ? true : !editMode,
            highlightMode: nextHighlightMode
          })
        );
      }
    },
    [dispatch, item, editMode, user.username, highlightMode]
  );

  // endregion

  // region Update rte config
  useEffect(() => {
    if (rteConfig) getHostToGuestBus().next({ type: updateRteConfig.type, payload: { rteConfig } });
  }, [rteConfig]);
  // endregion

  // Guest detection, document domain restoring, editMode/highlightMode preference retrieval, clipboard retrieval
  // and contentType subject cleanup.
  useMount(() => {
    const localEditMode = getStoredEditModeChoice(user.username);
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
    const localClipboard = getStoredClipboard(uuid, user.username);
    if (localClipboard) {
      let hours = moment().diff(moment(localClipboard.timestamp), 'hours');
      if (hours >= 24) {
        removeStoredClipboard(uuid, user.username);
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
  }, [dispatch, uuid, user.username]);

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
        case guestSiteLoad.type:
        case guestCheckIn.type:
          clearTimeout(guestDetectionTimeoutRef.current);
          setGuestDetectionSnackbarOpen(false);
          break;
      }
      switch (type) {
        // region Legacy preview sites messages
        case guestSiteLoad.type: {
          const { url, location } = payload;
          const path = getPathFromPreviewURL(url);
          dispatch(checkInGuest({ location, site: siteId, path }));
          issueDescriptorRequest({
            site: siteId,
            path,
            contentTypes,
            requestedSourceMapPaths,
            dispatch,
            completeAction: fetchPrimaryGuestModelComplete
          });
          break;
        }
        case 'ICE_ZONE_ON': {
          dispatch(
            showEditDialog({
              path: payload.itemId,
              authoringBase,
              site: siteId,
              iceGroupId: payload.iceId || UNDEFINED,
              modelId: payload.embeddedItemId || UNDEFINED,
              isHidden: Boolean(payload.embeddedItemId)
            })
          );
          break;
        }
        // endregion
        case guestCheckIn.type:
        case fetchGuestModel.type: {
          if (type === guestCheckIn.type) {
            getHostToGuestBus().next({
              type: hostCheckIn.type,
              payload: { editMode: false, highlightMode, rteConfig: rteConfig ?? {} }
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
              nnou(siteId) && dispatch(changeCurrentUrl('/'));
            } else {
              const path = payload.path;
              // If the content types have already been loaded, contentTypes$ subject will emit
              // immediately. If not, it will emit when the content type fetch payload does arrive.
              contentTypes$.pipe(take(1)).subscribe((payload) => {
                hostToGuest$.next({ type: contentTypesResponse.type, payload });
              });

              issueDescriptorRequest({
                site: siteId,
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
                site: siteId,
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
        case guestCheckOut.type: {
          requestedSourceMapPaths.current = {};
          dispatch(checkOutGuest());
          startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);
          break;
        }
        case sortItemOperation.type: {
          const { fieldId, currentIndex, targetIndex } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;
          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          sortItem(
            siteId,
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
                site: siteId,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });
              hostToHost$.next({
                type: sortItemOperationComplete.type,
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
        case insertComponentOperation.type: {
          const { fieldId, targetIndex, instance, shared } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          insertComponent(
            siteId,
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
                site: siteId,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToGuest$.next({
                type: insertOperationComplete.type,
                payload: { ...payload, currentFullUrl: `${guestBase}${currentUrlPath}` }
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
        case insertInstanceOperation.type: {
          const { fieldId, targetIndex, instance } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          insertInstance(
            siteId,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            instance,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              issueDescriptorRequest({
                site: siteId,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToGuest$.next({
                type: insertOperationComplete.type,
                payload: { ...payload, currentFullUrl: `${guestBase}${currentUrlPath}` }
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
        case insertItemOperation.type: {
          enqueueSnackbar(formatMessage(guestMessages.insertItemOperation));
          break;
        }
        case moveItemOperation.type: {
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
            siteId,
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
        case deleteItemOperation.type: {
          const { fieldId, index } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          deleteItem(
            siteId,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              issueDescriptorRequest({
                site: siteId,
                path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToHost$.next({
                type: deleteItemOperationComplete.type,
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
        case updateFieldValueOperation.type: {
          const { fieldId, index, value } = payload;
          let { modelId, parentModelId } = payload;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, childrenMap, models);
          }

          updateField(
            siteId,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? models[parentModelId].craftercms.path : null,
            value,
            cdataEscapedFieldPatterns.some((pattern) => Boolean(fieldId.match(pattern)))
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
        case iceZoneSelected.type: {
          dispatch(selectForEdit(payload));
          break;
        }
        case clearSelectedZones.type: {
          dispatch(clearSelectForEdit());
          break;
        }
        case instanceDragBegun.type:
        case instanceDragEnded.type: {
          dispatch(setItemBeingDragged(type === instanceDragBegun.type ? payload : null));
          break;
        }
        case desktopAssetDrop.type: {
          enqueueSnackbar(formatMessage(guestMessages.assetUploadStarted));
          hostToHost$.next({ type: desktopAssetUploadStarted.type, payload });
          const uppySubscription = uploadDataUrl(
            siteId,
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
                  type: desktopAssetUploadProgress.type,
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
                  type: desktopAssetUploadComplete.type,
                  payload: {
                    record: payload.record,
                    path: `/static-assets/images/${payload.record.modelId}/${payload.name}`
                  }
                });
              }
            );
          const sub = hostToHost$.subscribe((action) => {
            const { type, payload: uploadFile } = action;
            if (type === desktopAssetUploadStarted.type && uploadFile.record.id === payload.record.id) {
              sub.unsubscribe();
              uppySubscription.unsubscribe();
            }
          });
          break;
        }
        case contentTypeDropTargetsResponse.type: {
          dispatch(setContentTypeDropTargets(payload));
          break;
        }
        case validationMessage.type: {
          enqueueSnackbar(formatMessage(guestMessages[payload.id], payload.values ?? {}), {
            variant: payload.level === 'required' ? 'error' : payload.level === 'suggestion' ? 'warning' : 'info'
          });
          break;
        }
        case editModeToggleHotkey.type: {
          conditionallyToggleEditMode(payload.mode);
          break;
        }
        case showEditDialogAction.type: {
          dispatch(
            showEditDialog({
              authoringBase,
              path: guest.path,
              selectedFields: payload.selectedFields,
              site: siteId
            })
          );
          break;
        }
        case updateRteConfig.type: {
          getHostToGuestBus().next({
            type: updateRteConfig.type,
            payload: { rteConfig: rteConfig ?? {} }
          });
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
    currentUrlPath,
    dispatch,
    enqueueSnackbar,
    formatMessage,
    models,
    modelIdByPath,
    childrenMap,
    guestBase,
    siteId,
    xsrfArgument,
    highlightMode,
    conditionallyToggleEditMode,
    cdataEscapedFieldPatterns,
    rteConfig,
    guest
  ]);

  // Guest detection
  useEffect(() => {
    if (priorState.current.site !== siteId) {
      priorState.current.site = siteId;
      startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);
      if (guest) {
        // Changing the site will force-reload the iFrame and 'beforeunload'
        // event won't trigger withing; guest won't be submitting it's own checkout
        // in such cases.
        dispatch(checkOutGuest());
      }
    }
  }, [siteId, guest, dispatch]);

  useEffect(() => {
    if (nnou(uiConfig.xml) && !rteConfig) {
      dispatch(initRichTextEditorConfig({ configXml: uiConfig.xml, siteId }));
    }
  }, [uiConfig.xml, siteId, rteConfig, dispatch]);

  // region Hotkeys
  useHotkeys('e', () => conditionallyToggleEditMode('all'), [conditionallyToggleEditMode]);
  useHotkeys('m', () => conditionallyToggleEditMode('move'), [conditionallyToggleEditMode]);
  // endregion

  return (
    <>
      {props.children}
      <RubbishBin
        open={nnou(guest?.itemBeingDragged)}
        onTrash={() => getHostToGuestBus().next({ type: trashed.type, payload: guest.itemBeingDragged })}
      />
      <EditFormPanel open={nnou(guest?.selected)} onDismiss={clearSelectedZonesHandler} />
      <Snackbar
        open={guestDetectionSnackbarOpen}
        onClose={() => void 0}
        message={
          <FormattedMessage
            id="guestDetectionMessage"
            defaultMessage="Communication with the preview application not detected. Studio will continue to retry the connection."
          />
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
