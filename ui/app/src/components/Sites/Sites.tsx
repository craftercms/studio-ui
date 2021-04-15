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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import SitesGrid from './SitesGrid';

const styles = makeStyles((theme) =>
  createStyles({
    title: {
      marginBottom: '25px',
      color: theme.palette.text.primary
    },
    createSite: {
      margin: '10px 0',
      borderRadius: '50px',
      border: 0,
      padding: '5px 25px',
      boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.2)'
    },
    mb20: {
      marginBottom: '20px'
    }
  })
);

interface SitesProps {
  limit?: number;
}

export default function Sites(props: SitesProps) {
  const classes = styles();
  const onCreateSite = () => {};
  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="GlobalMenu.Sites" defaultMessage="Sites" />
      </Typography>
      <Divider />
      <SecondaryButton startIcon={<AddIcon />} className={classes.createSite} onClick={onCreateSite}>
        <FormattedMessage id="sites.createSite" defaultMessage="Create Site" />
      </SecondaryButton>
      <Divider className={classes.mb20} />
      <SitesGrid limit={props.limit} />
    </section>
  );
}
