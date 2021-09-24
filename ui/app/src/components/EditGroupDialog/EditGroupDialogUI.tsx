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
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DialogBody from '../Dialogs/DialogBody';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Box from '@mui/material/Box';
import TransferList from '../TransferList';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { GroupEditDialogUIProps } from './utils';

const translations = defineMessages({
  confirmHelperText: {
    id: 'editGroupDialog.helperText',
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

export default function EditGroupDialogUI(props: GroupEditDialogUIProps) {
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const {
    title,
    subtitle,
    group,
    onDeleteGroup,
    onSave,
    onCancel,
    onChangeValue,
    onAddMembers,
    onRemoveMembers,
    onCloseButtonClick,
    users,
    members,
    inProgressIds,
    isDirty,
    isEdit
  } = props;

  return (
    <>
      <header className={classes.header}>
        <section>
          {title}
          {subtitle}
        </section>
        <section className={classes.actions}>
          {onDeleteGroup && isEdit && (
            <ConfirmDropdown
              cancelText={formatMessage(translations.confirmCancel)}
              confirmText={formatMessage(translations.confirmOk)}
              confirmHelperText={formatMessage(translations.confirmHelperText, {
                name: group.name
              })}
              iconTooltip={<FormattedMessage id="editGroupDialog.deleteGroup" defaultMessage="Delete group" />}
              icon={DeleteRoundedIcon}
              iconColor="action"
              onConfirm={() => {
                onDeleteGroup(group);
              }}
            />
          )}
          <Tooltip title={<FormattedMessage id="editGroupDialog.close" defaultMessage="Close" />}>
            <IconButton edge="end" onClick={onCloseButtonClick} size="large">
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </section>
      </header>
      <Divider />
      <DialogBody className={classes.body}>
        <section className={clsx(classes.section, 'noPaddingBottom')}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="editGroupDialog.groupDetails" defaultMessage="Group Details" />
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave?.();
            }}
          >
            <Box display="flex" alignItems="center" p="15px 0 0 0">
              <InputLabel htmlFor="groupName" className={classes.label}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.name" defaultMessage="Name" />
                </Typography>
              </InputLabel>
              {isEdit ? (
                <Typography className={classes.fullWidth} color="textSecondary">
                  {group.name}
                </Typography>
              ) : (
                <OutlinedInput
                  id="groupName"
                  onChange={(e) => onChangeValue({ key: 'name', value: e.currentTarget.value })}
                  value={group.name}
                  error={isDirty && group.name === ''}
                  fullWidth
                  autoFocus
                />
              )}
            </Box>
            <Box display="flex" p="0 0 15px">
              <div className={classes.label} />
              <FormHelperText
                error
                children={
                  isDirty && group.name === '' ? (
                    <FormattedMessage id="editGroupDialog.requiredGroupName" defaultMessage="Group name is required." />
                  ) : null
                }
              />
            </Box>
            <Box display="flex" alignItems="center" p="15px  0">
              <InputLabel htmlFor="groupDescription" className={classes.label}>
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.description" defaultMessage="Description" />
                </Typography>
              </InputLabel>
              <OutlinedInput
                id="groupDescription"
                onChange={(e) => onChangeValue({ key: 'desc', value: e.currentTarget.value })}
                value={group.desc}
                fullWidth
                autoFocus={isEdit}
              />
            </Box>
            <div className={classes.formActions}>
              {isEdit && (
                <SecondaryButton disabled={!isDirty} onClick={onCancel}>
                  <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
                </SecondaryButton>
              )}
              <PrimaryButton disabled={!isDirty || group.name === ''} type="submit">
                <FormattedMessage id="words.save" defaultMessage="Save" />
              </PrimaryButton>
            </div>
          </form>
        </section>
        <Divider />
        <section className={classes.section}>
          {isEdit && users && members ? (
            <>
              <Typography variant="subtitle1" className={classes.sectionTitleEdit}>
                <FormattedMessage id="editGroupDialog.editGroupMembers" defaultMessage="Edit Group Members" />
              </Typography>
              <TransferList
                onTargetListItemsAdded={(items) => onAddMembers(items.map((item) => item.id))}
                onTargetListItemsRemoved={(items) => onRemoveMembers(items.map((item) => item.id))}
                inProgressIds={inProgressIds}
                source={{
                  title: <FormattedMessage id="words.users" defaultMessage="Users" />,
                  items: users.map((user) => ({ id: user.username, title: user.username, subtitle: user.email })),
                  emptyMessage: (
                    <FormattedMessage
                      id="transferList.emptyListMessage"
                      defaultMessage="All users are members of this group"
                    />
                  )
                }}
                target={{
                  title: <FormattedMessage id="words.members" defaultMessage="Members" />,
                  items: members.map((user) => ({ id: user.username, title: user.username, subtitle: user.email })),
                  emptyMessage: (
                    <FormattedMessage
                      id="transferList.targetEmptyStateMessage"
                      defaultMessage="No members on this group"
                    />
                  )
                }}
              />
            </>
          ) : (
            <Box display="flex" justifyContent="center">
              <Typography variant="subtitle2" color="textSecondary">
                <FormattedMessage
                  id="editGroupDialog.groupMemberHelperText"
                  defaultMessage="Group members are editable after creation"
                />
              </Typography>
            </Box>
          )}
        </section>
      </DialogBody>
    </>
  );
}
