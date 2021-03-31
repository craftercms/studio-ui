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
import React, { useEffect, useState } from 'react';
import DialogBody from '../Dialogs/DialogBody';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Chip, Divider, Grid, Switch } from '@material-ui/core';
import User from '../../models/User';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Input from '@material-ui/core/Input';
import { useSitesBranch, useSpreadState } from '../../utils/hooks';
import { disable, enable, update } from '../../services/users';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = makeStyles((theme) =>
  createStyles({
    header: {
      padding: '30px 40px',
      display: 'flex',
      alignItems: 'center'
    },
    chip: {
      background: theme.palette.info.main,
      color: theme.palette.text.primary,
      marginLeft: 'auto'
    },
    avatar: {
      marginRight: '30px',
      width: '90px',
      height: '90px'
    },
    actions: {
      marginLeft: 'auto'
    },
    userInfo: {},
    body: {
      padding: 0
    },
    section: {
      padding: '30px 40px',
      '&.noPaddingBottom': {
        paddingBottom: 0
      }
    },
    row: {
      display: 'flex',
      padding: '15px 0',
      alignItems: 'center'
    },
    userNameWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    switchWrapper: {
      width: '100%',
      marginLeft: '-12px'
    },
    formActions: {
      display: 'flex',
      paddingBottom: '20px',
      '& button:first-child': {
        marginLeft: 'auto',
        marginRight: '10px'
      }
    },
    label: {
      flexBasis: '180px'
    },
    sectionTitle: {
      textTransform: 'uppercase',
      marginBottom: '10px'
    },
    inputRoot: {
      pointerEvents: 'none'
    },
    readOnlyInput: {
      background: 'none',
      borderColor: 'transparent',
      paddingLeft: 0,
      '&:focus': {
        boxShadow: 'none'
      }
    },
    membershipsWrapper: {
      marginTop: '13px'
    },
    siteItem: {
      margin: '10px 0'
    }
  })
);

const translations = defineMessages({
  externallyManaged: {
    id: 'userInfoDialog.externallyManaged',
    defaultMessage: 'Externally managed'
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
  }
});

interface UserInfoDialogProps {
  open: boolean;
  onClose(): void;
  onUserEdited(): void;
  user: User;
}

export function UserInfoDialog(props: UserInfoDialogProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <UserInfoDialogUI {...props} />
    </Dialog>
  );
}

export function UserInfoDialogUI(props: UserInfoDialogProps) {
  const { open, onClose, onUserEdited } = props;
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
  const [lastSavedUser, setLastSavedUser] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [dirty, setDirty] = useState(false);

  const editMode = !props.user.externallyManaged;

  useEffect(() => {
    if (open) {
      setUser(props.user);
    }
  }, [props.user, open, setUser]);

  useEffect(() => {
    if (Object.keys(sites).length) {
    }
  }, [sites]);

  const onInputChange = (value) => {
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

  return (
    <>
      <header className={classes.header}>
        <Avatar className={classes.avatar}>{props.user?.firstName.charAt(0)}</Avatar>
        <section className={classes.userInfo}>
          <Typography variant="h6" component="h2">
            {props.user?.firstName} {props.user?.lastName}
          </Typography>
          <Typography variant="subtitle1">{props.user?.username}</Typography>
        </section>
        <section className={classes.actions}>
          <IconButton>
            <DeleteRoundedIcon />
          </IconButton>
          <IconButton edge="end" onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
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
                  checked={user?.enabled}
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
                <Typography variant="body2">{user?.username}</Typography>
                {props.user.externallyManaged && (
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
                value={user?.firstName}
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
                value={user?.lastName}
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
                value={user?.email}
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
                <PrimaryButton disabled={!dirty || inProgress} onClick={onSave}>
                  {inProgress ? (
                    <CircularProgress size={15} />
                  ) : (
                    <FormattedMessage id="words.save" defaultMessage="Save" />
                  )}
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
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {formatMessage(translations.siteName)}
              </Typography>
              {Object.values(sitesById).map((site) => (
                <Typography key={site.id} variant="body2" className={classes.siteItem}>
                  {site.name}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="textSecondary">
                {formatMessage(translations.roles)}
              </Typography>
            </Grid>
          </Grid>
        </section>
      </DialogBody>
    </>
  );
}
