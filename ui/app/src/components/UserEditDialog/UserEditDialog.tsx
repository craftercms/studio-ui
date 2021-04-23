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

import Dialog from '@material-ui/core/Dialog';
import React, { useEffect, useMemo, useState } from 'react';
import DialogBody from '../Dialogs/DialogBody';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import User from '../../models/User';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PasswordRoundedIcon from '@material-ui/icons/VpnKeyRounded';
import Input from '@material-ui/core/Input';
import { useSitesBranch, useSpreadState } from '../../utils/hooks';
import { disable, enable, fetchRolesBySite, trash, update } from '../../services/users';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import clsx from 'clsx';
import LookupTable from '../../models/LookupTable';
import { Skeleton } from '@material-ui/lab';
import { rand } from '../PathNavigator/utils';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import ResetPasswordDialog from '../ResetPasswordDialog';
import { styles } from './styles';
import { Site } from '../../models/Site';

const translations = defineMessages({
  externallyManaged: {
    id: 'userInfoDialog.externallyManaged',
    defaultMessage: 'Externally managed'
  },
  userDeleted: {
    id: 'userInfoDialog.userDeleted',
    defaultMessage: 'User deleted successfully'
  },
  userUpdated: {
    id: 'userInfoDialog.userUpdated',
    defaultMessage: 'User updated successfully'
  },
  userEnabled: {
    id: 'userInfoDialog.userEnabled',
    defaultMessage: 'User enabled successfully'
  },
  userDisabled: {
    id: 'userInfoDialog.userDisabled',
    defaultMessage: 'User disabled successfully'
  },
  siteName: {
    id: 'userInfoDialog.siteName',
    defaultMessage: 'Site name'
  },
  roles: {
    id: 'words.roles',
    defaultMessage: 'Roles'
  },
  confirmHelperText: {
    id: 'userInfoDialog.helperText',
    defaultMessage: 'Delete "{username}" user?'
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

interface UserInfoDialogProps {
  open: boolean;
  onClose(): void;
  onUserEdited(): void;
  user: User;
  passwordRequirementsRegex: string;
}

export default function UserEditDialog(props: UserInfoDialogProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <UserInfoDialogContainer {...props} />
    </Dialog>
  );
}

export function UserInfoDialogContainer(props: UserInfoDialogProps) {
  const { open, onClose, onUserEdited, passwordRequirementsRegex } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const classes = styles();
  const [user, setUser] = useSpreadState<User>({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    enabled: false,
    externallyManaged: false
  });
  const sites = useSitesBranch();
  const sitesById = sites.byId;
  const mySites = useMemo(() => Object.values(sitesById), [sitesById]);
  const [lastSavedUser, setLastSavedUser] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [rolesBySite, setRolesBySite] = useState<LookupTable<string[]>>({});
  const [dirty, setDirty] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  const editMode = !props.user?.externallyManaged;

  useEffect(() => {
    if (open) {
      setUser(props.user);
    }
  }, [props.user, open, setUser]);

  useEffect(() => {
    if (mySites.length && props.user?.username) {
      fetchRolesBySite(props.user.username, mySites).subscribe((response) => {
        setRolesBySite(response);
      });
    }
  }, [mySites, props.user?.username]);

  const onInputChange = (value: object) => {
    setDirty(true);
    setUser(value);
  };

  const onCancelForm = () => {
    if (lastSavedUser) {
      setUser(lastSavedUser);
    } else {
      setUser(props.user);
    }
    setDirty(false);
  };

  const onEnableChange = (value) => {
    setUser(value);
    if (value.enabled) {
      enable(user.username).subscribe(
        () => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.userEnabled)
            })
          );
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    } else {
      disable(user.username).subscribe(
        () => {
          dispatch(
            showSystemNotification({
              message: formatMessage(translations.userDisabled)
            })
          );
        },
        ({ response: { response } }) => {
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  };

  const onSave = () => {
    if (!editMode) {
      return;
    }
    setInProgress(true);
    update(user).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.userUpdated)
          })
        );
        setDirty(false);
        setInProgress(false);
        setLastSavedUser(user);
        onUserEdited();
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onDelete = (username: string) => {
    trash(username).subscribe(
      () => {
        onClose();
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.userDeleted)
          })
        );
        onUserEdited();
      },
      ({ response: { response } }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCloseResetPasswordDialog = () => {
    setOpenResetPassword(false);
  };

  const onResetPassword = (value: boolean) => {
    setOpenResetPassword(value);
  };

  return (
    <UserInfoDialogUI
      user={user}
      editMode={editMode}
      openResetPassword={openResetPassword}
      inProgress={inProgress}
      dirty={dirty}
      sites={mySites}
      rolesBySite={rolesBySite}
      passwordRequirementsRegex={passwordRequirementsRegex}
      onSave={onSave}
      onClose={onClose}
      onDelete={onDelete}
      onCloseResetPasswordDialog={onCloseResetPasswordDialog}
      onInputChange={onInputChange}
      onEnableChange={onEnableChange}
      onCancelForm={onCancelForm}
      onResetPassword={onResetPassword}
    />
  );
}

