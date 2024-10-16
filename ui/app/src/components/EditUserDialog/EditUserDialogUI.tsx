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

import useStyles from './styles';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import PasswordRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ConfirmDropdown from '../ConfirmDropdown';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Divider from '@mui/material/Divider';
import DialogBody from '../DialogBody/DialogBody';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import { rand } from '../PathNavigator/utils';
import ResetPasswordDialog from '../ResetPasswordDialog';
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import { UserGroupMembershipEditor } from '../UserGroupMembershipEditor';
import { EditUserDialogUIProps } from './utils';
import TextField from '@mui/material/TextField';
import {
  isInvalidEmail,
  USER_EMAIL_MAX_LENGTH,
  USER_FIRST_NAME_MAX_LENGTH,
  USER_FIRST_NAME_MIN_LENGTH,
  USER_LAST_NAME_MAX_LENGTH,
  USER_LAST_NAME_MIN_LENGTH,
  validateFieldMinLength,
  validateRequiredField
} from '../UserManagement/utils';

const translations = defineMessages({
  externallyManaged: {
    id: 'userInfoDialog.externallyManaged',
    defaultMessage: 'Managed externally'
  },
  siteName: {
    id: 'userInfoDialog.siteName',
    defaultMessage: 'Project name'
  },
  roles: {
    id: 'words.roles',
    defaultMessage: 'Roles'
  },
  confirmHelperText: {
    id: 'userInfoDialog.helperText',
    defaultMessage: 'Delete user "{username}"?'
  },
  confirmOk: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmCancel: {
    id: 'words.no',
    defaultMessage: 'No'
  },
  invalidMinLength: {
    id: 'userInfoDialog.invalidMinLength',
    defaultMessage: 'Min {length} characters'
  }
});

