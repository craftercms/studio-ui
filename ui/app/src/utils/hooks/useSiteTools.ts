/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import GlobalState from '../../models/GlobalState';
import { useSelection } from './useSelection';
import { useActiveSiteId } from './useActiveSiteId';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchSiteTools } from '../../state/actions/system';

export function useSiteTools(): GlobalState['uiConfig']['siteTools'] {
  const siteTools = useSelection((state) => state.uiConfig.siteTools);

  const site = useActiveSiteId();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!siteTools.tools && !siteTools.isFetching && !siteTools.error) {
      dispatch(fetchSiteTools());
    }
  }, [dispatch, siteTools.error, siteTools.isFetching, siteTools.tools, site]);
  return siteTools;
}
