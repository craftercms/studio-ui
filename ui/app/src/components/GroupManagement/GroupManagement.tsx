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

import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import AddIcon from '@mui/icons-material/Add';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import Group from '../../models/Group';
import { fetchAll } from '../../services/groups';
import GroupsGridUI, { GroupsGridSkeletonTable } from '../GroupsGrid';
import EditGroupDialog from '../EditGroupDialog';
import Button from '@mui/material/Button';
import GlobalAppToolbar from '../GlobalAppToolbar';
import Paper from '@mui/material/Paper';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { useWithPendingChangesCloseRequest } from '../../hooks/useWithPendingChangesCloseRequest';
import SearchBar from '../SearchBar';
import useStyles from '../UserManagement/styles';
import useDebouncedInput from '../../hooks/useDebouncedInput';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { EmptyState } from '../EmptyState';

export function GroupManagement() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [groups, setGroups] = useState<PagedArray<Group>>(null);
  const [error, setError] = useState<ApiResponse>();
  const [selectedGroup, setSelectedGroup] = useState<Group>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [keyword, setKeyword] = useState('');
  const { classes, cx: clsx } = useStyles();

  const fetchGroups = useCallback(
    (keyword = '', _offset = offset) => {
      setFetching(true);
      fetchAll({ limit, offset: _offset, keyword }).subscribe({
        next(users) {
          setGroups(users);
          setFetching(false);
        },
        error({ response }) {
          setError(response);
          setFetching(false);
        }
      });
    },
    [limit, offset]
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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

      {error ? (
        <ApiResponseErrorState error={error} />
      ) : fetching ? (
        <GroupsGridSkeletonTable numOfItems={limit} />
      ) : groups ? (
        groups.length ? (
          <GroupsGridUI
            groups={groups}
            onRowClicked={onRowClicked}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        ) : (
          <EmptyState title={<FormattedMessage id="groupsGrid.emptyStateMessage" defaultMessage="No Groups Found" />} />
        )
      ) : (
        <></>
      )}

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

export default GroupManagement;