export function EditUserDialogUI(props: EditUserDialogUIProps) {
  const { classes } = useStyles();
  const { formatMessage } = useIntl();
  const managedInStudio = !props.user.externallyManaged;
  const {
    user,
    inProgress,
    submitOk,
    dirty,
    openResetPassword,
    sites,
    rolesBySite,
    passwordRequirementsMinComplexity,
    onSave,
    onCloseButtonClick,
    onDelete,
    onCloseResetPasswordDialog,
    onInputChange,
    onEnableChange,
    onCancelForm,
    onResetPassword
  } = props;

  return (
    <>
      <header className={classes.header}>
        <Avatar className={classes.avatar}>
          {user.firstName.charAt(0)}
          {user.lastName?.charAt(0) ?? ''}
        </Avatar>
        <section className={classes.userInfo}>
          <Typography variant="h6" component="h2">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="subtitle1" noWrap title={user.username}>
            {user.username}
          </Typography>
        </section>
        <section className={classes.actions}>
          {managedInStudio ? (
            <>
              <Tooltip title={<FormattedMessage id="userInfoDialog.resetPassword" defaultMessage="Reset password" />}>
                <IconButton onClick={() => onResetPassword(true)} size="large">
                  <PasswordRoundedIcon />
                </IconButton>
              </Tooltip>
              <ConfirmDropdown
                cancelText={formatMessage(translations.confirmCancel)}
                confirmText={formatMessage(translations.confirmOk)}
                confirmHelperText={formatMessage(translations.confirmHelperText, {
                  username: user.username
                })}
                iconTooltip={<FormattedMessage id="userInfoDialog.deleteUser" defaultMessage="Delete user" />}
                icon={DeleteRoundedIcon}
                onConfirm={() => {
                  onDelete(user.username);
                }}
              />
            </>
          ) : (
            <Chip label={formatMessage(translations.externallyManaged)} size="small" className={classes.chip} />
          )}
          <Tooltip title={<FormattedMessage id="userInfoDialog.close" defaultMessage="Close" />}>
            <IconButton edge="end" onClick={onCloseButtonClick} size="large">
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </section>
      </header>
      <Divider />
      <DialogBody className={classes.body}>
        <Grid container>
          <Grid size={{ sm: 6 }}>
            <section className={classes.section}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                <FormattedMessage id="userInfoDialog.userDetails" defaultMessage="User Details" />
              </Typography>
              <form>
                <div className={classes.row}>
                  <Typography color="textSecondary" className={classes.label}>
                    <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
                  </Typography>
                  <div className={classes.switchWrapper}>
                    <Switch
                      disabled={!managedInStudio}
                      checked={user.enabled}
                      onChange={(e) => onEnableChange({ enabled: e.target.checked })}
                      color="primary"
                      name="enabled"
                      inputProps={{ 'aria-label': 'enabled checkbox' }}
                    />
                  </div>
                </div>
                <Divider />
                <div className={classes.row}>
                  <Typography color="textSecondary" className={classes.label}>
                    <FormattedMessage id="words.username" defaultMessage="Username" />
                  </Typography>
                  <section className={classes.userNameWrapper}>
                    <Typography noWrap title={user.username}>
                      {user.username}
                    </Typography>
                  </section>
                </div>
                <div className={classes.row}>
                  <InputLabel htmlFor="firstName" className={classes.label}>
                    <Typography color="textSecondary">
                      <FormattedMessage id="words.firstName" defaultMessage="First name" />
                    </Typography>
                  </InputLabel>
                  {managedInStudio ? (
                    <TextField
                      id="firstName"
                      onChange={(e) => onInputChange({ firstName: e.currentTarget.value })}
                      inputProps={{ maxLength: USER_FIRST_NAME_MAX_LENGTH }}
                      value={user.firstName}
                      fullWidth
                      error={
                        validateRequiredField(user.firstName) || validateFieldMinLength('firstName', user.firstName)
                      }
                      helperText={
                        validateRequiredField(user.firstName) ? (
                          <FormattedMessage
                            id="editUserDialog.firstNameRequired"
                            defaultMessage="First Name is required"
                          />
                        ) : validateFieldMinLength('firstName', user.firstName) ? (
                          formatMessage(translations.invalidMinLength, { length: USER_FIRST_NAME_MIN_LENGTH })
                        ) : null
                      }
                    />
                  ) : (
                    <Typography className={classes.userNameWrapper} children={user.firstName} />
                  )}
                </div>
                <div className={classes.row}>
                  <InputLabel htmlFor="lastName" className={classes.label}>
                    <Typography color="textSecondary">
                      <FormattedMessage id="words.lastName" defaultMessage="Last name" />
                    </Typography>
                  </InputLabel>
                  {managedInStudio ? (
                    <TextField
                      id="lastName"
                      onChange={(e) => onInputChange({ lastName: e.currentTarget.value })}
                      inputProps={{ maxLength: USER_LAST_NAME_MAX_LENGTH }}
                      value={user.lastName}
                      fullWidth
                      error={validateRequiredField(user.lastName) || validateFieldMinLength('lastName', user.lastName)}
                      helperText={
                        validateRequiredField(user.lastName) ? (
                          <FormattedMessage
                            id="editUserDialog.lastNameRequired"
                            defaultMessage="Last Name is required"
                          />
                        ) : validateFieldMinLength('lastName', user.lastName) ? (
                          formatMessage(translations.invalidMinLength, { length: USER_LAST_NAME_MIN_LENGTH })
                        ) : null
                      }
                    />
                  ) : (
                    <Typography className={classes.userNameWrapper} children={user.lastName} />
                  )}
                </div>
                <div className={classes.row}>
                  <InputLabel htmlFor="email" className={classes.label}>
                    <Typography color="textSecondary">
                      <FormattedMessage id="words.email" defaultMessage="E-mail" />
                    </Typography>
                  </InputLabel>
                  {managedInStudio ? (
                    <TextField
                      id="email"
                      onChange={(e) => onInputChange({ email: e.currentTarget.value })}
                      value={user.email}
                      error={validateRequiredField(user.email) || isInvalidEmail(user.email)}
                      fullWidth
                      helperText={
                        validateRequiredField(user.email) ? (
                          <FormattedMessage id="editUserDialog.emailRequired" defaultMessage="Email is required" />
                        ) : isInvalidEmail(user.email) ? (
                          <FormattedMessage id="editUserDialog.invalidEmail" defaultMessage="Email is invalid" />
                        ) : null
                      }
                      inputProps={{ maxLength: USER_EMAIL_MAX_LENGTH }}
                    />
                  ) : (
                    <Typography className={classes.userNameWrapper} children={user.email} />
                  )}
                </div>
                {managedInStudio && (
                  <div className={classes.formActions}>
                    <SecondaryButton disabled={!dirty || inProgress} onClick={onCancelForm}>
                      <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
                    </SecondaryButton>
                    <PrimaryButton disabled={!dirty || !submitOk || inProgress} onClick={onSave} loading={inProgress}>
                      <FormattedMessage id="words.save" defaultMessage="Save" />
                    </PrimaryButton>
                  </div>
                )}
              </form>
            </section>
          </Grid>
          <Grid size={{ sm: 6 }}>
            <section className={classes.section}>
              <UserGroupMembershipEditor username={user.username} />
            </section>
          </Grid>
        </Grid>
        <Divider />
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="userInfoDialog.siteRoles" defaultMessage="Roles per project" />
          </Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              {sites.map((site) => (
                <Typography key={site.id} variant="body2" className={classes.siteItem}>
                  {site.name}
                </Typography>
              ))}
            </Grid>
            <Grid size={8}>
              {sites.map((site, i) =>
                rolesBySite[site.id] ? (
                  rolesBySite[site.id].length ? (
                    <Typography key={site.id} variant="body2" className={classes.siteItem}>
                      {rolesBySite[site.id].join(', ')}
                    </Typography>
                  ) : (
                    <Typography key={site.id} variant="body2" color="textSecondary" className={classes.siteItem}>
                      (<FormattedMessage id="userInfoDialog.noRoles" defaultMessage="No roles" />)
                    </Typography>
                  )
                ) : (
                  <Skeleton key={i} variant="text" className={classes.siteItem} style={{ width: `${rand(50, 90)}%` }} />
                )
              )}
            </Grid>
          </Grid>
        </section>
      </DialogBody>
      {managedInStudio && (
        <ResetPasswordDialog
          open={openResetPassword}
          passwordRequirementsMinComplexity={passwordRequirementsMinComplexity}
          user={user}
          onClose={onCloseResetPasswordDialog}
        />
      )}
    </>
  );
}

export default EditUserDialogUI;
