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

import { CustomResourceSelectors } from './useSelectorResource';
import { Resource } from '../../models/Resource';
import { useEffect, useRef, useState } from 'react';
import { createResourceBundle } from './createResourceBundle';

export function useLogicResource<ReturnType = unknown, SourceType = unknown, ErrorType = unknown>(
  source: SourceType,
  checkers: CustomResourceSelectors<ReturnType, SourceType, ErrorType>
): Resource<ReturnType> {
  const checkersRef = useRef<CustomResourceSelectors<ReturnType, SourceType, ErrorType>>();
  const [[resource, resolve, reject], setBundle] = useState(() => createResourceBundle<ReturnType>());

  checkersRef.current = checkers;

  useEffect(() => {
    const { shouldRenew, shouldReject, shouldResolve, errorSelector, resultSelector } = checkersRef.current;
    if (shouldRenew(source, resource)) {
      setBundle(createResourceBundle);
    } else if (shouldReject(source, resource)) {
      reject(errorSelector(source, resource));
    } else if (shouldResolve(source, resource)) {
      resolve(resultSelector(source, resource));
    }
  }, [source, resource, reject, resolve]);

  return resource;
}
