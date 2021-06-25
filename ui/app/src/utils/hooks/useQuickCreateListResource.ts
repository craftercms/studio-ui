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

import { useDispatch } from 'react-redux';
import { useActiveSiteId } from './useActiveSiteId';
import { useQuickCreateState } from './useQuickCreateState';
import { useEffect } from 'react';
import { fetchQuickCreateList } from '../../state/actions/content';
import { useLogicResource } from './useLogicResource';

export function useQuickCreateListResource() {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const quickCreate = useQuickCreateState();
  useEffect(() => {
    site && dispatch(fetchQuickCreateList());
  }, [site, dispatch]);
  return useLogicResource(quickCreate, {
    errorSelector: (source) => source.error,
    resultSelector: (source) => source.items,
    shouldReject: (source) => Boolean(source.error),
    shouldResolve: (source) => Boolean(source.items) && !source.isFetching,
    shouldRenew: (source) => Boolean(source.items) && source.isFetching
  });
}
