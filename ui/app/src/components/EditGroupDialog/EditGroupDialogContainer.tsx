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
import { isInvalidGroupName, validateGroupNameMinLength, validateRequiredField } from '../GroupManagement/utils';
import { validateGroupNameMinLength } from '../GroupManagement/utils';
import { useTransferListState } from '../TransferList/utils';
import { LookupTable, PaginationOptions } from '../../models';
import useMount from '../../hooks/useMount';
import { createPresenceTable } from '../../utils/array';

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
  const groupNameError =
    validateRequiredField(group.name, isDirty) ||
    isInvalidGroupName(group.name) ||
    validateGroupNameMinLength(group.name);
  // This validation is different than groupName error, because for groupNameError it will return true only when form
  // is dirty. For submit, it will be true even though form is not dirty (to avoid submitting a clean form).
  const submitOk = Boolean(
    group.name.trim() && !validateGroupNameMinLength(group.name) && !isInvalidGroupName(group.name)
  );
  const isEdit = Boolean(props.group);
  const [users, setUsers] = useState<User[]>();
  const [usersHaveNextPage, setUsersHaveNextPage] = useState(false);
  const usersRef = useRef([]);
  usersRef.current = users;
  const [members, setMembers] = useState<User[]>();
  const [membersLookup, setMembersLookup] = useState<LookupTable<boolean>>(null);
  const [inProgressIds, setInProgressIds] = useState<string[]>([]);
  const transferListState = useTransferListState();
  const { setSourceItems, setTargetItems } = transferListState;
  const usersFetchSize = 5;
  const [usersOffset, setUsersOffset] = useState(0);

  const onDeleteGroup = (group: Group) => {
    trash(group.id).subscribe({
      next() {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.groupDeleted)
          })
        );
        onGroupDeleted(group);
      },
      error({ response: { response } }) {
        dispatch(showErrorDialog({ error: response }));
      }
    });
  };

  const onAddMembers = () => {
    const { sourceItems, getChecked, addToTarget } = transferListState;
    const usernames = getChecked(sourceItems).map((item) => item.id);

    if (usernames.length) {
      addToTarget();
      setInProgressIds(usernames);
      addUsersToGroup(group.id, usernames).subscribe({
        next() {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.membersAdded, { count: usernames.length })
            })
          );
          setInProgressIds([]);
        },
        error({ response: { response } }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    }
  };

  const onRemoveMembers = () => {
    const { targetItems, getChecked, removeFromTarget } = transferListState;
    const usernames = getChecked(targetItems).map((item) => item.id);

    if (usernames.length) {
      removeFromTarget();
      setInProgressIds(usernames);
      deleteUsersFromGroup(group.id, usernames).subscribe({
        next() {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.membersRemoved, { count: usernames.length })
            })
          );
          setInProgressIds([]);
        },
        error({ response: { response } }) {
          dispatch(showErrorDialog({ error: response }));
        }
      });
    }
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

  // region effects
  useMount(() => {
    fetchUsers();
    fetchUsersFromGroup(props.group.id).subscribe((members) => {
      setMembers(members);
      setMembersLookup(createPresenceTable(members, true, (member) => member.username));
    });
  });

  useEffect(() => {
    users && setSourceItems(users.map((user) => ({ id: user.username, title: user.username, subtitle: user.email })));
  }, [users, setSourceItems]);

  useEffect(() => {
    members &&
      setTargetItems(
        members.map((user) => ({
          id: user.username,
          title: user.username,
          subtitle: user.email
        }))
      );
  }, [members, setTargetItems]);

  useEffect(() => {
    if (props.group?.id !== group?.id) {
      setGroup(props.group);
    }
  }, [group?.id, props.group, setGroup]);

  useEffect(() => {
    onSubmittingAndOrPendingChange({ hasPendingChanges: isDirty });
  }, [isDirty, onSubmittingAndOrPendingChange]);
  // endregion

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
      groupNameError={groupNameError}
      isEdit={isEdit}
      users={users}
      members={members}
      membersLookup={membersLookup}
      onDeleteGroup={onDeleteGroup}
      onChangeValue={onChangeValue}
      submitOk={submitOk}
      onSave={onSave}
      onCancel={onCancel}
      onAddMembers={onAddMembers}
      onRemoveMembers={onRemoveMembers}
      inProgressIds={inProgressIds}
      isDirty={isDirty}
      transferListState={transferListState}
      onFetchUsers={fetchUsers}
    />
  );
}

export default EditGroupDialogContainer;
