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

import { Resource } from '../../models/Resource';

export function createResource<T>(factoryFn: () => Promise<T>): Resource<T> {
  let result,
    promise,
    resource,
    status = 'pending';
  promise = factoryFn().then(
    (response) => {
      status = 'success';
      result = response;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );
  resource = {
    complete: false,
    error: false,
    read() {
      if (status === 'pending') {
        throw promise;
      } else if (status === 'error') {
        resource.complete = true;
        resource.error = true;
        throw result;
      } else if (status === 'success') {
        resource.complete = true;
        return result;
      }
    }
  };
  return resource;
}
