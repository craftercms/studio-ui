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

import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
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
  fetchContentTypes,
  fetchGuestModel,
  fetchGuestModelComplete,
  fetchPrimaryGuestModelComplete,
  guestCheckIn,
  guestCheckOut,
  guestModelUpdated,
  guestSiteLoad,
  hostCheckIn,
  hotKey,
  iceZoneSelected,
  initRichTextEditorConfig,
  insertComponentOperation,
  insertInstanceOperation,
  insertItemOperation,
  insertOperationComplete,
  instanceDragBegun,
  instanceDragEnded,
  moveItemOperation,
  requestEdit,
  selectForEdit,
  setContentTypeDropTargets,
  setEditModePadding,
  setHighlightMode,
  setItemBeingDragged,
  setPreviewEditMode,
  showEditDialog as showEditDialogAction,
  sortItemOperation,
  sortItemOperationComplete,
  toggleEditModePadding,
  trashed,
  updateFieldValueOperation,
  updateRteConfig,
  validationMessage
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
import { filter, map, pluck, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from './previewContext';
import { useDispatch } from 'react-redux';
import { nnou, pluckProps } from '../../utils/object';
import { findParentModelId, getModelIdFromInheritedField, isInheritedField } from '../../utils/model';
import RubbishBin from '../../components/RubbishBin/RubbishBin';
import { useSnackbar } from 'notistack';
import {
  getStoredClipboard,
  getStoredEditModeChoice,
  getStoredEditModePadding,
  getStoredHighlightModeChoice,
  removeStoredClipboard
} from '../../utils/state';
import { fetchSandboxItem, restoreClipboard } from '../../state/actions/content';
import EditFormPanel from '../../components/EditFormPanel/EditFormPanel';
import {
  createModelHierarchyDescriptorMap,
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
import Snackbar from '@mui/material/Snackbar';
import CloseRounded from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import { useSelection } from '../../hooks/useSelection';
import { usePreviewState } from '../../hooks/usePreviewState';
import { useContentTypes } from '../../hooks/useContentTypes';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useMount } from '../../hooks/useMount';
import { usePreviewNavigation } from '../../hooks/usePreviewNavigation';
import { useActiveSite } from '../../hooks/useActiveSite';
import { getControllerPath, getPathFromPreviewURL } from '../../utils/path';
import { showEditDialog } from '../../state/actions/dialogs';
import { UNDEFINED } from '../../utils/constants';
import { useCurrentPreviewItem } from '../../hooks/useCurrentPreviewItem';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { useRTEConfig } from '../../hooks/useRTEConfig';
import { guestMessages } from '../../assets/guestMessages';
import { HighlightMode } from '../../models/GlobalState';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import KeyboardShortcutsDialog from '../../components/KeyboardShortcutsDialog';
import { previewKeyboardShortcuts } from '../../assets/keyboardShortcuts';
import {
  contentTypeCreated,
  contentTypeDeleted,
  contentTypeUpdated,
  pluginInstalled,
  pluginUninstalled
} from '../../state/actions/system';
import { useUpdateRefs } from '../../hooks';
import { useHotkeys } from 'react-hotkeys-hook';
import { popPiece } from '../../utils/string';
import { editContentTypeTemplate, editController } from '../../state/actions/misc';

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
      const normalizedModels = normalizeModelsLookup(modelLookup);
      const hierarchyMap = createModelHierarchyDescriptorMap(normalizedModels, contentTypes);
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
          hierarchyMap
        })
      );
      hostToGuest$.next({
        type: 'FETCH_GUEST_MODEL_COMPLETE',
        payload: {
          path,
          model: normalizedModel,
          modelLookup: normalizedModels,
          hierarchyMap,
          modelIdByPath: modelIdByPath
        }
      });
    });
};
// endregion

