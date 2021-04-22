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

import React from 'react';
import { useStyles } from './styles';
import DialogHeader from '../Dialogs/DialogHeader';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import Group from '../../models/Group';
import DialogBody from '../Dialogs/DialogBody';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';

interface GroupEditDialogUIProps {
  group: Group;
  onClose(): void;
  onDeleteGroup(group: Group);
}

export default function GroupEditDialogUI(props: GroupEditDialogUIProps) {
  const classes = useStyles();
  const { group } = props;
  return (
    <>
      <DialogHeader
        title={props.group.name}
        rightActions={[
          {
            icon: DeleteRoundedIcon,
            onClick: () => props.onDeleteGroup(group)
          },
          {
            icon: 'CloseIcon',
            onClick: props.onClose
          }
        ]}
      />
      <DialogBody className={classes.body}>
        <section className={clsx(classes.section, 'noPaddingBottom')}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="groupEditDialog.groupDetails" defaultMessage="Group Details" />
          </Typography>
          <form></form>
        </section>
        <Divider />
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="groupEditDialog.groupMembers" defaultMessage="Group Members" />
          </Typography>
        </section>
      </DialogBody>
    </>
  );
}
