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
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  DELETE_ITEM_OPERATION_COMPLETE,
  DESKTOP_ASSET_DROP,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_PROGRESS,
  DESKTOP_ASSET_UPLOAD_STARTED,
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
  setContentTypeReceptacles,
  setHighlightMode,
  setItemBeingDragged,
  setPreviewEditMode,
  SORT_ITEM_OPERATION,
  SORT_ITEM_OPERATION_COMPLETE,
  TRASHED,
  UPDATE_FIELD_VALUE_OPERATION,
  VALIDATION_MESSAGE
} from '../../state/actions/preview';
import {
  deleteItem,
  getComponentInstanceHTML,
  getContentInstance,
  getContentInstanceDescriptor,
  insertComponent,
  insertInstance,
  moveItem,
  sortItem,
  updateField,
  uploadDataUrl
} from '../../services/content';
import { filter, map, pluck, switchMap, take, takeUntil } from 'rxjs/operators';
import ContentType from '../../models/ContentType';
import { forkJoin, interval, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import Button from '@material-ui/core/Button';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from './previewContext';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useContentTypes,
  useMount,
  usePermissions,
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
  getStoredhighlightModeChoice,
  getStoredPreviewChoice,
  getStoredPreviewToolsPanelPage,
  removeStoredClipboard,
  setStoredPreviewChoice
} from '../../utils/state';
import { completeDetailedItem, restoreClipBoard } from '../../state/actions/content';
import EditFormPanel from './Tools/EditFormPanel';
import { createChildModelLookup, normalizeModel, normalizeModelsLookup, parseContentXML } from '../../utils/content';
import moment from 'moment-timezone';
import ContentInstance from '../../models/ContentInstance';
import LookupTable from '../../models/LookupTable';
import { getModelIdFromInheritedField, isInheritedField } from '../../utils/model';

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
  receptaclesNotFound: {
    id: 'register.receptaclesNotFound',
    defaultMessage: 'There are no receptacles for {contentType} components'
  }
});

const originalDocDomain = document.domain;

