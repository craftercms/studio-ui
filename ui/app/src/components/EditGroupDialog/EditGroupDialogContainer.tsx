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

import React, { useEffect, useRef, useState } from 'react';
import EditGroupDialogUI from './EditGroupDialogUI';
import Group from '../../models/Group';
import { fetchAll } from '../../services/users';
import User from '../../models/User';
import {
  addUsersToGroup,
  create,
  deleteUsersFromGroup,
  fetchUsersFromGroup,
  trash,
  update
} from '../../services/groups';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import Typography from '@mui/material/Typography';
import { useSpreadState } from '../../hooks/useSpreadState';
import { EditGroupDialogContainerProps } from './utils';
import { validateGroupNameMinLength } from '../GroupManagement/utils';
import { LookupTable, PaginationOptions } from '../../models';
import { createPresenceTable } from '../../utils/array';
import useMount from '../../hooks/useMount';

const translations = defineMessages({
  groupCreated: {
    id: 'groupEditDialog.groupCreated',
    defaultMessage: 'Group created successfully'
  },
  groupEdited: {
    id: 'groupEditDialog.groupEdited',
    defaultMessage: 'Group edited successfully'
  },
  groupDeleted: {
    id: 'groupEditDialog.groupDeleted',
    defaultMessage: 'Group deleted successfully'
  },
  membersAdded: {
    id: 'groupEditDialog.membersAdded',
    defaultMessage: '{count, plural, one {User added successfully} other {Users added successfully}}'
  },
  membersRemoved: {
    id: 'groupEditDialog.membersRemoved',
    defaultMessage: '{count, plural, one {User removed successfully} other {Users removed successfully}}'
  }
});

