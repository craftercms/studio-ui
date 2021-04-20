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

import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';
import SecondaryButton from '../SecondaryButton';
import AddIcon from '@material-ui/icons/Add';
import React, { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import UsersGrid from '../UsersGrid';
import CreateUserDialog from '../CreateUserDialog';

interface UsersManagementProps {
  passwordRequirementsRegex?: string;
}

const styles = makeStyles((theme) =>
  createStyles({
    title: {
      marginBottom: '25px',
      color: theme.palette.text.primary
    },
    createUser: {
      margin: '10px 0',
      borderRadius: '50px',
      border: 0,
      padding: '5px 25px',
      boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.2)'
    }
  })
);

export default function UsersManagement(props: UsersManagementProps) {
  const classes = styles();
  const {
    passwordRequirementsRegex = '^(?=(?<hasNumbers>.*[0-9]))(?=(?<hasLowercase>.*[a-z]))(?=(?<hasUppercase>.*[A-Z]))(?=(?<hasSpecialChars>.*[~|!`,;/@#$%^&+=]))(?<minLength>.{8,})$'
  } = props;
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);

  const onUserCreated = () => {
    setOpenCreateUserDialog(false);
  };

  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="GlobalMenu.Users" defaultMessage="Users" />
      </Typography>
      <Divider />
      <SecondaryButton
        startIcon={<AddIcon />}
        className={classes.createUser}
        onClick={() => setOpenCreateUserDialog(true)}
      >
        <FormattedMessage id="sites.createUser" defaultMessage="Create User" />
      </SecondaryButton>
      <Divider />
      <UsersGrid passwordRequirementsRegex={passwordRequirementsRegex} />
      <CreateUserDialog
        open={openCreateUserDialog}
        onCreateSuccess={onUserCreated}
        onClose={() => setOpenCreateUserDialog(false)}
        passwordRequirementsRegex={passwordRequirementsRegex}
      />
    </section>
  );
}
