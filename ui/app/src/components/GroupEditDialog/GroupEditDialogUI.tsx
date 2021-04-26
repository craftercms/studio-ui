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
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import Group from '../../models/Group';
import DialogBody from '../Dialogs/DialogBody';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Input from '@material-ui/core/Input';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Box from '@material-ui/core/Box';
import User from '../../models/User';
import TransferList from '../TransferList';
import InputLabel from '@material-ui/core/InputLabel';

interface GroupEditDialogUIProps {
  group: Group;
  isDirty: boolean;
  onClose(): void;
  onDeleteGroup(group: Group): void;
  onSave(): void;
  onCancel(): void;
  onChangeValue(value: { key: string; value: string }): void;
  onAddMembers(members: string[]): void;
  onRemoveMembers(members: string[]): void;
  users: User[];
  members: User[];
  inProgressIds: string[];
}

const translations = defineMessages({
  confirmHelperText: {
    id: 'groupEditDialog.helperText',
    defaultMessage: 'Delete "{name}" group?'
  },
  confirmOk: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmCancel: {
    id: 'words.no',
    defaultMessage: 'No'
  }
});

export default function GroupEditDialogUI(props: GroupEditDialogUIProps) {
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const {
    group,
    onDeleteGroup,
    onSave,
    onCancel,
    onChangeValue,
    onAddMembers,
    onRemoveMembers,
    onClose,
    users,
    members,
    inProgressIds,
    isDirty
  } = props;

  return (
    <>
      <header className={classes.header}>
        <section>
          <Typography variant="h6" component="h2">
            {group.name}
          </Typography>
          <Typography variant="subtitle1">{group.desc}</Typography>
        </section>
        <section className={classes.actions}>
          <ConfirmDropdown
            cancelText={formatMessage(translations.confirmCancel)}
            confirmText={formatMessage(translations.confirmOk)}
            confirmHelperText={formatMessage(translations.confirmHelperText, {
              name: group.name
            })}
            iconTooltip={<FormattedMessage id="groupEditDialog.deleteGroup" defaultMessage="Delete group" />}
            icon={DeleteRoundedIcon}
            iconColor="action"
            onConfirm={() => {
              onDeleteGroup(group);
            }}
          />
          <Tooltip title={<FormattedMessage id="groupEditDialog.close" defaultMessage="Close" />}>
            <IconButton edge="end" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </section>
      </header>
      <Divider />
      <DialogBody className={classes.body}>
        <section className={clsx(classes.section, 'noPaddingBottom')}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="groupEditDialog.groupDetails" defaultMessage="Group Details" />
          </Typography>
          <form>
            <Box display="flex" alignItems="center" p="15px  0">
              <InputLabel htmlFor="groupName" className={classes.label}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.name" defaultMessage="Name" />
                </Typography>
              </InputLabel>
              <Input
                id="groupName"
                disabled
                classes={{ root: classes.inputRootDisabled, input: classes.readOnlyInput }}
                onChange={(e) => onChangeValue({ key: 'name', value: e.currentTarget.value })}
                value={group.name}
                fullWidth
              />
            </Box>
            <Box display="flex" alignItems="center" p="15px  0">
              <InputLabel htmlFor="groupDescription" className={classes.label}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.description" defaultMessage="Description" />
                </Typography>
              </InputLabel>
              <Input
                id="groupDescription"
                onChange={(e) => onChangeValue({ key: 'desc', value: e.currentTarget.value })}
                value={group.desc}
                fullWidth
              />
            </Box>
            <div className={classes.formActions}>
              <SecondaryButton disabled={!isDirty} onClick={onCancel}>
                <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
              </SecondaryButton>
              <PrimaryButton disabled={!isDirty} onClick={onSave} loading={false}>
                <FormattedMessage id="words.save" defaultMessage="Save" />
              </PrimaryButton>
            </div>
          </form>
        </section>
        <Divider />
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitleEdit}>
            <FormattedMessage id="groupEditDialog.editGroupMembers" defaultMessage="Edit Group Members" />
          </Typography>
          {users && members && (
            <TransferList
              onTargetListItemsAdded={(items) => onAddMembers(items.map((item) => item.id))}
              onTargetListItemsRemoved={(items) => onRemoveMembers(items.map((item) => item.id))}
              inProgressIds={inProgressIds}
              source={{
                title: <FormattedMessage id="words.users" defaultMessage="Users" />,
                items: users.map((user) => ({ id: user.username, title: user.username, subTitle: user.email }))
              }}
              target={{
                title: <FormattedMessage id="words.members" defaultMessage="Members" />,
                items: members.map((user) => ({ id: user.username, title: user.username, subTitle: user.email }))
              }}
            />
          )}
        </section>
      </DialogBody>
    </>
  );
}
