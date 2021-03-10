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
import React from 'react';
import DialogBody from '../Dialogs/DialogBody';
import { FormattedMessage } from 'react-intl';
import { Divider } from '@material-ui/core';
import User from '../../models/User';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() =>
  createStyles({
    header: {
      padding: '20px 30px',
      display: 'flex'
    },
    body: {},
    row: {}
  })
);

interface UserInfoDialogProps {
  open: boolean;
  onClose(): void;
  user: User;
}

export function UserInfoDialog(props: UserInfoDialogProps) {
  const { user, open, onClose } = props;
  const classes = styles();
  return (
    <Dialog open={open} onClose={onClose}>
      <header className={classes.header}>
        <Avatar>{user?.firstName.charAt(0)}</Avatar>
        <Typography variant="h6" component="h2">
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="subtitle1">{user?.username}</Typography>
      </header>
      <Divider />
      <DialogBody className={classes.body}>
        <section>
          <Typography variant="subtitle1">
            <FormattedMessage id="userInfoDialog.userDetails" defaultMessage="User Details" />
          </Typography>
          <form>
            <div className={classes.row}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.username" defaultMessage="Username" />
              </Typography>
              <Typography variant="body2">{user?.username}</Typography>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.email" defaultMessage="Email" />
              </Typography>
              <Typography variant="body2">{user?.email}</Typography>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2">
                <FormattedMessage id="userInfoDialog.authenticationType" defaultMessage="Authentication type" />
              </Typography>
              <Typography variant="body2">{user?.authenticationType}</Typography>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
              </Typography>
              <Typography variant="body2">{user?.enabled}</Typography>
            </div>
            <div className={classes.row}>
              <Typography variant="subtitle2">
                <FormattedMessage id="userInfoDialog.externallyManaged" defaultMessage="Externally managed" />
              </Typography>
              <Typography variant="body2">{user?.externallyManaged}</Typography>
            </div>
          </form>
        </section>
        <Divider />
        <section>
          <Typography variant="subtitle1">
            <FormattedMessage id="userInfoDialog.siteMemberships" defaultMessage="Site Memberships" />
          </Typography>
        </section>
      </DialogBody>
    </Dialog>
  );
}
