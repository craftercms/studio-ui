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
import { fetchAll } from '../../services/users';
import User from '../../models/User';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSpreadState } from '../../utils/hooks';
import { CreateGroupDialogProps } from '.';
import GroupEditDialogUI from '../GroupEditDialog/GroupEditDialogUI';
import { FormattedMessage } from 'react-intl/lib';
import Typography from '@material-ui/core/Typography';
import { create } from '../../services/groups';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';

const translations = defineMessages({
  groupCreated: {
    id: 'groupEditDialog.groupCreated',
    defaultMessage: 'Group created successfully'
  }
});

export default function CreateGroupDialogContainer(props: CreateGroupDialogProps) {
  const { onClose, onGroupCreated } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [group, setGroup] = useSpreadState({
    id: null,
    name: '',
    desc: ''
  });
  const [lastSavedGroup, setLastSavedGroup] = useSpreadState(group);
  const [isDirty, setIsDirty] = useState(false);

  const [users, setUsers] = useState<User[]>();
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    fetchAll().subscribe((users) => {
      setUsers(users);
    });
  }, []);

  const onAddMembers = (usernames: string[]) => {
    const _members = [...members];
    usernames.forEach((username) => {
      _members.push(username);
    });
    setMembers(_members);
  };

  const onRemoveMembers = (usernames: string[]) => {
    let _members = [...members];
    usernames.forEach((username) => {
      _members.splice(_members.indexOf(username), 1);
    });
    setMembers(_members);
  };

  const onChangeValue = (group: { key: string; value: string }) => {
    setIsDirty(true);
    setGroup({ [group.key]: group.value });
  };

  const onSave = () => {
    setLastSavedGroup(group);
    create({ name: group.name, desc: group.desc }).subscribe(
      (group) => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.groupCreated)
          })
        );
        onGroupCreated(group);
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
      title={
        <Typography variant="h6" component="h2">
          <FormattedMessage id="createGroupDialog.CreateGroup" defaultMessage="Create Group" />
        </Typography>
      }
      onClose={onClose}
      group={group}
      onChangeValue={onChangeValue}
      onSave={onSave}
      onCancel={onCancel}
      isDirty={isDirty}
    />
  );
}
