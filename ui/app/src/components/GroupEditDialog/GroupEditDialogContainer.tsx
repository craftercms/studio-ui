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
import { fetchUsersFromGroup, trash } from '../../services/groups';
import { forkJoin } from 'rxjs';
import { defineMessages, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';

const translations = defineMessages({
  groupDeleted: {
    id: 'groupEditDialog.groupDeleted',
    defaultMessage: 'Group deleted successfully'
  }
});

export default function GroupEditDialogContainer(props: GroupEditDialogProps) {
  const { onClose, group, onGroupEdited } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [users, setUsers] = useState<User[]>();
  const [members, setMembers] = useState<User[]>();

  useEffect(() => {
    forkJoin([fetchAll(), fetchUsersFromGroup(group.id)]).subscribe(([users, members]) => {
      setMembers([...members]);
      const _users = users.filter(function(user) {
        return !members.find(function(member) {
          return member.id === user.id;
        });
      });
      setUsers(_users);
    });
  }, [group.id]);

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

  const onMembersListChanged = (members: string[]) => {
    console.log(members);
  };

  const onChangeValue = (value: { key: string; value: string }) => {};

  const onSave = () => {};

  return (
    <GroupEditDialogUI
      onClose={onClose}
      group={group ?? { id: null, name: '', desc: '' }}
      users={users}
      members={members}
      onDeleteGroup={onDeleteGroup}
      onChangeValue={onChangeValue}
      onSave={onSave}
      onMembersListChanged={onMembersListChanged}
    />
  );
}