export function PreviewConcierge(props: any) {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, currentUrl, computedUrl, editMode, highlightMode } = usePreviewState();
  const contentTypes = useContentTypes();
  const { authoringBase, guestBase, xsrfArgument } = useSelection((state) => state.env);
  const priorState = useRef({ site });
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const models = guest?.models;
  const modelIdByPath = guest?.modelIdByPath;
  const childrenMap = guest?.childrenMap;
  const contentTypes$ = useMemo(() => new ReplaySubject<ContentType[]>(1), []);
  const [previewCompatibilityDialogOpen, setPreviewCompatibilityDialogOpen] = useState(false);
  const previewNextCheckInNotificationRef = useRef(false);
  const requestedSourceMapPaths = useRef({});
  const handlePreviewCompatDialogRemember = useCallback(
    (remember, goOrStay) => {
      setStoredPreviewChoice(site, remember ? goOrStay : 'ask');
    },
    [site]
  );
  const handlePreviewCompatibilityDialogGo = useCallback(() => {
    window.location.href = `${authoringBase}/preview#/?page=${computedUrl}&site=${site}`;
  }, [authoringBase, computedUrl, site]);

  function clearSelectedZonesHandler() {
    dispatch(clearSelectForEdit());
    getHostToGuestBus().next({ type: CLEAR_SELECTED_ZONES });
  }

  // region Permissions and fetch of DetailedItem
  const currentItemPath = guest?.path;
  const permissions = usePermissions();
  const write = permissions?.[currentItemPath]?.write;

  useEffect(() => {
    if (currentItemPath && site) {
      dispatch(completeDetailedItem({ path: currentItemPath }));
    }
  }, [dispatch, currentItemPath, site]);

  useEffect(() => {
    if (write === false && editMode) {
      getHostToGuestBus().next({ type: HOST_CHECK_IN, payload: { editMode: false } });
    }
  }, [dispatch, write, editMode]);
  // endregion

  // Guest detection, document domain restoring, editMode/highlightMode preference retrieval, clipboard retrieval
  // and contentType subject cleanup.
  useMount(() => {
    const localEditMode = getStoredEditModeChoice() ? getStoredEditModeChoice() === 'true' : null;
    if (nnou(localEditMode) && editMode !== localEditMode) {
      dispatch(setPreviewEditMode({ editMode: localEditMode }));
    }

    const localHighlightMode = getStoredhighlightModeChoice();
    if (nnou(localHighlightMode) && highlightMode !== localHighlightMode) {
      dispatch(setHighlightMode({ highlightMode: localHighlightMode }));
    }

    const localClipboard = getStoredClipboard(site);
    if (localClipboard) {
      let hours = moment().diff(moment(localClipboard.timestamp), 'hours');
      if (hours >= 24) {
        removeStoredClipboard(site);
      } else {
        dispatch(
          restoreClipBoard({
            type: localClipboard.type,
            paths: localClipboard.paths,
            sourcePath: localClipboard.sourcePath
          })
        );
      }
    }

    const sub = beginGuestDetection(enqueueSnackbar, closeSnackbar);
    const storedPage = getStoredPreviewToolsPanelPage(site);
    if (storedPage) {
      dispatch(pushToolsPanelPage(storedPage));
    }
    return () => {
      sub.unsubscribe();
      contentTypes$.complete();
      contentTypes$.unsubscribe();
      document.domain = originalDocDomain;
    };
  });

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
          // Legacy sites (guest v1) send this message.
          let previewNextCheckInNotification = previewNextCheckInNotificationRef.current;
          let compatibilityQueryArg = getQueryVariable(window.location.search, 'compatibility');
          let compatibilityForceStay = compatibilityQueryArg === 'stay';
          let compatibilityAsk = compatibilityQueryArg === 'ask';
          if (!previewNextCheckInNotification && !compatibilityForceStay) {
            previewNextCheckInNotificationRef.current = true;
            let previousChoice = getStoredPreviewChoice(site);
            if (previousChoice === null) {
              setStoredPreviewChoice(site, (previousChoice = '1'));
            }
            if (previousChoice && !compatibilityAsk) {
              if (previousChoice === '1') {
                handlePreviewCompatibilityDialogGo();
              } else if (previousChoice === 'ask') {
                setPreviewCompatibilityDialogOpen(true);
              }
            } else {
              setPreviewCompatibilityDialogOpen(true);
            }
          }
          break;
        case GUEST_CHECK_IN:
        case FETCH_GUEST_MODEL: {
          // region const issueDescriptorRequest = () => {...}
          // This request & response processing is common to both of these actions so grouping them together.
          const issueDescriptorRequest = (path, completeAction) =>
            getContentInstanceDescriptor(site, path, { flatten: true }, contentTypes)
              .pipe(
                // If another check in comes while loading, this request should be cancelled.
                // This may happen if navigating rapidly from one page to another (guest-side).
                takeUntil(guestToHost$.pipe(filter(({ type }) => [GUEST_CHECK_IN, GUEST_CHECK_OUT].includes(type)))),
                switchMap((obj: { model: ContentInstance; modelLookup: LookupTable<ContentInstance> }) => {
                  let requests: Array<Observable<ContentInstance>> = [];
                  Object.values(obj.model.craftercms.sourceMap).forEach((path) => {
                    if (!requestedSourceMapPaths.current[path]) {
                      requestedSourceMapPaths.current[path] = true;
                      requests.push(getContentInstance(site, path, contentTypes));
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
          // endregion
          if (type === GUEST_CHECK_IN) {
            getHostToGuestBus().next({ type: HOST_CHECK_IN, payload: { editMode, highlightMode } });
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
              issueDescriptorRequest(path, fetchPrimaryGuestModelComplete);
            }
          } /* else if (type === FETCH_GUEST_MODEL) */ else {
            if (payload.path?.startsWith('/')) {
              issueDescriptorRequest(payload.path, fetchGuestModelComplete);
            } else {
              return console.warn(`Ignoring FETCH_GUEST_MODEL request since "${payload.path}" is not a valid path.`);
            }
          }
          break;
        }
        case GUEST_CHECK_OUT:
          requestedSourceMapPaths.current = {};
          dispatch(checkOutGuest());
          break;
        case SORT_ITEM_OPERATION: {
          const { fieldId, currentIndex, targetIndex } = payload;
          let { modelId, parentModelId } = payload;

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
              hostToHost$.next({
                type: SORT_ITEM_OPERATION_COMPLETE,
                payload
              });
              enqueueSnackbar('Sort operation completed.');
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar('Sort operation failed.');
            }
          );
          break;
        }
        case INSERT_COMPONENT_OPERATION: {
          const { fieldId, targetIndex, instance, shared } = payload;
          let { modelId, parentModelId } = payload;

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
              hostToGuest$.next({
                type: INSERT_OPERATION_COMPLETE,
                payload: { ...payload, currentUrl }
              });
              enqueueSnackbar('Insert component operation completed.');
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar('Sort operation failed.');
            }
          );
          break;
        }
        case INSERT_INSTANCE_OPERATION:
          const { fieldId, targetIndex, instance } = payload;
          let { modelId, parentModelId } = payload;

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
              enqueueSnackbar('Insert component operation completed.');
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar('Sort operation failed.');
            }
          );
          break;
        case INSERT_ITEM_OPERATION: {
          enqueueSnackbar('Insert item operation not implemented.');
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
              enqueueSnackbar('Move operation completed.');
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar('Move operation failed.');
            }
          );
          break;
        }
        case DELETE_ITEM_OPERATION: {
          const { fieldId, index } = payload;
          let { modelId, parentModelId } = payload;

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
              hostToHost$.next({
                type: DELETE_ITEM_OPERATION_COMPLETE,
                payload
              });
              enqueueSnackbar('Delete operation completed.');
            },
            (error) => {
              console.error(`${type} failed`, error);
              enqueueSnackbar('Delete operation failed.');
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
              enqueueSnackbar('Update operation completed.');
            },
            () => {
              enqueueSnackbar('Update operation failed.');
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
          enqueueSnackbar('Asset upload started.');
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
                enqueueSnackbar('Asset Upload failed.');
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
        case CONTENT_TYPE_RECEPTACLES_RESPONSE: {
          dispatch(setContentTypeReceptacles(payload));
          break;
        }
        case COMPONENT_INSTANCE_HTML_REQUEST: {
          getComponentInstanceHTML(payload.path).subscribe((htmlString) => {
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
    editMode,
    highlightMode,
    handlePreviewCompatibilityDialogGo
  ]);

  useEffect(() => {
    if (priorState.current.site !== site) {
      priorState.current.site = site;
      beginGuestDetection(enqueueSnackbar, closeSnackbar);
      if (guest) {
        // Changing the site will force-reload the iFrame and 'beforeunload'
        // event won't trigger withing; guest won't be submitting it's own checkout
        // in such cases.
        dispatch(checkOutGuest());
      }
    }
  }, [site, guest, guestBase, dispatch, enqueueSnackbar, closeSnackbar]);

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
        onOk={({ remember }) => {
          handlePreviewCompatDialogRemember(remember, 'go');
          handlePreviewCompatibilityDialogGo();
        }}
        onCancel={({ remember }) => {
          handlePreviewCompatDialogRemember(remember, 'stay');
          setPreviewCompatibilityDialogOpen(false);
        }}
      />
    </>
  );
}

function beginGuestDetection(enqueueSnackbar, closeSnackbar): Subscription {
  const guestToHost$ = getGuestToHostBus();
  return interval(2500)
    .pipe(
      take(1),
      takeUntil(guestToHost$.pipe(filter(({ type }) => type === GUEST_CHECK_IN || type === 'GUEST_SITE_LOAD')))
    )
    .subscribe(() => {
      enqueueSnackbar(
        <FormattedMessage
          id="guestDetectionMessage"
          defaultMessage="Communication with guest site was not detected."
        />,
        {
          action: (key) => (
            <Button key="learnMore" color="secondary" size="small" onClick={() => closeSnackbar(key)}>
              Learn More
            </Button>
          )
        }
      );
    });
}
