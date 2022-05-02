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

import GlobalState from '../models/GlobalState';
import { useSelection } from './useSelection';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchSiteLocales } from '../state/actions/translation';

// TODO: 1. Presents issues when call loads 2. Not refreshing when site changes
export function useSiteLocales(): GlobalState['uiConfig']['siteLocales'] {
  const siteLocales = useSelection((state) => state.uiConfig.siteLocales);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!siteLocales.localeCodes && !siteLocales.isFetching && !siteLocales.error) {
      dispatch(fetchSiteLocales());
    }
  }, [dispatch, siteLocales.error, siteLocales.isFetching, siteLocales.localeCodes]);
  return siteLocales;
}

export default useSiteLocales;
