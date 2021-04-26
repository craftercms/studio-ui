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

import React, { useEffect, useState } from 'react';
import { GroupEditDialogProps } from './GroupEditDialog';
import GroupEditDialogUI from './GroupEditDialogUI';
import Group from '../../models/Group';
import { fetchAll } from '../../services/users';
import User from '../../models/User';
import { addUsersToGroup, deleteUsersFromGroup, fetchUsersFromGroup, trash, update } from '../../services/groups';
import { forkJoin } from 'rxjs';
import { defineMessages, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import { useSpreadState } from '../../utils/hooks';

const translations = defineMessages({
  groupCreated: {
    id: 'groupEditDialog.groupCreated',
    defaultMessage: 'Group created successfully'
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

export default function GroupEditDialogContainer(props: GroupEditDialogProps) {
  const { onClose, onGroupEdited } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [group, setGroup] = useSpreadState(props.group);
  const [lastSavedGroup, setLastSavedGroup] = useSpreadState(props.group);
  const [isDirty, setIsDirty] = useState(false);

  const [users, setUsers] = useState<User[]>();
  const [members, setMembers] = useState<User[]>();
  const [inProgressIds, setInProgressIds] = useState<string[]>([]);

  useEffect(() => {
    if (props.group) {
      forkJoin([fetchAll(), fetchUsersFromGroup(props.group.id)]).subscribe(([users, members]) => {
        setMembers([...members]);
        const _users = users.filter(function(user) {
          return !members.find(function(member) {
            return member.id === user.id;
          });
        });
        setUsers(_users);
      });
    }
  }, [props.group]);

  const onDeleteGroup = (group: Group) => {
    trash(group.id).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.groupDeleted)
          })
        );
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onAddMembers = (usernames: string[]) => {
    setInProgressIds(usernames);
    addUsersToGroup(group.id, { usernames }).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.membersAdded, { count: usernames.length })
          })
        );
        setInProgressIds([]);
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onRemoveMembers = (usernames: string[]) => {
    setInProgressIds(usernames);
    deleteUsersFromGroup(group.id, { usernames }).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.membersRemoved, { count: usernames.length })
          })
        );
        setInProgressIds([]);
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onChangeValue = (group: { key: string; value: string }) => {
    setIsDirty(true);
    setGroup({ [group.key]: group.value });
  };

  const onSave = () => {
    setLastSavedGroup(group);
    update(group).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.groupCreated)
          })
        );
        onGroupEdited(group);
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCancel = () => {
    setGroup(lastSavedGroup);
    setIsDirty(false);
  };

  return (
    <GroupEditDialogUI
      onClose={onClose}
      group={group ?? { id: null, name: '', desc: '' }}
      users={users}
      members={members}
      onDeleteGroup={onDeleteGroup}
      onChangeValue={onChangeValue}
      onSave={onSave}
      onCancel={onCancel}
      onAddMembers={onAddMembers}
      onRemoveMembers={onRemoveMembers}
      inProgressIds={inProgressIds}
      isDirty={isDirty}
    />
  );
}
