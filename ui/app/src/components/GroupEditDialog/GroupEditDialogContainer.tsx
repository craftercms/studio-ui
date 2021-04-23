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
import { fetchAll as FetchAllUsers } from '../../services/users';
import { PagedArray } from '../../models/PagedArray';
import User from '../../models/User';
import { fetchUsersFromGroup } from '../../services/groups';

export default function GroupEditDialogContainer(props: GroupEditDialogProps) {
  const { onClose, group, onGroupEdited } = props;

  const [users, setUsers] = useState<PagedArray<User>>();
  const [members, setMembers] = useState<PagedArray<User>>();

  useEffect(() => {
    FetchAllUsers().subscribe((users) => {
      setUsers(users);
    });
    fetchUsersFromGroup(group.id).subscribe((members) => {
      setMembers(members);
    });
  }, [group.id]);

  const onDeleteGroup = (group: Group) => {};

  return (
    <GroupEditDialogUI
      onClose={onClose}
      group={group ?? { id: null, name: '', desc: '' }}
      users={users}
      members={members}
      onDeleteGroup={onDeleteGroup}
      onGroupEdited={onGroupEdited}
    />
  );
}
