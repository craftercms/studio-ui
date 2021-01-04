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

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchContentTypes, guestPathUpdated, RELOAD_REQUEST } from '../state/actions/preview';
import { useActiveSiteId } from '../utils/hooks';
import { filter } from 'rxjs/operators';
import { getHostToGuestBus } from '../modules/Preview/previewContext';
import { LegacyItem } from '../models/Item';

export default function LegacyConcierge() {
  // As it stands, this should be a hook, but creating as a component for the convenience of mounting it
  // only once on the CrafterCMSNextBridge component. As a hook, it would be out of the StoreProvider.
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  useEffect(() => {
    if (site) {
      dispatch(fetchContentTypes());
    }
  }, [site, dispatch]);

  useEffect(() => {
    // @ts-ignore
    if (window.amplify) {
      const hostToGuest$ = getHostToGuestBus();
      const subscription = hostToGuest$.pipe(filter((action) => action.type === RELOAD_REQUEST)).subscribe(() => {
        // @ts-ignore
        CStudioAuthoring.Operations.refreshPreview();
      });

      const updateGuest = ({ contentTO: item }: { contentTO: LegacyItem }) => {
        dispatch(guestPathUpdated({ path: item.uri }));
      };

      // @ts-ignore
      amplify.subscribe('SELECTED_CONTENT_SET', updateGuest);

      return () => {
        subscription.unsubscribe();
        // @ts-ignore
        amplify.unsubscribe('SELECTED_CONTENT_SET', updateGuest);
      };
    }
  }, [dispatch]);

  return null;
}
