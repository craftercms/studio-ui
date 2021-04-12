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

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAll } from '../../services/users';
import User from '../../models/User';
import { useLogicResource } from '../../utils/hooks';
import { ApiResponse } from '../../models/ApiResponse';
import UsersGridUI, { UsersGridSkeletonTable } from './UsersGridUI';
import { ErrorBoundary } from '../SystemStatus/ErrorBoundary';
import { UserInfoDialog } from './UserInfoDialog';
import { PagedArray } from '../../models/PagedArray';

interface UsersGridProps {
  limit?: number;
}

export default function UsersGrid(props) {
  const { limit = 10 } = props;
  const [offset, setOffset] = useState(0);
  const [users, setUsers] = useState<PagedArray<User>>(null);
  const [error, setError] = useState<ApiResponse>();
  const [viewUser, setViewUser] = useState(null);

  const refresh = useCallback(() => {
    fetchAll({ limit, offset }).subscribe(
      (users) => {
        setUsers(users);
      },
      ({ response }) => {
        setError(response);
      }
    );
  }, [limit, offset]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const resource = useLogicResource<PagedArray<User>, { users: PagedArray<User>; error: ApiResponse }>(
    useMemo(() => ({ users, error }), [users, error]),
    {
      shouldResolve: (source) => Boolean(source.users) && Boolean(source.users.length),
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => resource.complete,
      resultSelector: (source) => source.users,
      errorSelector: () => error
    }
  );

  const onRowClicked = (user: User) => {
    setViewUser(user);
  };

  const onUserInfoClose = () => {
    setViewUser(null);
  };

  const onUserEdited = () => {
    refresh();
  };

  const onChangePage = (page: number) => {};

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<UsersGridSkeletonTable />}>
          <UsersGridUI resource={resource} onRowClicked={onRowClicked} onChangePage={onChangePage} />
        </Suspense>
      </ErrorBoundary>
      <UserInfoDialog open={Boolean(viewUser)} onClose={onUserInfoClose} onUserEdited={onUserEdited} user={viewUser} />
    </>
  );
}
