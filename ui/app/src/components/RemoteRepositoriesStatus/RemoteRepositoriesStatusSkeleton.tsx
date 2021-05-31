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
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      paddingLeft: 0,
      paddingRight: 0,
      alignItems: 'center'
    }
  })
);

export default function RemoteRepositoriesStatusSkeleton() {
  const classes = useStyles();

  return (
    <>
      <Toolbar className={classes.toolbar}>
        <section style={{ width: '100%' }}>
          <Typography variant="h5">
            <Skeleton variant="text" width="30%" />
          </Typography>
          <Skeleton variant="text" width="20%" />
        </section>
      </Toolbar>
    </>
  );
}
