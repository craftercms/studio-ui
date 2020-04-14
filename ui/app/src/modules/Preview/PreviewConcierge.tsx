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

import React, { useEffect, useRef, useState } from 'react';
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
  fetchAssetsPanelItems,
  fetchAudiencesPanelFormDefinition,
  fetchComponentsByContentType,
  fetchContentTypes,
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
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import ContentType from '../../models/ContentType';
import { of, ReplaySubject, Subscription } from 'rxjs';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus } from './previewContext';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useOnMount, usePreviewState, useSelection } from '../../utils/hooks';
import { nnou, nou, pluckProps } from '../../utils/object';
import RubbishBin from './Tools/RubbishBin';

// WARNING: This assumes there will only ever be 1 PreviewConcierge. This wouldn't be viable
// with multiple instances or multiple unrelated content type collections to hold per instance.
// This subject helps keep the async nature of content type fetching and guest
// check in events. The idea is that it keeps things in sync despite the timing of
// content types getting fetch and guest checking in.
const contentTypes$: {
  (): ReplaySubject<ContentType[]>;
  destroy(): void;
} = (() => {
  let instance: ReplaySubject<ContentType[]>;
  const fn: any = () => instance ?? (instance = new ReplaySubject<ContentType[]>(1));
  fn.destroy = () => (instance = null);
  return fn;
})();

