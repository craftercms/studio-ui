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

import { Resource } from '../models/Resource';
import GlobalState from '../models/GlobalState';
import { useSelection } from './useSelection';
import { useLogicResource } from './useLogicResource';

export interface CustomResourceSelectors<ReturnType = unknown, SourceType = unknown, ErrorType = unknown> {
  shouldResolve: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  shouldReject: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  shouldRenew: (source: SourceType, resource: Resource<ReturnType>) => boolean;
  resultSelector: (source: SourceType, resource: Resource<ReturnType>) => ReturnType;
  errorSelector: (source: SourceType, resource: Resource<ReturnType>) => ErrorType;
}

export function useSelectorResource<ReturnType = unknown, SourceType = GlobalState, ErrorType = unknown>(
  sourceSelector: (state: GlobalState) => SourceType,
  checkers: CustomResourceSelectors<ReturnType, SourceType, ErrorType>
): Resource<ReturnType> {
  const state = useSelection<SourceType>(sourceSelector);
  return useLogicResource<ReturnType, SourceType, ErrorType>(state, checkers);
}

export default useSelectorResource;
