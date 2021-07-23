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
import { useActiveSiteId } from './useActiveSiteId';
import { useDispatch } from 'react-redux';
import { useSelection } from './useSelection';
import { useEffect } from 'react';
import { fetchSiteUiConfig, fetchSiteUiConfig2Complete } from '../../state/actions/configuration';
import { fetchSiteUiConfig2 } from '../../services/configuration';

export function useSiteUIConfig(): GlobalState['uiConfig'] {
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const config = useSelection((state) => state.uiConfig);
  useEffect(() => {
    if (config.currentSite !== site && !config.isFetching) {
      dispatch(fetchSiteUiConfig({ site }));

      // TODO: this is just for testing, needs to be an action and handled as currently is with fetchSiteUiConfig
      fetchSiteUiConfig2(site).subscribe((config) => dispatch(fetchSiteUiConfig2Complete(config)));
    }
  }, [dispatch, site, config.isFetching, config.currentSite]);
  return config;
}