export function EditGroupDialogContainer(props: EditGroupDialogContainerProps) {
  const { onClose, onGroupSaved, onGroupDeleted, onSubmittingAndOrPendingChange } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [group, setGroup] = useSpreadState(props.group ?? { id: null, name: '', desc: '', externallyManaged: false });
  const [isDirty, setIsDirty] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);
  const isEdit = Boolean(props.group);

  const [users, setUsers] = useState<User[]>();
  const [usersHaveNextPage, setUsersHaveNextPage] = useState(false);
  const usersRef = useRef([]);
  usersRef.current = users;
  const [members, setMembers] = useState<User[]>();
  const [membersHaveNextPage, setMembersHaveNextPage] = useState(false);
  const membersRef = useRef([]);
  membersRef.current = members;
  const [membersLookup, setMembersLookup] = useState<LookupTable<boolean>>(null);
  const [inProgressIds, setInProgressIds] = useState<string[]>([]);
  const usersFetchSize = 5;
  const [usersOffset, setUsersOffset] = useState(0);
  const membersFetchSize = 100;
  const [membersOffset, setMembersOffset] = useState(0);

  const fetchUsers = (options?: Partial<PaginationOptions & { keyword?: string }>) => {
    fetchAll({
      limit: usersFetchSize,
      ...options
    }).subscribe((_users) => {
      setUsersHaveNextPage(_users.total >= (options?.offset ?? usersOffset) + usersFetchSize);
      setUsers(_users);
      setUsersOffset(options?.limit ?? usersFetchSize);
    });
  };

  const loadMoreUsers = (options?: Partial<PaginationOptions & { keyword?: string }>) => {
    fetchAll({
      limit: usersFetchSize,
      offset: usersOffset,
      ...options
    }).subscribe((_users) => {
      setUsersHaveNextPage(_users.total >= usersOffset + usersFetchSize);
      setUsers([...usersRef.current, ..._users]);
      setUsersOffset(usersOffset + usersFetchSize);
    });
  };

  const fetchMembers = (options?: Partial<PaginationOptions & { keyword?: string }>) => {
    fetchUsersFromGroup(props.group.id, { limit: membersFetchSize, ...options }).subscribe((members) => {
      setMembersHaveNextPage(members.total >= (options?.offset ?? membersOffset) + membersFetchSize);
      setMembers(members);
      setMembersLookup(createPresenceTable(members, true, (member) => member.username));
      setMembersOffset(options?.limit ?? membersFetchSize);
    });
  };

  const loadMoreMembers = (options?: Partial<PaginationOptions & { keyword?: string }>) => {
    fetchUsersFromGroup(props.group.id, {
      limit: membersFetchSize,
      offset: membersOffset,
      ...options
    }).subscribe((_members) => {
      setMembersHaveNextPage(_members.total >= membersOffset + membersFetchSize);
      setMembers([...membersRef.current, ..._members]);
      setMembersOffset(membersOffset + membersFetchSize);
    });
  };

  useMount(() => {
    fetchUsers({ limit: usersFetchSize });
    if (props.group) {
      fetchMembers({ limit: membersFetchSize });
    }
  });

  useEffect(() => {
    if (props.group?.id !== group?.id) {
      setGroup(props.group);
    }
  }, [group?.id, props.group, setGroup]);

  useEffect(() => {
    setSubmitOk(Boolean(group.name.trim() && !validateGroupNameMinLength(group.name)));
  }, [group.name]);

  const onDeleteGroup = (group: Group) => {
    trash(group.id).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.groupDeleted)
          })
        );
        onGroupDeleted(group);
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onAddMembers = (usernames: string[]) => {
    setInProgressIds(usernames);
    addUsersToGroup(group.id, usernames).subscribe({
      next() {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.membersAdded, { count: usernames.length })
          })
        );
        setInProgressIds([]);
        fetchUsers({
          offset: 0,
          limit: usersOffset
        });
        fetchMembers({ limit: 100 });
      },
      error({ response: { response } }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onRemoveMembers = (usernames: string[]) => {
    setInProgressIds(usernames);
    deleteUsersFromGroup(group.id, usernames).subscribe({
      next() {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.membersRemoved, { count: usernames.length })
          })
        );
        setInProgressIds([]);
        fetchUsers({
          limit: usersOffset,
          offset: 0
        });
        fetchMembers({ limit: membersFetchSize });
      },
      error({ response: { response } }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onChangeValue = (property: { key: string; value: string }) => {
    setIsDirty(true);
    setGroup({ [property.key]: property.value });
  };

  const onSave = () => {
    if (props.group) {
      update(group).subscribe({
        next(group) {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.groupEdited)
            })
          );
          setIsDirty(false);
          onGroupSaved(group);
        },
        error({ response: { response } }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    } else {
      create({ name: group.name.trim(), desc: group.desc }).subscribe({
        next(group) {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.groupCreated)
            })
          );
          setIsDirty(false);
          onGroupSaved(group);
        },
        error({ response: { response } }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    }
  };

  const onCancel = () => {
    setGroup(props.group);
    setIsDirty(false);
  };

  useEffect(() => {
    onSubmittingAndOrPendingChange({ hasPendingChanges: isDirty });
  }, [isDirty, onSubmittingAndOrPendingChange]);

  return (
    <EditGroupDialogUI
      title={
        <Typography variant="h6" component="h2">
          {isEdit ? (
            group.externallyManaged ? (
              <FormattedMessage
                id="groupEditDialog.viewExternallyManagedGroup"
                defaultMessage="View Group (managed externally)"
              />
            ) : (
              <FormattedMessage id="groupEditDialog.editGroup" defaultMessage="Edit Group" />
            )
          ) : (
            <FormattedMessage id="groupEditDialog.createGroup" defaultMessage="Create Group" />
          )}
        </Typography>
      }
      onCloseButtonClick={(e) => onClose(e, null)}
      group={group}
      isEdit={isEdit}
      users={users}
      usersHaveNextPage={usersHaveNextPage}
      members={members}
      membersHaveNextPage={membersHaveNextPage}
      membersLookup={membersLookup}
      onDeleteGroup={onDeleteGroup}
      onChangeValue={onChangeValue}
      submitOk={submitOk}
      onSave={onSave}
      onCancel={onCancel}
      onAddMembers={onAddMembers}
      onRemoveMembers={onRemoveMembers}
      onFilterUsers={fetchUsers}
      onFilterMembers={fetchMembers}
      onLoadMoreUsers={loadMoreUsers}
      onLoadMoreMembers={loadMoreMembers}
      inProgressIds={inProgressIds}
      isDirty={isDirty}
    />
  );
}

export default EditGroupDialogContainer;