interface UserInfoDialogUIProps {
  user: User;
  editMode: boolean;
  inProgress: boolean;
  dirty: boolean;
  openResetPassword: boolean;
  sites: Site[];
  passwordRequirementsRegex: string;
  rolesBySite: LookupTable<string[]>;
  onInputChange(value: object): void;
  onEnableChange(value: object): void;
  onCancelForm(): void;
  onSave(): void;
  onClose(): void;
  onCloseResetPasswordDialog(): void;
  onDelete(username: string): void;
  onResetPassword(value: boolean): void;
}

export function UserInfoDialogUI(props: UserInfoDialogUIProps) {
  const classes = styles();
  const { formatMessage } = useIntl();
  const {
    user,
    editMode,
    inProgress,
    dirty,
    openResetPassword,
    sites,
    rolesBySite,
    passwordRequirementsRegex,
    onSave,
    onClose,
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
          <Typography variant="subtitle1">{user.username}</Typography>
        </section>
        <section className={classes.actions}>
          {
            <Tooltip title={<FormattedMessage id="userInfoDialog.resetPassword" defaultMessage="Reset password" />}>
              <IconButton onClick={() => onResetPassword(true)}>
                <PasswordRoundedIcon />
              </IconButton>
            </Tooltip>
          }
          <ConfirmDropdown
            cancelText={formatMessage(translations.confirmCancel)}
            confirmText={formatMessage(translations.confirmOk)}
            confirmHelperText={formatMessage(translations.confirmHelperText, {
              username: user.username
            })}
            iconTooltip={<FormattedMessage id="userInfoDialog.deleteUser" defaultMessage="Delete user" />}
            icon={DeleteRoundedIcon}
            iconColor="action"
            onConfirm={() => {
              onDelete(user.username);
            }}
          />
          <Tooltip title={<FormattedMessage id="userInfoDialog.close" defaultMessage="Close" />}>
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
            <FormattedMessage id="userInfoDialog.userDetails" defaultMessage="User Details" />
          </Typography>
          <form>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
              </Typography>
              <div className={classes.switchWrapper}>
                <Switch
                  disabled={!editMode}
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
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
              <section className={classes.userNameWrapper}>
                <Typography variant="body2">{user.username}</Typography>
                {props.user?.externallyManaged && (
                  <Chip label={formatMessage(translations.externallyManaged)} size="small" className={classes.chip} />
                )}
              </section>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="userInfoDialog.firstName" defaultMessage="First name" />
              </Typography>
              <Input
                onChange={(e) => onInputChange({ firstName: e.currentTarget.value })}
                value={user.firstName}
                fullWidth
                readOnly={!editMode}
                classes={{ ...(!editMode && { root: classes.inputRoot, input: classes.readOnlyInput }) }}
              />
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="userInfoDialog.lastName" defaultMessage="Last name" />
              </Typography>
              <Input
                onChange={(e) => onInputChange({ lastName: e.currentTarget.value })}
                value={user.lastName}
                fullWidth
                readOnly={!editMode}
                classes={{ ...(!editMode && { root: classes.inputRoot, input: classes.readOnlyInput }) }}
              />
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="words.email" defaultMessage="Email" />
              </Typography>
              <Input
                onChange={(e) => onInputChange({ email: e.currentTarget.value })}
                value={user.email}
                fullWidth
                readOnly={!editMode}
                classes={{ ...(!editMode && { root: classes.inputRoot, input: classes.readOnlyInput }) }}
              />
            </div>
            {editMode && (
              <div className={classes.formActions}>
                <SecondaryButton disabled={!dirty || inProgress} onClick={onCancelForm}>
                  <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
                </SecondaryButton>
                <PrimaryButton disabled={!dirty || inProgress} onClick={onSave} loading={inProgress}>
                  <FormattedMessage id="words.save" defaultMessage="Save" />
                </PrimaryButton>
              </div>
            )}
          </form>
        </section>
        <Divider />
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="userInfoDialog.siteMemberships" defaultMessage="Site Memberships" />
          </Typography>
          <Grid container spacing={3} className={classes.membershipsWrapper}>
            <Grid item xs={4}>
              <Typography variant="subtitle2" color="textSecondary">
                {formatMessage(translations.siteName)}
              </Typography>
              {sites.map((site) => (
                <Typography key={site.id} variant="body2" className={classes.siteItem}>
                  {site.name}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={8}>
              <Typography variant="subtitle2" color="textSecondary">
                {formatMessage(translations.roles)}
              </Typography>
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
      <ResetPasswordDialog
        open={openResetPassword}
        passwordRequirementsRegex={passwordRequirementsRegex}
        user={user}
        onClose={onCloseResetPasswordDialog}
      />
    </>
  );
}
