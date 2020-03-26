/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { palette } from '../../../styles/theme';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: palette.white,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 10px'
  },
  textWrapper: {
    display: 'flex',
    '& > *': {
      marginRight: 17,
    },
    '& > p': {
      color: palette.black
    }
  },
  title: {
    fontWeight: 600
  },
  changeBtn: {
    padding: 0
  }
}));

export default function NewContentSelect() {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={0}>
      <div className={classes.textWrapper}>
        <Typography variant="body1" className={classes.title}>
          Parent Item
        </Typography>
        <Typography variant="body1">
          Home
        </Typography>
      </div>
      <Button color="primary" className={classes.changeBtn}>Change</Button>
    </Paper>
  );
}
