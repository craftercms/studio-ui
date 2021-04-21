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
import React from 'react';
import { useStyles } from './styles';

export default function GroupsManagement() {
  const classes = useStyles();
  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="GlobalMenu.Groups" defaultMessage="Groups" />
      </Typography>
      <Divider />
      <section className={classes.actionsBar}>
        <SecondaryButton startIcon={<AddIcon />} className={classes.createGroup}>
          <FormattedMessage id="sites.createGroup" defaultMessage="Create Group" />
        </SecondaryButton>
      </section>
      <Divider className={classes.mb20} />
    </section>
  );
}
