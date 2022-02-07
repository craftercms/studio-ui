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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import Group from '../../models/Group';
import { fetchAll } from '../../services/groups';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import GroupsGridUI, { GroupsGridSkeletonTable } from '../GroupsGrid';
import EditGroupDialog from '../EditGroupDialog';
import Button from '@mui/material/Button';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { useLogicResource } from '../../hooks/useLogicResource';
import Paper from '@mui/material/Paper';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { useWithPendingChangesCloseRequest } from '../../hooks/useWithPendingChangesCloseRequest';
import SearchBar from '../SearchBar';
import clsx from 'clsx';
import useStyles from '../UsersManagement/styles';
import { useDebouncedInput } from '../../hooks';

export default function GroupsManagement() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [groups, setGroups] = useState<PagedArray<Group>>(null);
  const [error, setError] = useState<ApiResponse>();
  const [selectedGroup, setSelectedGroup] = useState<Group>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [keyword, setKeyword] = useState('');
  const classes = useStyles();

  const fetchGroups = useCallback(
    (keyword = '', _offset = offset) => {
      setFetching(true);
      fetchAll({ limit, offset: _offset, keyword }).subscribe(
        (users) => {
          setGroups(users);
          setFetching(false);
        },
        ({ response }) => {
          setError(response);
          setFetching(false);
        }
      );
    },
    [limit, offset]
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const resource = useLogicResource<
    PagedArray<Group>,
    { groups: PagedArray<Group>; error: ApiResponse; fetching: boolean }
  >(
    useMemo(() => ({ groups, error, fetching }), [groups, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.groups) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.groups,
      errorSelector: () => error
    }
  );

  const editGroupDialogState = useEnhancedDialogState();
  const editGroupDialogPendingChangesCloseRequest = useWithPendingChangesCloseRequest(editGroupDialogState.onClose);

  const onRowClicked = (group: Group) => {
    editGroupDialogState.onOpen();
    setSelectedGroup(group);
  };

  const onPageChange = (page: number) => {
    setOffset(page * limit);
  };

  const onRowsPerPageChange = (e) => {
    setLimit(e.target.value);
  };

  const onGroupSaved = (group: Group) => {
    setSelectedGroup(group);
    fetchGroups();
  };

  const onGroupDeleted = (group: Group) => {
    editGroupDialogState.onClose();
    fetchGroups();
  };

  const onGroupDialogClosed = () => {
    setSelectedGroup(null);
  };

  const onShowSearchBox = () => {
    setShowSearchBox(!showSearchBox);
  };

  const onSearch = useCallback(
    (keyword) => {
      fetchGroups(keyword, 0);
    },
    [fetchGroups]
  );

  const onSearch$ = useDebouncedInput(onSearch, 400);

  function handleSearchKeyword(keyword: string) {
    setKeyword(keyword);
    onSearch$.next(keyword);
  }

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={<FormattedMessage id="words.groups" defaultMessage="Groups" />}
        leftContent={
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={() => editGroupDialogState.onOpen()}
          >
            <FormattedMessage id="sites.createGroup" defaultMessage="Create Group" />
          </Button>
        }
        rightContent={
          <SearchBar
            classes={{ root: clsx(classes.searchBarRoot, !showSearchBox && 'hidden') }}
            keyword={keyword}
            onChange={handleSearchKeyword}
            onDecoratorButtonClick={onShowSearchBox}
            showActionButton={Boolean(keyword)}
          />
        }
      />
      <SuspenseWithEmptyState
        resource={resource}
        suspenseProps={{
          fallback: <GroupsGridSkeletonTable numOfItems={limit} />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: <FormattedMessage id="groupsGrid.emptyStateMessage" defaultMessage="No Groups Found" />
          }
        }}
      >
        <GroupsGridUI
          resource={resource}
          onRowClicked={onRowClicked}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </SuspenseWithEmptyState>
      <EditGroupDialog
        open={editGroupDialogState.open}
        group={selectedGroup}
        onClose={editGroupDialogState.onClose}
        onClosed={onGroupDialogClosed}
        onGroupSaved={onGroupSaved}
        onGroupDeleted={onGroupDeleted}
        isSubmitting={editGroupDialogState.isSubmitting}
        isMinimized={editGroupDialogState.isMinimized}
        hasPendingChanges={editGroupDialogState.hasPendingChanges}
        onWithPendingChangesCloseRequest={editGroupDialogPendingChangesCloseRequest}
        onSubmittingAndOrPendingChange={editGroupDialogState.onSubmittingAndOrPendingChange}
      />
    </Paper>
  );
}
