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
import { forkJoin } from 'rxjs';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../state/actions/system';
import Typography from '@mui/material/Typography';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { EditGroupDialogContainerProps } from './utils';

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

export default function EditGroupDialogContainer(props: EditGroupDialogContainerProps) {
  const { onClose, onGroupSaved, onGroupDeleted, onSubmittingAndOrPendingChange } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const [group, setGroup] = useSpreadState(props.group ?? { id: null, name: '', desc: '' });
  const [isDirty, setIsDirty] = useState(false);
  const isEdit = Boolean(props.group);

  const [users, setUsers] = useState<User[]>();
  const [members, setMembers] = useState<User[]>();
  const [inProgressIds, setInProgressIds] = useState<string[]>([]);

  useEffect(() => {
    if (props.group) {
      forkJoin([fetchAll(), fetchUsersFromGroup(props.group.id)]).subscribe(([users, members]) => {
        setMembers([...members]);
        const _users = users.filter(function (user) {
          return !members.find(function (member) {
            return member.id === user.id;
          });
        });
        setUsers(_users);
      });
    }
  }, [props.group]);

  useEffect(() => {
    if (props.group?.id !== group?.id) {
      setGroup(props.group);
    }
  }, [group?.id, props.group, setGroup]);

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
    addUsersToGroup(group.id, usernames).subscribe(
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
    deleteUsersFromGroup(group.id, usernames).subscribe(
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

  const onChangeValue = (property: { key: string; value: string }) => {
    setIsDirty(true);
    setGroup({ [property.key]: property.value });
  };

  const onSave = () => {
    if (props.group) {
      update(group).subscribe(
        (group) => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.groupEdited)
            })
          );
          setIsDirty(false);
          onGroupSaved(group);
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    } else {
      create({ name: group.name, desc: group.desc }).subscribe(
        (group) => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.groupCreated)
            })
          );
          setIsDirty(false);
          onGroupSaved(group);
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  };

  const onCancel = () => {
    setGroup(props.group);
    setIsDirty(false);
  };

  useEffect(() => {
    onSubmittingAndOrPendingChange({
      hasPendingChanges: isDirty
    });
  }, [isDirty, onSubmittingAndOrPendingChange]);

  return (
    <EditGroupDialogUI
      title={
        isEdit ? (
          <Typography variant="h6" component="h2">
            <FormattedMessage id="groupEditDialog.editGroup" defaultMessage="Edit Group" />
          </Typography>
        ) : (
          <Typography variant="h6" component="h2">
            <FormattedMessage id="groupEditDialog.createGroup" defaultMessage="Create Group" />
          </Typography>
        )
      }
      onCloseButtonClick={(e) => onClose(e, null)}
      group={group}
      isEdit={isEdit}
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
