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

import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import {
  changeCurrentUrl,
  clearSelectedZones,
  clearSelectForEdit,
  contentTypeDropTargetsResponse,
  contentTypesResponse,
  deleteItemOperation,
  deleteItemOperationComplete,
  deleteItemOperationFailed,
  desktopAssetDrop,
  desktopAssetUploadComplete,
  desktopAssetUploadProgress,
  desktopAssetUploadStarted,
  duplicateItemOperation,
  duplicateItemOperationComplete,
  duplicateItemOperationFailed,
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
  insertItemOperationComplete,
  insertItemOperationFailed,
  insertOperationComplete,
  insertOperationFailed,
  instanceDragBegun,
  instanceDragEnded,
  moveItemOperation,
  moveItemOperationComplete,
  moveItemOperationFailed,
  reloadRequest,
  requestEdit,
  requestWorkflowCancellationDialog,
  requestWorkflowCancellationDialogOnResult,
  selectForEdit,
  setContentTypeDropTargets,
  setEditModePadding,
  setHighlightMode,
  setItemBeingDragged,
  setPreviewEditMode,
  showEditDialog as showEditDialogAction,
  sortItemOperation,
  sortItemOperationComplete,
  sortItemOperationFailed,
  toggleEditModePadding,
  trashed,
  updateFieldValueOperation,
  updateFieldValueOperationComplete,
  updateFieldValueOperationFailed,
  updateRteConfig,
  validationMessage
} from '../../state/actions/preview';
import {
  deleteItem,
  duplicateItem,
  fetchContentInstance,
  fetchContentInstanceDescriptor,
  fetchItemsByPath,
  fetchSandboxItem as fetchSandboxItemService,
  fetchWorkflowAffectedItems,
  insertComponent,
  insertInstance,
  insertItem,
  moveItem,
  sortItem,
  updateField,
  uploadDataUrl
} from '../../services/content';
import { filter, map, pluck, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from '../../utils/subjects';
import { useDispatch, useStore } from 'react-redux';
import { nnou, pluckProps } from '../../utils/object';
import { findParentModelId, getModelIdFromInheritedField, isInheritedField } from '../../utils/model';
import RubbishBin from '../RubbishBin/RubbishBin';
import { useSnackbar } from 'notistack';
import {
  getStoredClipboard,
  getStoredEditModeChoice,
  getStoredEditModePadding,
  getStoredHighlightModeChoice,
  removeStoredClipboard
} from '../../utils/state';
import {
  fetchSandboxItem,
  reloadDetailedItem,
  restoreClipboard,
  unlockItem,
  updateItemsByPath
} from '../../state/actions/content';
import EditFormPanel from '../EditFormPanel/EditFormPanel';
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
import { getPathFromPreviewURL, processPathMacros } from '../../utils/path';
import {
  closeSingleFileUploadDialog,
  rtePickerActionResult,
  showEditDialog,
  showRtePickerActions,
  ShowRtePickerActionsPayload,
  showSingleFileUploadDialog,
  showWorkflowCancellationDialog,
  workflowCancellationDialogClosed
} from '../../state/actions/dialogs';
import { UNDEFINED } from '../../utils/constants';
import { useCurrentPreviewItem } from '../../hooks/useCurrentPreviewItem';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { useRTEConfig } from '../../hooks/useRTEConfig';
import { guestMessages } from '../../assets/guestMessages';
import { GlobalState, HighlightMode } from '../../models/GlobalState';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import KeyboardShortcutsDialog from '../KeyboardShortcutsDialog';
import { previewKeyboardShortcuts } from '../../assets/keyboardShortcuts';
import {
  contentEvent,
  contentTypeCreated,
  contentTypeDeleted,
  contentTypeUpdated,
  lockContentEvent,
  pluginInstalled,
  pluginUninstalled,
  showSystemNotification
} from '../../state/actions/system';
import useSpreadState from '../../hooks/useSpreadState';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { useHotkeys } from 'react-hotkeys-hook';
import { batchActions, dispatchDOMEvent, editContentTypeTemplate } from '../../state/actions/misc';
import SocketEventBase from '../../models/SocketEvent';
import { RefreshRounded } from '@mui/icons-material';
import { getPersonFullName } from '../SiteDashboard';
import { useTheme } from '@mui/material/styles';
import { createCustomDocumentEventListener } from '../../utils/dom';
import BrowseFilesDialog from '../BrowseFilesDialog';
import { DetailedItem, MediaItem } from '../../models';
import DataSourcesActionsList, { DataSourcesActionsListProps } from '../DataSourcesActionsList/DataSourcesActionsList';
import { editControllerActionCreator, itemActionDispatcher } from '../../utils/itemActions';

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
        let sandboxItemPaths = [];
        Object.values(obj.modelLookup).forEach((model) => {
          if (model.craftercms.path) {
            sandboxItemPaths.push(model.craftercms.path);
          }
        });

        Object.values(obj.model.craftercms.sourceMap).forEach((path) => {
          if (!requestedSourceMapPaths.current[path]) {
            requestedSourceMapPaths.current[path] = true;
            requests.push(fetchContentInstance(site, path, contentTypes));
          }
        });

        return forkJoin({
          sandboxItems: fetchItemsByPath(site, sandboxItemPaths),
          models: requests.length
            ? forkJoin(requests).pipe(
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
              )
            : of(obj)
        });
      })
    )
    .subscribe(({ sandboxItems, models: { model, modelLookup } }) => {
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
        batchActions([
          completeAction({
            model: normalizedModel,
            modelLookup: normalizedModels,
            modelIdByPath: modelIdByPath,
            hierarchyMap
          }),
          updateItemsByPath({ items: sandboxItems })
        ])
      );
      hostToGuest$.next({
        type: 'FETCH_GUEST_MODEL_COMPLETE',
        payload: {
          path,
          model: normalizedModel,
          modelLookup: normalizedModels,
          hierarchyMap,
          modelIdByPath: modelIdByPath,
          sandboxItems
        }
      });
    });
};
// endregion