export function PreviewConcierge(props: PropsWithChildren<{}>) {
  const dispatch = useDispatch();
  const { id: siteId, uuid } = useActiveSite();
  const user = useActiveUser();
  const { guest, editMode, highlightMode, editModePadding, icePanelWidth, toolsPanelWidth, hostSize, showToolsPanel } =
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
  const hierarchyMap = guest?.hierarchyMap;
  const requestedSourceMapPaths = useRef({});
  const guestDetectionTimeoutRef = useRef<number>();
  const [guestDetectionSnackbarOpen, setGuestDetectionSnackbarOpen] = useState(false);
  const currentItemPath = guest?.path;
  const uiConfig = useSiteUIConfig();
  const { cdataEscapedFieldPatterns } = uiConfig;
  const rteConfig = useRTEConfig();
  const keyboardShortcutsDialogState = useEnhancedDialogState();
  const conditionallyToggleEditMode = (nextHighlightMode?: HighlightMode) => {
    if (item && !isItemLockedForMe(item, user.username) && hasEditAction(item.availableActions)) {
      dispatch(
        setPreviewEditMode({
          // If switching from highlight modes (all vs move), we just want to switch modes without turning off edit mode.
          editMode: nextHighlightMode !== highlightMode ? true : !editMode,
          highlightMode: nextHighlightMode
        })
      );
    }
  };

  const upToDateRefs = useUpdateRefs({
    guest,
    models,
    siteId,
    dispatch,
    guestBase,
    rteConfig,
    contentTypes,
    xsrfArgument,
    hierarchyMap,
    highlightMode,
    modelIdByPath,
    formatMessage,
    authoringBase,
    currentUrlPath,
    enqueueSnackbar,
    editModePadding,
    cdataEscapedFieldPatterns,
    conditionallyToggleEditMode,
    keyboardShortcutsDialogState
  });

  // Legacy Guest pencil repaint - When the guest screen size changes, pencils need to be repainted.
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

  // Send editMode changes to guest
  useEffect(() => {
    // FYI. Path navigator refresh triggers this effect too due to item changing.
    if (item) {
      getHostToGuestBus().next({
        type: setPreviewEditMode.type,
        payload: { editMode: getComputedEditMode({ item, username: user.username, editMode }) }
      });
    }
  }, [item, editMode, user.username]);

  // Fetch active item
  useEffect(() => {
    if (currentItemPath && siteId) {
      dispatch(fetchSandboxItem({ path: currentItemPath, force: true }));
    }
  }, [dispatch, currentItemPath, siteId]);

  // Update rte config
  useEffect(() => {
    if (rteConfig) {
      // @ts-ignore - TODO: type action accordingly
      getHostToGuestBus().next(updateRteConfig({ rteConfig }));
    }
  }, [rteConfig]);

  // Guest detection, document domain restoring, editMode/highlightMode preference retrieval,
  // and guest key up/down notifications.
  useMount(() => {
    const localEditMode = getStoredEditModeChoice(user.username);
    if (nnou(localEditMode) && editMode !== localEditMode) {
      dispatch(setPreviewEditMode({ editMode: localEditMode }));
    }

    const localHighlightMode = getStoredHighlightModeChoice(user.username);
    if (nnou(localHighlightMode) && highlightMode !== localHighlightMode) {
      dispatch(setHighlightMode({ highlightMode: localHighlightMode }));
    }

    const localPaddingMode = getStoredEditModePadding(user.username);
    if (nnou(localPaddingMode) && editModePadding !== localPaddingMode) {
      dispatch(setEditModePadding({ editModePadding: localPaddingMode }));
    }

    startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);

    return () => {
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
    contentTypes && getHostToGuestBus().next(contentTypesResponse({ contentTypes: Object.values(contentTypes) }));
  }, [contentTypes]);

  // region guestToHost$ subscription
  useEffect(() => {
    const hostToGuest$ = getHostToGuestBus();
    const guestToHost$ = getGuestToHostBus();
    const hostToHost$ = getHostToHostBus();
    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const {
        siteId,
        models,
        dispatch,
        guestBase,
        contentTypes,
        hierarchyMap,
        authoringBase,
        formatMessage,
        modelIdByPath,
        enqueueSnackbar
      } = upToDateRefs.current;
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
        case 'IS_REVIEWER': {
          getHostToGuestBus().next({ type: 'REPAINT_PENCILS' });
          break;
        }
        // endregion
        case guestCheckIn.type:
        case fetchGuestModel.type: {
          if (type === guestCheckIn.type) {
            getHostToGuestBus().next(
              hostCheckIn({
                editMode: false,
                highlightMode: upToDateRefs.current.highlightMode,
                editModePadding: upToDateRefs.current.editModePadding,
                rteConfig: upToDateRefs.current.rteConfig ?? {}
              })
            );
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

              contentTypes && hostToGuest$.next(contentTypesResponse({ contentTypes: Object.values(contentTypes) }));

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
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, upToDateRefs.current.modelIdByPath);
            parentModelId = findParentModelId(modelId, upToDateRefs.current.hierarchyMap, models);
          }

          sortItem(
            siteId,
            modelId,
            fieldId,
            currentIndex,
            targetIndex,
            models[parentModelId ? parentModelId : modelId].craftercms.path
          ).subscribe({
            next({ updatedDocument }) {
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
                path: path ?? models[parentModelId].craftercms.path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });
              // @ts-ignore - TODO: type action accordingly
              hostToHost$.next(sortItemOperationComplete(payload));
              enqueueSnackbar(formatMessage(guestMessages.sortOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.sortOperationFailed));
            }
          });
          break;
        }
        case insertComponentOperation.type: {
          const { fieldId, targetIndex, instance, shared } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, hierarchyMap, models);
          }

          insertComponent(
            siteId,
            modelId,
            fieldId,
            targetIndex,
            contentTypes[instance.craftercms.contentTypeId],
            instance,
            models[parentModelId ? parentModelId : modelId].craftercms.path,
            shared
          ).subscribe({
            next() {
              issueDescriptorRequest({
                site: siteId,
                path: path ?? models[parentModelId].craftercms.path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToGuest$.next({
                type: insertOperationComplete.type,
                payload: { ...payload, currentFullUrl: `${guestBase}${upToDateRefs.current.currentUrlPath}` }
              });
              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationFailed));
            }
          });
          break;
        }
        case insertInstanceOperation.type: {
          const { fieldId, targetIndex, instance } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, hierarchyMap, models);
          }

          insertInstance(
            siteId,
            modelId,
            fieldId,
            targetIndex,
            instance,
            models[parentModelId ? parentModelId : modelId].craftercms.path
          ).subscribe({
            next() {
              issueDescriptorRequest({
                site: siteId,
                path: path ?? models[parentModelId].craftercms.path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchGuestModelComplete
              });

              hostToGuest$.next({
                type: insertOperationComplete.type,
                payload: { ...payload, currentFullUrl: `${guestBase}${upToDateRefs.current.currentUrlPath}` }
              });
              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationFailed));
            }
          });
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
            originalParentModelId = findParentModelId(originalModelId, hierarchyMap, models);
          }

          if (isInheritedField(models[targetModelId], targetFieldId)) {
            targetModelId = getModelIdFromInheritedField(models[targetModelId], targetFieldId, modelIdByPath);
            targetParentModelId = findParentModelId(targetModelId, hierarchyMap, models);
          }

          moveItem(
            siteId,
            originalModelId,
            originalFieldId,
            originalIndex,
            targetModelId,
            targetFieldId,
            targetIndex,
            models[originalParentModelId ? originalParentModelId : originalModelId].craftercms.path,
            models[targetParentModelId ? targetParentModelId : targetModelId].craftercms.path
          ).subscribe({
            next() {
              enqueueSnackbar(formatMessage(guestMessages.moveOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.moveOperationFailed));
            }
          });
          break;
        }
        case deleteItemOperation.type: {
          const { fieldId, index } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[modelId ?? parentModelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, hierarchyMap, models);
          }

          deleteItem(
            siteId,
            modelId,
            fieldId,
            index,
            models[parentModelId ? parentModelId : modelId].craftercms.path
          ).subscribe({
            next: () => {
              issueDescriptorRequest({
                site: siteId,
                path: path ?? models[parentModelId].craftercms.path,
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
            error: (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar(formatMessage(guestMessages.deleteOperationFailed));
            }
          });
          break;
        }
        case updateFieldValueOperation.type: {
          const { fieldId, index, value } = payload;
          let { modelId, parentModelId } = payload;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, hierarchyMap, models);
          }

          updateField(
            siteId,
            modelId,
            fieldId,
            index,
            models[parentModelId ? parentModelId : modelId].craftercms.path,
            value,
            upToDateRefs.current.cdataEscapedFieldPatterns.some((pattern) => Boolean(fieldId.match(pattern)))
          ).subscribe({
            next() {
              enqueueSnackbar(formatMessage(guestMessages.updateOperationComplete));
            },
            error() {
              enqueueSnackbar(formatMessage(guestMessages.updateOperationFailed));
            }
          });
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
          // @ts-ignore - TODO: type action accordingly
          hostToHost$.next(desktopAssetUploadStarted(payload));
          const uppySubscription = uploadDataUrl(
            siteId,
            pluckProps(payload, 'name', 'type', 'dataUrl'),
            `/static-assets/images/${payload.record.modelId}`,
            upToDateRefs.current.xsrfArgument
          )
            .pipe(
              filter(({ type }) => type === 'progress'),
              pluck('payload')
            )
            .subscribe({
              next({ progress }) {
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
              error(error) {
                console.log(error);
                enqueueSnackbar(formatMessage(guestMessages.assetUploadFailed));
              },
              complete() {
                hostToGuest$.next({
                  type: desktopAssetUploadComplete.type,
                  payload: {
                    record: payload.record,
                    path: `/static-assets/images/${payload.record.modelId}/${payload.name}`
                  }
                });
              }
            });
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
        case hotKey.type: {
          switch (payload.key) {
            case 'e':
              upToDateRefs.current.conditionallyToggleEditMode('all');
              break;
            case 'm':
              upToDateRefs.current.conditionallyToggleEditMode('move');
              break;
            case 'p':
              dispatch(toggleEditModePadding());
              break;
            case '?':
              upToDateRefs.current.keyboardShortcutsDialogState.onOpen();
              break;
          }
          break;
        }
        case showEditDialogAction.type: {
          dispatch(
            showEditDialog({
              authoringBase,
              path: upToDateRefs.current.guest.path,
              selectedFields: payload.selectedFields,
              site: siteId
            })
          );
          break;
        }
        case updateRteConfig.type: {
          // @ts-ignore - TODO: type action accordingly
          getHostToGuestBus().next(updateRteConfig({ rteConfig: upToDateRefs.current.rteConfig ?? {} }));
          break;
        }
        case requestEdit.type: {
          const { modelId, parentModelId, fields, type } = payload;
          const model = models[modelId];
          const contentType = contentTypes[model.craftercms.contentTypeId];
          console.log(
            `Edit ${type}`,
            modelId,
            parentModelId,
            models[parentModelId ? parentModelId : modelId].craftercms.path,
            fields,
            model,
            contentType
          );
          if (type === 'content') {
            dispatch(
              showEditDialog({
                site: siteId,
                modelId: parentModelId ? modelId : null,
                authoringBase,
                selectedFields: fields,
                path: models[parentModelId ? parentModelId : modelId].craftercms.path
              })
            );
          } else if (type === 'template') {
            dispatch(editContentTypeTemplate({ contentTypeId: contentType.id }));
          } else {
            dispatch(
              editController({
                path: getControllerPath(contentType.type),
                fileName: `${popPiece(contentType.id, '/')}.groovy`,
                mode: 'groovy',
                contentType: contentType.id
              })
            );
          }
        }
      }
    });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [upToDateRefs]);

  // hostToHost$ subscription
  useEffect(() => {
    const hostToHost$ = getHostToHostBus();
    const events = [
      pluginInstalled.type,
      pluginUninstalled.type,
      contentTypeCreated.type,
      contentTypeUpdated.type,
      contentTypeDeleted.type
    ];
    const hostToHostSubscription = hostToHost$
      .pipe(filter((e) => events.includes(e.type)))
      .subscribe(({ type, payload }) => {
        switch (type) {
          case pluginUninstalled.type:
          case contentTypeCreated.type:
          case contentTypeUpdated.type:
          case contentTypeDeleted.type:
          case pluginInstalled.type: {
            dispatch(fetchContentTypes());
            break;
          }
        }
      });
    return () => {
      hostToHostSubscription.unsubscribe();
    };
  }, [dispatch]);

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

  // Initialize RTE config
  useEffect(() => {
    if (nnou(uiConfig.xml) && !rteConfig) {
      dispatch(initRichTextEditorConfig({ configXml: uiConfig.xml, siteId }));
    }
  }, [uiConfig.xml, siteId, rteConfig, dispatch]);

  // Host hotkeys
  useHotkeys('e,m,p,shift+/', (e) => {
    switch (e.key) {
      case 'e':
        upToDateRefs.current.conditionallyToggleEditMode('all');
        break;
      case 'm':
        upToDateRefs.current.conditionallyToggleEditMode('move');
        break;
      case 'p':
        upToDateRefs.current.dispatch(toggleEditModePadding());
        break;
      case '?':
        upToDateRefs.current.keyboardShortcutsDialogState.onOpen();
        break;
    }
  });

  // Guest hotkeys
  useHotkeys(
    'z',
    (e) => {
      getHostToGuestBus().next(hotKey({ key: e.key, type: e.type as 'keyup' }));
    },
    { keyup: true, keydown: true }
  );

  return (
    <>
      {props.children}
      <RubbishBin
        open={nnou(guest?.itemBeingDragged)}
        onTrash={() => getHostToGuestBus().next({ type: trashed.type, payload: guest.itemBeingDragged })}
      />
      <EditFormPanel
        open={nnou(guest?.selected)}
        onDismiss={() => {
          dispatch(clearSelectForEdit());
          getHostToGuestBus().next(clearSelectedZones());
        }}
      />
      <Snackbar
        open={guestDetectionSnackbarOpen}
        onClose={() => void 0}
        message={
          <FormattedMessage
            id="guestDetectionMessage"
            defaultMessage="Communication with the preview application was interrupted. Studio will continue to retry the connection."
          />
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        action={
          <IconButton color="secondary" size="small" onClick={() => setGuestDetectionSnackbarOpen(false)}>
            <CloseRounded />
          </IconButton>
        }
      />
      <KeyboardShortcutsDialog
        open={keyboardShortcutsDialogState.open}
        onClose={keyboardShortcutsDialogState.onClose}
        isMinimized={keyboardShortcutsDialogState.isMinimized}
        hasPendingChanges={keyboardShortcutsDialogState.hasPendingChanges}
        shortcuts={previewKeyboardShortcuts}
        isSubmitting={keyboardShortcutsDialogState.isSubmitting}
      />
    </>
  );
}

export default PreviewConcierge;
