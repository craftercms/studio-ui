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

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';

const useStyles = makeStyles((theme) => ({
  progress: {
    margin: theme.spacing(2)
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: (props: any) => props.background,
    transform: 'translate(-50%, -50%)'
  }
}));

interface SpinnerProps {
  background?: string;
}

export function Spinner(props: SpinnerProps) {
  const classes = useStyles({ background: props.background || '#fff' });
  // @ts-ignore
  return (
    <div className={classes.center}>
      <CircularProgress className={classes.progress} />
    </div>
  );
}

export default Spinner;
