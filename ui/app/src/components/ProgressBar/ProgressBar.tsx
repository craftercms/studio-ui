/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import clsx from 'clsx';
import React from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import palette from '../../styles/palette';

export interface ProgressBarProps {
  status: 'failed' | 'complete';
  progress: number;
}

const progressBarStyles = makeStyles((theme: Theme) =>
  createStyles({
    progressBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      transition: 'height .2s'
    },
    progressBarInner: {
      backgroundColor: palette.blue.tint,
      height: '100%',
      width: 0,
      transition: 'width 0.4s ease',
      '&.complete': {
        transition: 'background-color 0.5s ease',
        backgroundColor: palette.green.main
      },
      '&.failed': {
        backgroundColor: palette.red.main
      }
    }
  })
);

export function ProgressBar(props: ProgressBarProps) {
  const { status, progress } = props;
  const classes = progressBarStyles({});
  return (
    <div className={classes.progressBar}>
      <div
        className={clsx(classes.progressBarInner, status === 'failed' && 'failed', progress === 100 && 'complete')}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ProgressBar;
