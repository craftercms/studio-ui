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

import React, { useEffect, useMemo, useRef } from 'react';
import {
  changeCurrentUrl,
  checkInGuest,
  checkOutGuest,
  CHILDREN_MAP_UPDATE,
  CLEAR_SELECTED_ZONES,
  clearSelectForEdit,
  COMPONENT_INSTANCE_HTML_REQUEST,
  COMPONENT_INSTANCE_HTML_RESPONSE,
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  DESKTOP_ASSET_DROP,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_PROGRESS,
  DESKTOP_ASSET_UPLOAD_STARTED,
  fetchAssetsPanelItems,
  fetchAudiencesPanelFormDefinition,
  fetchComponentsByContentType,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  GUEST_MODELS_RECEIVED,
  guestModelsReceived,
  HOST_CHECK_IN,
  ICE_ZONE_SELECTED,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  INSERT_ITEM_OPERATION,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED,
  MOVE_ITEM_OPERATION,
  selectForEdit,
  setChildrenMap,
  setContentTypeReceptacles,
  setItemBeingDragged,
  SORT_ITEM_OPERATION,
  TRASHED,
  UPDATE_FIELD_VALUE_OPERATION
} from '../../state/actions/preview';
import {
  deleteItem,
  getComponentInstanceHTML,
  insertComponent,
  insertInstance,
  moveItem,
  sortItem,
  updateField,
  uploadDataUrl
} from '../../services/content';
import { filter, take, takeUntil } from 'rxjs/operators';
import ContentType from '../../models/ContentType';
import { interval, ReplaySubject, Subscription } from 'rxjs';
import Button from '@material-ui/core/Button';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus, getHostToHostBus } from './previewContext';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useContentTypeList,
  useMount,
  usePreviewState,
  useSelection
} from '../../utils/hooks';
import { nnou, nou, pluckProps } from '../../utils/object';
import RubbishBin from './Tools/RubbishBin';
import { useSnackbar } from 'notistack';

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
  }
});

const originalDocDomain = document.domain;

