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
import { Divider } from '@material-ui/core';
import User from '../../models/User';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteRoundedIcon from '@material-ui/icons/DeleteRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import Input from '@material-ui/core/Input';
import { useSpreadState } from '../../utils/hooks';
import { update } from '../../services/users';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';

const styles = makeStyles(() =>
  createStyles({
    header: {
      padding: '30px 40px',
      display: 'flex',
      alignItems: 'center'
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
      padding: '30px 40px'
    },
    row: {
      display: 'flex',
      padding: '15px 0',
      alignItems: 'center'
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
      '&:focus': {
        boxShadow: 'none'
      }
    }
  })
);

const translations = defineMessages({
  userUpdated: {
    id: 'userInfoDialog.userUpdated',
    defaultMessage: 'User updated successfully'
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
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useSpreadState(null);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  useEffect(() => {
    if (open) {
      setUser(props.user);
    }
  }, [props.user, open, setUser]);
  const classes = styles();

  const onInputChange = (value) => {
    setUser(value);
  };

  const onInputBlur = () => {
    if (!editMode || JSON.stringify(user) === JSON.stringify(props.user)) {
      return;
    }
    update(user).subscribe(
      () => {
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.userUpdated)
          })
        );
      },
      ({ response }) => {
        dispatch(showErrorDialog({ error: response }));
      }
    );
    console.log();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <header className={classes.header}>
        <Avatar className={classes.avatar}>{props.user?.firstName.charAt(0)}</Avatar>
        <section className={classes.userInfo}>
          <Typography variant="h6" component="h2">
            {props.user?.firstName} {props.user?.lastName}
          </Typography>
          <Typography variant="subtitle1">{props.user?.username}</Typography>
        </section>
        <section className={classes.actions}>
          <IconButton onClick={() => setEditMode(!editMode)}>
            <EditRoundedIcon />
          </IconButton>
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
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="userInfoDialog.userDetails" defaultMessage="User Details" />
          </Typography>
          <form>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
              <Input
                onChange={(e) => onInputChange({ userName: e.currentTarget.value })}
                onBlur={onInputBlur}
                value={user?.username}
                fullWidth
                readOnly
                classes={{ root: classes.inputRoot, input: classes.readOnlyInput }}
              />
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="userInfoDialog.firstName" defaultMessage="First name" />
              </Typography>
              <Input
                onChange={(e) => onInputChange({ firstName: e.currentTarget.value })}
                onBlur={onInputBlur}
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
                onBlur={onInputBlur}
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
                onBlur={onInputBlur}
                value={user?.email}
                fullWidth
                readOnly={!editMode}
                classes={{ ...(!editMode && { root: classes.inputRoot, input: classes.readOnlyInput }) }}
              />
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
              </Typography>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2" className={classes.label}>
                <FormattedMessage id="userInfoDialog.externallyManaged" defaultMessage="Externally managed" />
              </Typography>
            </div>
          </form>
        </section>
        <Divider />
        <section className={classes.section}>
          <Typography variant="subtitle1" className={classes.sectionTitle}>
            <FormattedMessage id="userInfoDialog.siteMemberships" defaultMessage="Site Memberships" />
          </Typography>
        </section>
      </DialogBody>
    </Dialog>
  );
}
