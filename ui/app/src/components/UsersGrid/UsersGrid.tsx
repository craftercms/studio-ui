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
import UserInfoDialog from '../UserInfoDialog';
import { PagedArray } from '../../models/PagedArray';

interface UsersGridProps {
  limit?: number;
  passwordRequirementsRegex?: string;
}

export default function UsersGrid(props: UsersGridProps) {
  const {
    limit: defaultLimit,
    passwordRequirementsRegex = '^(?=(?<hasNumbers>.*[0-9]))(?=(?<hasLowercase>.*[a-z]))(?=(?<hasUppercase>.*[A-Z]))(?=(?<hasSpecialChars>.*[~|!`,;/@#$%^&+=]))(?<minLength>.{8,})$'
  } = props;
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(defaultLimit ?? 10);
  const [fetching, setFetching] = useState(false);
  const [users, setUsers] = useState<PagedArray<User>>(null);
  const [error, setError] = useState<ApiResponse>();
  const [viewUser, setViewUser] = useState(null);

  const fetchUsers = useCallback(() => {
    setFetching(true);
    fetchAll({ limit, offset }).subscribe(
      (users) => {
        setFetching(false);
        setUsers(users);
      },
      ({ response }) => {
        setFetching(false);
        setError(response);
      }
    );
  }, [limit, offset]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resource = useLogicResource<
    PagedArray<User>,
    { users: PagedArray<User>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ users, error, fetching }), [users, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.users) && Boolean(source.users.length) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => resource.complete && !fetching,
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
    fetchUsers();
  };

  const onChangePage = (page: number) => {
    setOffset(page * limit);
    fetchUsers();
  };

  const onChangeRowsPerPage = (e) => {
    setLimit(e.target.value);
  };

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<UsersGridSkeletonTable numOfItems={limit} />}>
          <UsersGridUI
            resource={resource}
            onRowClicked={onRowClicked}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        </Suspense>
      </ErrorBoundary>
      <UserInfoDialog
        open={Boolean(viewUser)}
        onClose={onUserInfoClose}
        onUserEdited={onUserEdited}
        user={viewUser}
        passwordRequirementsRegex={passwordRequirementsRegex}
      />
    </>
  );
}