export function PreviewConcierge(props: any) {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, selectedTool, currentUrl, computedUrl } = usePreviewState();
  const contentTypes = useContentTypeList();
  const { authoringBase, guestBase, xsrfArgument } = useSelection((state) => state.env);
  const priorState = useRef({ site });
  const assets = useSelection((state) => state.preview.assets);
  const contentTypeComponents = useSelection((state) => state.preview.components);
  const audiencesPanel = useSelection((state) => state.preview.audiencesPanel);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { formatMessage } = useIntl();
  const models = guest?.models;
  const contentTypes$ = useMemo(() => new ReplaySubject<ContentType[]>(1), []);
  const editMode = useSelection((state) => state.preview.editMode);

  // Guest detection, document domain restoring and misc cleanup.
  useMount(() => {
    const sub = beginGuestDetection(enqueueSnackbar, closeSnackbar);
    return () => {
      sub.unsubscribe();
      contentTypes$.complete();
      contentTypes$.unsubscribe();
      document.domain = originalDocDomain;
    };
  });

  // Post content types
  useEffect(() => {
    contentTypes && contentTypes$.next(contentTypes);
  });

  useEffect(() => {
    const hostToGuest$ = getHostToGuestBus();
    const guestToHost$ = getGuestToHostBus();
    const hostToHost$ = getHostToHostBus();
    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const { type, payload } = action;
      switch (type) {
        // Legacy sites.
        case 'GUEST_SITE_LOAD':
          enqueueSnackbar(
            // TODO: Translate - Discuss/chose appropriate message.
            'This page is not using this version of Preview. Go to compatible version?',
            {
              action: (key) => (
                <Button
                  key={key}
                  size="small"
                  color="secondary"
                  onClick={() => {
                    window.location.href = `${authoringBase}/preview/#/?page=${computedUrl}&site=${site}`;
                  }}
                >
                  {formatMessage(guestMessages.yes)}
                </Button>
              )
            }
          );
          break;
        case GUEST_CHECK_IN: {
          hostToGuest$.next({ type: HOST_CHECK_IN, payload: { editMode } });

          dispatch(checkInGuest(payload));

          if (payload.documentDomain) {
            try {
              document.domain = payload.documentDomain;
            } catch {
              document.domain = originalDocDomain;
            }
          }

          if (payload.__CRAFTERCMS_GUEST_LANDING__) {
            nnou(site) && dispatch(changeCurrentUrl('/'));
          } else {
            // If the content types have already been loaded, contentTypes$ subject will emit
            // immediately. If not, it will emit when the content type fetch payload does arrive.
            contentTypes$
              .pipe(take(1))
              .subscribe((payload) => {
                hostToGuest$.next({ type: CONTENT_TYPES_RESPONSE, payload });
              });
          }

          break;
        }
        case GUEST_CHECK_OUT:
          dispatch(checkOutGuest());
          break;
        case SORT_ITEM_OPERATION: {
          const { modelId, fieldId, currentIndex, targetIndex, parentModelId } = payload;
          sortItem(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            currentIndex,
            targetIndex,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
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
          const { modelId, fieldId, targetIndex, instance, parentModelId, shared } = payload;
          insertComponent(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            contentTypes.find((o) => o.id === instance.craftercms.contentTypeId),
            instance,
            parentModelId ? models[parentModelId].craftercms.path : null,
            shared
          ).subscribe(
            () => {
              let ifrm = document.createElement('iframe');
              ifrm.setAttribute('src', `${currentUrl}`);
              ifrm.style.width = '0';
              ifrm.style.height = '0';
              document.body.appendChild(ifrm);

              ifrm.onload = function() {
                let htmlString = ifrm.contentWindow.document.documentElement.querySelector(
                  `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"][data-craftercms-index="${targetIndex}"]`
                );
                ifrm.remove();
                hostToGuest$.next({
                  type: 'COMPONENT_HTML_RESPONSE',
                  payload: { response: htmlString.outerHTML, id: instance.craftercms.id }
                });
              };

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
          const { modelId, fieldId, targetIndex, instance, parentModelId } = payload;
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
          const {
            originalModelId,
            originalFieldId,
            originalIndex,
            targetModelId,
            targetFieldId,
            targetIndex,
            originalParentModelId,
            targetParentModelId
          } = payload;
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
          const { modelId, fieldId, index, parentModelId } = payload;
          deleteItem(
            site,
            parentModelId ? modelId : models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
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
          const { modelId, fieldId, index, parentModelId, value } = payload;
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
        case GUEST_MODELS_RECEIVED: {
          dispatch(guestModelsReceived(payload));
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
          ).subscribe(
            ({ payload: { progress } }) => {
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
            if (
              type === DESKTOP_ASSET_UPLOAD_STARTED &&
              uploadFile.record.id === payload.record.id
            ) {
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
        case CHILDREN_MAP_UPDATE: {
          dispatch(setChildrenMap(payload));
          break;
        }
        case 'VALIDATION_MESSAGE': {
          enqueueSnackbar(formatMessage(guestMessages[payload.id], payload.values ?? {}), {
            variant: payload.level === 'required' ? 'error' : 'warning'
          });
          break;
        }
      }
    });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [
    contentTypes$,
    contentTypes,
    currentUrl,
    dispatch,
    enqueueSnackbar,
    formatMessage,
    models,
    guestBase,
    site,
    xsrfArgument,
    editMode
  ]);

  useEffect(() => {
    switch (selectedTool) {
      case 'craftercms.ice.assets':
        assets.isFetching === null &&
          site &&
          assets.error === null &&
          dispatch(fetchAssetsPanelItems({}));
        break;
      case 'craftercms.ice.audiences':
        if (
          !audiencesPanel.isFetching &&
          nou(audiencesPanel.contentType) &&
          nou(audiencesPanel.model) &&
          nou(audiencesPanel.error)
        ) {
          dispatch(fetchAudiencesPanelFormDefinition());
        }
        break;
      case 'craftercms.ice.browseComponents':
        contentTypeComponents.contentTypeFilter &&
          contentTypeComponents.isFetching === null &&
          site &&
          contentTypeComponents.error === null &&
          dispatch(fetchComponentsByContentType());
        break;
    }
  }, [
    assets.error,
    assets.isFetching,
    audiencesPanel.contentType,
    audiencesPanel.error,
    audiencesPanel.isFetching,
    audiencesPanel.model,
    contentTypeComponents.contentTypeFilter,
    contentTypeComponents.error,
    contentTypeComponents.isFetching,
    dispatch,
    selectedTool,
    site
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
    </>
  );
}

function beginGuestDetection(enqueueSnackbar, closeSnackbar): Subscription {
  const guestToHost$ = getGuestToHostBus();
  return interval(1500)
    .pipe(
      take(1),
      takeUntil(
        guestToHost$.pipe(
          filter(({ type }) =>
            type === GUEST_CHECK_IN ||
            type === 'GUEST_SITE_LOAD'
          )
        )
      )
    )
    .subscribe(() => {
      enqueueSnackbar(
        <FormattedMessage
          id="guestDetectionMessage"
          defaultMessage="Communication with guest site was not detected."
        />,
        {
          action: (key) => (
            <Button
              key="learnMore"
              color="secondary"
              size="small"
              onClick={() => closeSnackbar(key)}
            >
              Learn More
            </Button>
          )
        }
      );
    });
}