const dataSourceActionsListInitialState = {
  show: false,
  rect: null,
  items: []
};

export function PreviewConcierge(props: PropsWithChildren<{}>) {
  const dispatch = useDispatch();
  const store = useStore<GlobalState>();
  const { id: siteId, uuid } = useActiveSite() ?? {};
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
  const theme = useTheme();
  const browseFilesDialogState = useEnhancedDialogState();
  const [browseFilesDialogPath, setBrowseFilesDialogPath] = useState('/');
  const [browseFilesDialogMimeTypes, setBrowseFilesDialogMimeTypes] = useState([]);
  const [dataSourceActionsListState, setDataSourceActionsListState] = useSpreadState<DataSourcesActionsListProps>(
    dataSourceActionsListInitialState
  );
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
    store,
    item,
    theme,
    guest,
    models,
    user,
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
    keyboardShortcutsDialogState,
    setDataSourceActionsListState,
    showToolsPanel,
    toolsPanelWidth,
    browseFilesDialogState
  });

  const onRtePickerResult = (payload?: { path: string; name: string }) => {
    const hostToGuest$ = getHostToGuestBus();
    hostToGuest$.next({
      type: rtePickerActionResult.type,
      payload
    });
  };

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
      const mode = getComputedEditMode({ item, username: user.username, editMode });
      getHostToGuestBus().next(setPreviewEditMode({ editMode: mode }));
    }
  }, [item, editMode, user.username, dispatch]);

  // Fetch active item
  useEffect(() => {
    if (currentItemPath && siteId) {
      dispatch(fetchSandboxItem({ path: currentItemPath }));
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
    const updatedModifiedItem = (path: string) => {
      upToDateRefs.current.dispatch(
        reloadDetailedItem({
          path
        })
      );
    };
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
          dispatch(guestCheckIn({ location, site: siteId, path }));
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
        case 'CHECK_OUT_GUEST': {
          const path = getPathFromPreviewURL(payload.url);
          dispatch(guestCheckOut({ path }));
          break;
        }
        // endregion
        case guestCheckIn.type:
        case fetchGuestModel.type: {
          if (type === guestCheckIn.type) {
            getHostToGuestBus().next(
              hostCheckIn({
                editMode: false,
                username: upToDateRefs.current.user.username,
                highlightMode: upToDateRefs.current.highlightMode,
                authoringBase: upToDateRefs.current.authoringBase,
                site: upToDateRefs.current.siteId,
                editModePadding: upToDateRefs.current.editModePadding,
                rteConfig: upToDateRefs.current.rteConfig ?? {}
              })
            );
            dispatch(guestCheckIn(payload));

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
          dispatch(action);
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
              hostToHost$.next(sortItemOperationComplete(payload));
              updatedModifiedItem(path);
              enqueueSnackbar(formatMessage(guestMessages.sortOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              hostToHost$.next(sortItemOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
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
              hostToGuest$.next(
                insertOperationComplete({
                  ...payload,
                  currentFullUrl: `${guestBase}${upToDateRefs.current.currentUrlPath}`
                })
              );
              updatedModifiedItem(path);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              hostToGuest$.next(insertOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
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

              hostToGuest$.next(
                insertOperationComplete({
                  ...payload,
                  currentFullUrl: `${guestBase}${upToDateRefs.current.currentUrlPath}`
                })
              );
              updatedModifiedItem(path);
              enqueueSnackbar(formatMessage(guestMessages.insertOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              hostToGuest$.next(insertOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
              enqueueSnackbar(formatMessage(guestMessages.insertOperationFailed));
            }
          });
          break;
        }
        case insertItemOperation.type: {
          const { modelId, parentModelId, fieldId, index, instance } = payload;
          const path = models[parentModelId ?? modelId].craftercms.path;
          insertItem(siteId, modelId, fieldId, index, instance, path).subscribe({
            next() {
              hostToGuest$.next(insertItemOperationComplete());
              enqueueSnackbar(formatMessage(guestMessages.insertItemOperationComplete));
            },
            error() {
              hostToGuest$.next(insertItemOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
              enqueueSnackbar(formatMessage(guestMessages.insertItemOperationFailed));
            }
          });
          break;
        }
        case duplicateItemOperation.type: {
          const { modelId, parentModelId, fieldId, index } = payload;
          const path = models[parentModelId ?? modelId].craftercms.path;
          duplicateItem(siteId, modelId, fieldId, index, path).subscribe({
            next({ newItem }) {
              issueDescriptorRequest({
                site: siteId,
                path: newItem.path,
                contentTypes,
                requestedSourceMapPaths,
                dispatch,
                completeAction: fetchPrimaryGuestModelComplete
              });
              hostToGuest$.next(duplicateItemOperationComplete());
              enqueueSnackbar(formatMessage(guestMessages.duplicateItemOperationComplete));
            },
            error() {
              hostToGuest$.next(duplicateItemOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
              enqueueSnackbar(formatMessage(guestMessages.duplicateItemOperationFailed));
            }
          });
          break;
        }
        case moveItemOperation.type: {
          const { originalFieldId, originalIndex, targetFieldId, targetIndex } = payload;
          let { originalModelId, originalParentModelId, targetModelId, targetParentModelId } = payload;
          const originPath = models[originalParentModelId ? originalParentModelId : originalModelId].craftercms.path;
          const targetPath = models[targetParentModelId ? targetParentModelId : targetModelId].craftercms.path;

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
            originPath,
            targetPath
          ).subscribe({
            next() {
              hostToGuest$.next(moveItemOperationComplete());
              dispatch(
                batchActions([
                  reloadDetailedItem({
                    path: originPath
                  }),
                  reloadDetailedItem({
                    path: targetPath
                  })
                ])
              );
              enqueueSnackbar(formatMessage(guestMessages.moveOperationComplete));
            },
            error(error) {
              console.error(`${type} failed`, error);
              hostToGuest$.next(moveItemOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(batchActions([unlockItem({ path: originPath }), unlockItem({ path: targetPath })]));
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

              hostToHost$.next(deleteItemOperationComplete(payload));
              updatedModifiedItem(path);
              enqueueSnackbar(formatMessage(guestMessages.deleteOperationComplete));
            },
            error: (error) => {
              console.error(`${type} failed`, error);
              hostToHost$.next(deleteItemOperationFailed());
              // If write operation fails the items remains locked, so we need to dispatch unlockItem
              dispatch(unlockItem({ path }));
              enqueueSnackbar(formatMessage(guestMessages.deleteOperationFailed));
            }
          });
          break;
        }
        case updateFieldValueOperation.type: {
          const { fieldId, index, value } = payload;
          let { modelId, parentModelId } = payload;
          const path = models[parentModelId ? parentModelId : modelId].craftercms.path;

          if (isInheritedField(models[modelId], fieldId)) {
            modelId = getModelIdFromInheritedField(models[modelId], fieldId, modelIdByPath);
            parentModelId = findParentModelId(modelId, hierarchyMap, models);
          }

          updateField(
            siteId,
            modelId,
            fieldId,
            index,
            path,
            value,
            upToDateRefs.current.cdataEscapedFieldPatterns.some((pattern) => Boolean(fieldId.match(pattern)))
          )
            .pipe(switchMap(() => fetchSandboxItemService(siteId, path)))
            .subscribe({
              next(item) {
                hostToGuest$.next(updateFieldValueOperationComplete({ item }));
                updatedModifiedItem(path);
                enqueueSnackbar(formatMessage(guestMessages.updateOperationComplete));
              },
              error() {
                hostToGuest$.next(updateFieldValueOperationFailed());
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
          const {
            validations: { allowImageUpload }
          } = payload.field;

          const path =
            allowImageUpload && allowImageUpload.value
              ? processPathMacros({
                  path: allowImageUpload.value,
                  objectId: payload.record.modelId
                })
              : `/static-assets/images/${payload.record.modelId}`;

          const uppySubscription = uploadDataUrl(
            siteId,
            pluckProps(payload, 'name', 'type', 'dataUrl'),
            path,
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
                    path: `${path}${path.endsWith('/') ? '' : '/'}${payload.name}`
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
          enqueueSnackbar(
            payload.id in guestMessages ? formatMessage(guestMessages[payload.id], payload.values ?? {}) : payload.id,
            {
              variant: payload.level === 'required' ? 'error' : payload.level === 'suggestion' ? 'warning' : 'info'
            }
          );
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
          let { store } = upToDateRefs.current;
          const { modelId, parentModelId, fields, typeOfEdit: type } = payload;
          const path = models[parentModelId ? parentModelId : modelId].craftercms.path;
          let item = store.getState().content.itemsByPath[path];
          const model = models[modelId] as ContentInstance;
          const contentType = contentTypes[model.craftercms.contentTypeId];
          if (type === 'content') {
            // Not quite sure if it ever happens that the item isn't already loaded.
            (item
              ? (of(item) as Observable<DetailedItem>)
              : fetchSandboxItemService(siteId, path, { castAsDetailedItem: true })
            ).subscribe((item) => {
              itemActionDispatcher({
                item,
                site: siteId,
                option: 'edit',
                dispatch,
                authoringBase,
                formatMessage,
                extraPayload: {
                  modelId: parentModelId ? modelId : null,
                  selectedFields: fields
                }
              });
            });
          } else if (type === 'template') {
            dispatch(editContentTypeTemplate({ contentTypeId: contentType.id }));
          } else {
            dispatch(editControllerActionCreator(contentType.type, contentType.id));
          }
          break;
        }
        case requestWorkflowCancellationDialog.type: {
          fetchWorkflowAffectedItems(payload.siteId, payload.path).subscribe((items) => {
            dispatch(
              showWorkflowCancellationDialog({
                items,
                onClosed: batchActions([
                  workflowCancellationDialogClosed(),
                  requestWorkflowCancellationDialogOnResult({ type: 'close' })
                ]),
                onContinue: requestWorkflowCancellationDialogOnResult({ type: 'continue' })
              })
            );
          });
          break;
        }
        // region actions whitelisted
        case unlockItem.type: {
          dispatch(action);
          break;
        }
        // endregion
        case showRtePickerActions.type: {
          const typedPayload: ShowRtePickerActionsPayload = payload;
          const { setDataSourceActionsListState, showToolsPanel, toolsPanelWidth, browseFilesDialogState } =
            upToDateRefs.current;
          const onShowSingleFileUploadDialog = (path: string, type: 'image' | 'media') => {
            setDataSourceActionsListState(dataSourceActionsListInitialState);

            if (path) {
              dispatch(
                showSingleFileUploadDialog({
                  site: siteId,
                  path,
                  fileTypes: type === 'image' ? ['image/*'] : ['video/*'],
                  onClose: batchActions([
                    closeSingleFileUploadDialog(),
                    dispatchDOMEvent({ id: 'fileUploadCanceled' })
                  ]),
                  onUploadComplete: batchActions([
                    closeSingleFileUploadDialog(),
                    dispatchDOMEvent({ id: 'fileUploaded' })
                  ])
                })
              );
              let unsubscribe, cancelUnsubscribe;
              unsubscribe = createCustomDocumentEventListener('fileUploaded', ({ successful: response }) => {
                const file = response[0];
                const filePath = `${file.meta.path}${file.meta.path.endsWith('/') ? '' : '/'}${file.meta.name}`;
                onRtePickerResult({ path: filePath, name: file.meta.name });
                cancelUnsubscribe();
              });

              cancelUnsubscribe = createCustomDocumentEventListener('fileUploadCanceled', () => {
                onRtePickerResult();
                unsubscribe();
              });
            } else {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.noPathSetInDataSource)
                })
              );
            }
          };

          const onShowBrowseFilesDialog = (path: string, type: 'image' | 'media') => {
            const mimeTypes = type === 'image' ? ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'] : ['video/mp4'];
            setDataSourceActionsListState(dataSourceActionsListInitialState);

            if (path) {
              setBrowseFilesDialogPath(path);
              setBrowseFilesDialogMimeTypes(mimeTypes);
              browseFilesDialogState.onOpen();
            } else {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.noPathSetInDataSource)
                })
              );
            }
          };

          const dataSourcesByType = {
            image: ['allowImageUpload', 'allowImagesFromRepo'],
            media: ['allowVideoUpload', 'allowVideosFromRepo']
          };

          // filter data sources to only the ones that match the type
          const dataSourcesKeys = Object.keys(typedPayload.datasources).filter((datasourceId) =>
            dataSourcesByType[typedPayload.type]?.includes(datasourceId)
          );

          // directly open corresponding dialog
          if (dataSourcesKeys.length === 1) {
            // determine if upload or browse
            const key = dataSourcesKeys[0];
            const processedPath = processPathMacros({
              path: typedPayload.datasources[key].value,
              objectId: typedPayload.model.craftercms.id,
              objectGroupId: typedPayload.model.objectGroupId
            });
            if (key === 'allowImageUpload' || key === 'allowVideoUpload') {
              onShowSingleFileUploadDialog(processedPath, typedPayload.type);
            } else {
              onShowBrowseFilesDialog(processedPath, typedPayload.type);
            }
          } else if (dataSourcesKeys.length > 1) {
            // create items for DataSourcesActionsList
            const dataSourcesItems = [];
            dataSourcesKeys.forEach((dataSourceKey) => {
              dataSourcesItems.push({
                label: formatMessage(guestMessages[dataSourceKey]),
                path: processPathMacros({
                  path: typedPayload.datasources[dataSourceKey].value,
                  objectId: typedPayload.model.objectId,
                  objectGroupId: typedPayload.model.objectGroupId
                }),
                action:
                  dataSourceKey === 'allowImageUpload' || dataSourceKey === 'allowVideoUpload'
                    ? onShowSingleFileUploadDialog
                    : onShowBrowseFilesDialog,
                type: typedPayload.type
              });
            });

            const { left, top, height } = typedPayload.rect;
            setDataSourceActionsListState({
              show: true,
              items: dataSourcesItems,
              rect: {
                ...typedPayload.rect,
                left: left + (showToolsPanel ? toolsPanelWidth : 0),
                top: top + height * 3 // To position correctly under the button
              }
            });
          } else if (dataSourcesKeys.length === 0) {
            dispatch(
              showSystemNotification({
                message: formatMessage(guestMessages.noDataSourcesSet)
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
    const hostToGuest$ = getHostToGuestBus();
    const hostToHostSubscription = hostToHost$.subscribe(({ type, payload }) => {
      const { guest, user, enqueueSnackbar, formatMessage } = upToDateRefs.current;
      switch (type) {
        case pluginUninstalled.type:
        case contentTypeCreated.type:
        case contentTypeUpdated.type:
        case contentTypeDeleted.type:
        case pluginInstalled.type: {
          dispatch(fetchContentTypes());
          break;
        }
        case contentEvent.type: {
          const { user: person, targetPath } = payload as SocketEventBase;
          const { theme } = upToDateRefs.current;
          if (
            person.username !== user.username &&
            guest &&
            (guest.path === targetPath || guest.modelIdByPath[targetPath])
          ) {
            enqueueSnackbar(
              formatMessage(guestMessages.contentWasChangedByAnotherUser, {
                name: getPersonFullName(person)
              }),
              {
                action: (
                  <IconButton
                    size="small"
                    onClick={() => hostToGuest$.next(reloadRequest())}
                    sx={{ color: `common.${theme.palette.mode === 'light' ? 'white' : 'black'}` }}
                  >
                    <RefreshRounded />
                  </IconButton>
                )
              }
            );
          }
          break;
        }
        case lockContentEvent.type: {
          const { user: person, targetPath, locked } = payload as SocketEventBase & { locked: boolean };
          if (locked && guest?.path === targetPath && person.username !== user.username) {
            enqueueSnackbar(
              formatMessage(guestMessages.contentWasLockedByAnotherUser, {
                name: getPersonFullName(person)
              })
            );
          }
          break;
        }
      }
    });
    return () => {
      hostToHostSubscription.unsubscribe();
    };
  }, [dispatch, upToDateRefs]);

  // Guest detection
  useEffect(() => {
    if (priorState.current.site !== siteId) {
      priorState.current.site = siteId;
      startGuestDetectionTimeout(guestDetectionTimeoutRef, setGuestDetectionSnackbarOpen);
      if (guest) {
        // Changing the site will force-reload the iFrame and 'beforeunload'
        // event won't trigger withing; guest won't be submitting it's own checkout
        // in such cases.
        dispatch(guestCheckOut({ path: guest.path }));
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
      <BrowseFilesDialog
        open={browseFilesDialogState.open}
        path={browseFilesDialogPath}
        mimeTypes={browseFilesDialogMimeTypes}
        onSuccess={(response: MediaItem) => {
          browseFilesDialogState.onClose();
          onRtePickerResult({ path: response.path, name: response.name });
        }}
        onClose={() => {
          browseFilesDialogState.onClose();
          onRtePickerResult();
        }}
        hasPendingChanges={browseFilesDialogState.hasPendingChanges}
        isMinimized={browseFilesDialogState.isMinimized}
        isSubmitting={browseFilesDialogState.isSubmitting}
      />
      <DataSourcesActionsList
        {...dataSourceActionsListState}
        onClose={() => setDataSourceActionsListState({ show: false })}
      />
    </>
  );
}

export default PreviewConcierge;
