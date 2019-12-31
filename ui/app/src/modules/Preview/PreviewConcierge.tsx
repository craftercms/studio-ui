/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  changeCurrentUrl,
  checkInGuest,
  checkOutGuest,
  CONTENT_TYPES_RESPONSE,
  DELETE_ITEM_OPERATION,
  fetchAssetsPanelItems,
  fetchContentTypes,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  GUEST_MODELS_RECEIVED,
  guestModelsReceived,
  HOST_CHECK_IN,
  ICE_ZONE_SELECTED,
  INSERT_COMPONENT_OPERATION,
  INSERT_ITEM_OPERATION,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED,
  MOVE_ITEM_OPERATION,
  selectForEdit,
  setItemBeingDragged,
  SORT_ITEM_OPERATION,
  UPDATE_FIELD_VALUE_OPERATION
} from '../../state/actions/preview';
import { deleteItem, insertComponent, sortItem, updateField } from '../../services/content';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import ContentType from '../../models/ContentType';
import { of, ReplaySubject, Subscription } from 'rxjs';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { getGuestToHostBus, getHostToGuestBus } from './previewContext';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, usePreviewState, useSelection } from '../../utils/hooks';
import { nnou } from '../../utils/object';
import { useOnMount } from '../../utils/helpers';
import { ElasticParams } from '../../models/Search';

export function PreviewConcierge(props: any) {

  const [snack, setSnack] = useState<any>(null);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, selectedTool } = usePreviewState();
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const GUEST_BASE = useSelection<string>(state => state.env.GUEST_BASE);
  const priorState = useRef({ site });
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;
  const assets = useSelection(state => state.preview.assets);

  // This subject helps keep the async nature of content type fetching and guest
  // check in events. The idea is that it keeps things in sync despite the timing of
  // content types getting fetch and guest checking in.
  const contentTypes$ = useMemo(() => new ReplaySubject<ContentType[]>(1), []);

  useOnMount(() => {
    const sub = beginGuestDetection(setSnack);
    return () => sub.unsubscribe();
  });

  useEffect(() => {

    const hostToGuest$ = getHostToGuestBus();
    const guestToHost$ = getGuestToHostBus();

    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const { type, payload } = action;
      switch (type) {
        case GUEST_CHECK_IN: {

          hostToGuest$.next({ type: HOST_CHECK_IN, payload });

          dispatch(checkInGuest(payload));

          if (payload.__CRAFTERCMS_GUEST_LANDING__) {
            nnou(site) && dispatch(changeCurrentUrl('/'));
          } else {

            // If the content types have already been loaded, contentTypes$ subject
            // will emit immediately. If not, it will emit when the content type fetch
            // payload does arrive.
            contentTypes$.pipe(take(1)).subscribe((payload) => {
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
            (response) => {
              console.log('Operation completed.', response);
              setSnack({ message: 'Operation completed.' });
            },
            (error) => {
              console.log('Operation failed.', error);
              setSnack({ message: error.message });
            }
          );
          break;
        }
        case INSERT_COMPONENT_OPERATION: {
          const { modelId, fieldId, targetIndex, instance, shared } = payload;
          insertComponent(
            site,
            guest.models[modelId].craftercms.path,
            fieldId,
            targetIndex,
            contentTypes.find((o) => o.id === instance.craftercms.contentType),
            instance,
            shared
          ).subscribe(() => {
            console.log('Finished');
          }, (e) => {
            console.log(e);
          });
          break;
        }
        case INSERT_ITEM_OPERATION: {
          break;
        }
        case MOVE_ITEM_OPERATION: {
          break;
        }
        case DELETE_ITEM_OPERATION: {
          const { modelId, fieldId, index } = payload;
          deleteItem(
            site,
            guest.models[modelId].craftercms.path,
            fieldId,
            index
          ).subscribe(() => {
            console.log('Finished');
          }, (e) => {
            console.log(e);
          });
          break;
        }
        case UPDATE_FIELD_VALUE_OPERATION: {
          const { modelId, fieldId, value } = payload;
          updateField(site, guest.models[modelId].craftercms.path, fieldId, value).subscribe(() => {
            console.log('Finished');
          }, (e) => {
            console.log(e);
          });
          break;
        }
        case ICE_ZONE_SELECTED: {
          dispatch(selectForEdit(payload));
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
      }
    });

    // Retrieve all content types in the system
    (!contentTypes && site) && dispatch(fetchContentTypes());
    contentTypes && contentTypes$.next(contentTypes);

    let fetchSubscription;
    switch (selectedTool) {
      case 'craftercms.ice.assets':
        (assets.isFetching === null && site) && dispatch(fetchAssetsPanelItems(initialSearchParameters));
        break;
      case 'craftercms.ice.components':
        // Retrieve all content types in the system
        // (!contentTypes && site) && dispatch(fetchContentTypes());
        // contentTypes && contentTypes$.next(contentTypes);
        break;
    }

    return () => {
      fetchSubscription && fetchSubscription.unsubscribe();
      guestToHostSubscription.unsubscribe();
    }

  }, [site, selectedTool, dispatch, contentTypes, contentTypes$, guest]);

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
          anchorOrigin={snack.position ?? { vertical: 'bottom', horizontal: 'left' }}
          open={true}
          autoHideDuration={snack.duration ?? 5000}
          onClose={() => setSnack(null)}
          message={snack.message}
          action={snack.action}
        />
      }
    </>
  );

}

const initialSearchParameters: ElasticParams = {
  keywords: '',
  offset: 0,
  limit: 10,
  filters: {
    'mime-type': ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml']
  }
};

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
    })
  });
}

try {
  // TODO: Temp. To be removed.
  document.domain = 'sample.com';
} catch (e) {
  console.log(e);
}
