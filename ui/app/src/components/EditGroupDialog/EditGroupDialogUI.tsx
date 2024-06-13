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

import React from 'react';
import { useStyles } from './styles';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DialogBody from '../DialogBody/DialogBody';
import Typography from '@mui/material/Typography';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ConfirmDropdown from '../ConfirmDropdown';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrimaryButton from '../PrimaryButton';
import Box from '@mui/material/Box';
import TransferList from '../TransferList';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { GroupEditDialogUIProps } from './utils';
import {
  GROUP_DESCRIPTION_MAX_LENGTH,
  GROUP_NAME_MAX_LENGTH,
  GROUP_NAME_MIN_LENGTH,
  validateGroupNameMinLength,
  validateRequiredField
} from '../GroupManagement/utils';
import { excludeCommonItems } from '../TransferList/utils';

const translations = defineMessages({
  confirmHelperText: {
    id: 'editGroupDialog.helperText',
    defaultMessage: 'Delete group "{name}"?'
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

export function EditGroupDialogUI(props: GroupEditDialogUIProps) {
  const { classes, cx: clsx } = useStyles();
  const { formatMessage } = useIntl();
  const {
    title,
    subtitle,
    group,
    groupNameError,
    onDeleteGroup,
    onSave,
    submitOk,
    onChangeValue,
    onAddMembers,
    onRemoveMembers,
    onCloseButtonClick,
    users,
    members,
    membersLookup,
    inProgressIds,
    isDirty,
    isEdit,
    transferListState,
    sourceItemsAllChecked,
    onFilterUsers,
    onFetchMoreUsers,
    hasMoreUsers,
    disableAddMembers,
    isSubmitting
  } = props;

  const {
    sourceItems,
    sourceFilterKeyword,
    setSourceFilterKeyword,
    targetItems,
    filteredTargetItems,
    targetFilterKeyword,
    setTargetFilterKeyword,
    checkedList,
    onItemClicked,
    onCheckAllClicked,
    disableRemove,
    targetItemsAllChecked
  } = transferListState;

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
                <Typography className={classes.fullWidth} color="textSecondary" noWrap title={group.name}>
                  {group.name}
                </Typography>
              ) : (
                <OutlinedInput
                  id="groupName"
                  onChange={(e) => onChangeValue({ key: 'name', value: e.currentTarget.value })}
                  value={group.name}
                  error={groupNameError}
                  fullWidth
                  autoFocus
                  inputProps={{ maxLength: GROUP_NAME_MAX_LENGTH }}
                />
              )}
            </Box>
            <Box display="flex" p="0 0 15px">
              <div className={classes.label} />
              <FormHelperText
                error={groupNameError}
                children={
                  validateRequiredField(group.name, isDirty) ? (
                    <FormattedMessage id="editGroupDialog.requiredGroupName" defaultMessage="Group name is required." />
                  ) : validateGroupNameMinLength(group.name) ? (
                    <FormattedMessage
                      id="editGroupDialog.minLength"
                      defaultMessage="Min {length} characters."
                      values={{
                        length: GROUP_NAME_MIN_LENGTH
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id="editGroupDialog.invalidMinLength"
                      defaultMessage="Max {length} characters, consisting of letters, numbers, dash (-), underscore (_) and dot (.)."
                      values={{
                        length: GROUP_NAME_MAX_LENGTH
                      }}
                    />
                  )
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
                inputProps={{ maxLength: GROUP_DESCRIPTION_MAX_LENGTH }}
                disabled={group.externallyManaged}
              />
            </Box>
            {!group.externallyManaged && (
              <div className={classes.formActions}>
                <PrimaryButton disabled={!submitOk} loading={isSubmitting} type="submit">
                  <FormattedMessage id="words.save" defaultMessage="Save" />
                </PrimaryButton>
              </div>
            )}
          </form>
        </section>
        <Divider />
        <section className={classes.section}>
          {isEdit ? (
            users &&
            members && (
              <>
                <Typography variant="subtitle1" className={classes.sectionTitleEdit}>
                  <FormattedMessage id="editGroupDialog.groupMembers" defaultMessage="Group Members" />
                </Typography>
                <TransferList
                  disabled={group.externallyManaged}
                  inProgressIds={inProgressIds}
                  source={{
                    title: <FormattedMessage id="words.users" defaultMessage="Users" />,
                    items: sourceItems,
                    filterKeyword: sourceFilterKeyword,
                    setFilterKeyword: setSourceFilterKeyword,
                    disabledItems: membersLookup,
                    emptyStateMessage: (
                      <FormattedMessage
                        id="transferList.noResults"
                        defaultMessage="No results, try to change the query"
                      />
                    ),
                    onItemClick: onItemClicked,
                    checkedList,
                    inProgressIds,
                    isAllChecked: sourceItemsAllChecked,
                    onCheckAllClicked: (items, checked) => {
                      onCheckAllClicked(excludeCommonItems(items, targetItems), checked);
                    },
                    onFilter: onFilterUsers,
                    onFetchMore: onFetchMoreUsers,
                    hasMoreItems: hasMoreUsers
                  }}
                  target={{
                    title: <FormattedMessage id="words.members" defaultMessage="Members" />,
                    items: filteredTargetItems,
                    filterKeyword: targetFilterKeyword,
                    setFilterKeyword: setTargetFilterKeyword,
                    emptyStateMessage: (
                      <FormattedMessage
                        id="transferList.targetEmptyStateMessage"
                        defaultMessage="No members on this group"
                      />
                    ),
                    onItemClick: onItemClicked,
                    checkedList,
                    inProgressIds,
                    isAllChecked: targetItemsAllChecked,
                    onCheckAllClicked
                  }}
                  disableAdd={disableAddMembers}
                  disableRemove={disableRemove}
                  addToTarget={onAddMembers}
                  removeFromTarget={onRemoveMembers}
                />
              </>
            )
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

export default EditGroupDialogUI;
