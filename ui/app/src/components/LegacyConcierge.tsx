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
import { fetchContentTypes } from '../state/actions/preview';
import { useActiveSiteId } from '../utils/hooks';

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
  return null;
}
