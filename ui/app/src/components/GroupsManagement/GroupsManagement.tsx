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
import AddIcon from '@material-ui/icons/Add';
import { PagedArray } from '../../models/PagedArray';
import { ApiResponse } from '../../models/ApiResponse';
import Group from '../../models/Group';
import { fetchAll } from '../../services/groups';
import { useLogicResource } from '../../utils/hooks';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import GroupsGridUI, { GroupsGridSkeletonTable } from '../GroupsGrid';
import EditGroupDialog from '../EditGroupDialog';
import Button from '@material-ui/core/Button';
import GlobalAppToolbar from '../GlobalAppToolbar';

export default function GroupsManagement() {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [fetching, setFetching] = useState(false);
  const [groups, setGroups] = useState<PagedArray<Group>>(null);
  const [error, setError] = useState<ApiResponse>();
  const [selectedGroup, setSelectedGroup] = useState<Group>(null);
  const [openGroupDialog, setOpenGroupDialog] = useState<boolean>(false);

  const fetchGroups = useCallback(() => {
    setFetching(true);
    fetchAll({ limit, offset }).subscribe(
      (users) => {
        setGroups(users);
        setFetching(false);
      },
      ({ response }) => {
        setError(response);
        setFetching(false);
      }
    );
  }, [limit, offset]);

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

  const onRowClicked = (group: Group) => {
    setOpenGroupDialog(true);
    setSelectedGroup(group);
  };

  const onChangePage = (page: number) => {
    setOffset(page * limit);
  };

  const onChangeRowsPerPage = (e) => {
    setLimit(e.target.value);
  };

  const onGroupSaved = (group: Group) => {
    setSelectedGroup(group);
    fetchGroups();
  };

  const onGroupDeleted = (group: Group) => {
    setOpenGroupDialog(false);
    fetchGroups();
  };

  const onGroupDialogClosed = () => {
    setSelectedGroup(null);
  };

  const onCloseGroupDialog = () => {
    setOpenGroupDialog(false);
  };

  return (
    <section>
      <GlobalAppToolbar
        title={<FormattedMessage id="GlobalMenu.Groups" defaultMessage="Groups" />}
        leftContent={
          <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={() => setOpenGroupDialog(true)}>
            <FormattedMessage id="sites.createGroup" defaultMessage="Create Group" />
          </Button>
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
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      </SuspenseWithEmptyState>
      <EditGroupDialog
        open={openGroupDialog}
        group={selectedGroup}
        onClosed={onGroupDialogClosed}
        onClose={onCloseGroupDialog}
        onGroupSaved={onGroupSaved}
        onGroupDeleted={onGroupDeleted}
      />
    </section>
  );
}