export function PreviewConcierge(props: any) {

  const [snack, setSnack] = useState<any>(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, selectedTool } = usePreviewState();
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const { GUEST_BASE, XSRF_CONFIG_ARGUMENT } = useSelection(state => state.env);
  const priorState = useRef({ site });
  const assets = useSelection(state => state.preview.assets);
  const contentTypeComponents = useSelection(state => state.preview.components);
  const audiencesPanel = useSelection(state => state.preview.audiencesPanel);

  useOnMount(() => {
    const sub = beginGuestDetection(setSnack);
    return () => {
      sub.unsubscribe();
      contentTypes$().complete();
      contentTypes$().unsubscribe();
      contentTypes$.destroy();
    };
  });

  useEffect(() => {

    const hostToGuest$ = getHostToGuestBus();
    const guestToHost$ = getGuestToHostBus();

    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const { type, payload } = action;
      switch (type) {
        case GUEST_CHECK_IN: {

          hostToGuest$.next({ type: HOST_CHECK_IN });

          dispatch(checkInGuest(payload));

          if (payload.__CRAFTERCMS_GUEST_LANDING__) {
            nnou(site) && dispatch(changeCurrentUrl('/'));
          } else {

            // If the content types have already been loaded, contentTypes$ subject will emit
            // immediately. If not, it will emit when the content type fetch payload does arrive.
            contentTypes$().pipe(take(1)).subscribe((payload) => {
              hostToGuest$.next({ type: CONTENT_TYPES_RESPONSE, payload });
            });

          }

          break;
        }
        case GUEST_CHECK_OUT:
          dispatch(checkOutGuest());
          break;
        case SORT_ITEM_OPERATION: {
          const { modelId, fieldId, currentIndex, targetIndex } = payload;
          sortItem(site, guest.models[modelId].craftercms.path, fieldId, currentIndex, targetIndex).subscribe(
            () => {
              setSnack({ message: 'Sort operation completed.' });
            },
            (error) => {
              console.error(`${type} failed`, error);
              setSnack({ message: error.message });
            }
          );
          break;
        }
        case INSERT_COMPONENT_OPERATION: {
          const { modelId, fieldId, targetIndex, instance, parentModelId, shared } = payload;
          insertComponent(
            site,
            parentModelId ? modelId : guest.models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            contentTypes.find((o) => o.id === instance.craftercms.contentType),
            instance,
            parentModelId ? guest.models[parentModelId].craftercms.path : null,
            shared
          ).subscribe(
            () => {
              setSnack({ message: 'Insert component operation completed.' });
            },
            (error) => {
              console.error(`${type} failed`, error);
              setSnack({ message: 'Sort operation failed.' });
            }
          );
          break;
        }
        case INSERT_INSTANCE_OPERATION:
          const { modelId, fieldId, targetIndex, instance, parentModelId } = payload;
          insertInstance(
            site,
            parentModelId ? modelId : guest.models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            instance,
            parentModelId ? guest.models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              setSnack({ message: 'Insert component operation completed.' });
            },
            (error) => {
              console.error(`${type} failed`, error);
              setSnack({ message: 'Sort operation failed.' });
            }
          );
          break;
        case INSERT_ITEM_OPERATION: {
          setSnack({ message: 'Insert item operation not implemented.' });
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
            originalParentModelId ? originalModelId : guest.models[originalModelId].craftercms.path,
            originalFieldId,
            originalIndex,
            targetParentModelId ? targetModelId : guest.models[targetModelId].craftercms.path,
            targetFieldId,
            targetIndex,
            originalParentModelId ? guest.models[originalParentModelId].craftercms.path : null,
            targetParentModelId ? guest.models[targetParentModelId].craftercms.path : null
          ).subscribe(
            () => {
              setSnack({ message: 'Move operation completed.' });
            },
            (error) => {
              console.error(`${type} failed`, error);
              setSnack({ message: 'Move operation failed.' });
            }
          );
          break;
        }
        case DELETE_ITEM_OPERATION: {
          const { modelId, fieldId, index, parentModelId } = payload;
          deleteItem(
            site,
            parentModelId ? modelId : guest.models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? guest.models[parentModelId].craftercms.path : null
          ).subscribe(
            () => {
              setSnack({ message: 'Delete operation completed.' });
            },
            (error) => {
              console.error(`${type} failed`, error);
              setSnack({ message: 'Delete operation failed.' });
            }
          );
          break;
        }
        case UPDATE_FIELD_VALUE_OPERATION: {
          const { modelId, fieldId, index, parentModelId, value } = payload;
          updateField(site,
            parentModelId ? modelId : guest.models[modelId].craftercms.path,
            fieldId,
            index,
            parentModelId ? guest.models[parentModelId].craftercms.path : null,
            value
          ).subscribe(() => {
            console.log('Finished');
          }, (e) => {
            setSnack({ message: 'Updated operation failed.' });
          });
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
          dispatch(setItemBeingDragged(type === INSTANCE_DRAG_BEGUN));
          break;
        }
        case DESKTOP_ASSET_DROP: {
          uploadDataUrl(
            site,
            pluckProps(payload, 'name', 'type', 'dataUrl'),
            `/static-assets/images/${payload.modelId}`,
            XSRF_CONFIG_ARGUMENT
          ).subscribe(
            () => {
            },
            (error) => {
              setSnack({ message: error });
            },
            () => {
              hostToGuest$.next({
                type: DESKTOP_ASSET_UPLOAD_COMPLETE,
                payload: {
                  id: payload.name,
                  path: `/static-assets/images/${payload.modelId}/${payload.name}`
                }
              });
            }
          );
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
      }
    });

    const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;

    // Retrieve all content types in the system
    if (nnou(site) && nou(contentTypes) && !contentTypesBranch.isFetching && nou(contentTypesBranch.error)) {
      dispatch(fetchContentTypes());
    }

    nnou(contentTypes) && contentTypes$().next(contentTypes);

    let fetchSubscription;
    switch (selectedTool) {
      case 'craftercms.ice.assets':
        (assets.isFetching === null && site && assets.error === null) && dispatch(fetchAssetsPanelItems({}));
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
        (contentTypeComponents.contentTypeFilter && contentTypeComponents.isFetching === null && site && contentTypeComponents.error === null)
        && dispatch(fetchComponentsByContentType());
        break;
    }

    return () => {
      fetchSubscription && fetchSubscription.unsubscribe();
      guestToHostSubscription.unsubscribe();
    };

  }, [site, selectedTool, dispatch, contentTypesBranch, guest, assets, XSRF_CONFIG_ARGUMENT, contentTypeComponents, audiencesPanel]);

  useEffect(() => {
    if (priorState.current.site !== site) {
      priorState.current.site = site;
      beginGuestDetection(setSnack);
      if (guest) {
        // Changing the site will force-reload the iFrame and 'beforeunload'
        // event won't trigger withing; guest won't be submitting it's own checkout
        // in such cases.
        dispatch(checkOutGuest());
      }
    }
  }, [site, guest, GUEST_BASE, dispatch]);

  return (
    <>
      {props.children}
      {
        (snack) && <Snackbar
          anchorOrigin={snack.position ?? { vertical: 'top', horizontal: 'right' }}
          open={true}
          autoHideDuration={snack.duration ?? 5000}
          onClose={() => setSnack(null)}
          message={snack.message}
          action={snack.action}
        />
      }
      <RubbishBin
        open={guest?.itemBeingDragged}
        onTrash={() => getHostToGuestBus().next({ type: TRASHED })}
      />
    </>
  );

}

function beginGuestDetection(setSnack): Subscription {
  const guestToHost$ = getGuestToHostBus();
  return of('').pipe(
    delay(1500),
    take(1),
    takeUntil(guestToHost$.pipe(
      filter(({ type }) => type === GUEST_CHECK_IN)
    ))
  ).subscribe(() => {
    setSnack({
      duration: 10000,
      message: (
        <FormattedMessage
          id="guestDetectionMessage"
          defaultMessage="Communication with guest site was not detected."
        />
      ),
      action: [
        <Button key="learnMore" color="secondary" size="small" onClick={() => setSnack(null)}>
          Learn More
        </Button>
      ],
      position: { vertical: 'top', horizontal: 'right' }
    });
  });
}

try {
  // TODO: Temp. To be removed.
  document.domain = 'sample.com';
} catch (e) {
  console.log(e);
}
