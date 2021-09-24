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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MaximizeIcon from '@material-ui/icons/OpenInBrowserRounded';
import React, { ReactNode } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import MinimizedBarPortal from '../MinimizedBarPortal/MinimizedBarPortal';

export interface MinimizedBarProps {
  open: boolean;
  title: ReactNode;
  subtitle?: string;
  status?: 'indeterminate' | number;
  onMaximize?(): void;
}

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: '10px 14px',
      alignItems: 'center',
      marginLeft: '20px',
      position: 'relative',
      border: `1px solid ${theme.palette.divider}`
    },
    title: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    subtitle: {
      fontSize: '14px',
      marginLeft: '15px'
    },
    indeterminateProgressBar: {
      position: 'absolute',
      bottom: ' 0px',
      width: '100%',
      left: '0',
      borderBottomLeftRadius: '3px',
      borderBottomRightRadius: '3px'
    }
  })
);

export function MinimizedBar(props: MinimizedBarProps) {
  const { open, title, onMaximize, subtitle, status } = props;
  const classes = useStyles();
  return open ? (
    <MinimizedBarPortal>
      <Paper className={classes.root} elevation={4}>
        <Box>
          <Typography variant="body1" children={title} />
          {subtitle && <Typography variant="body2" className={classes.subtitle} children={subtitle} />}
        </Box>
        {onMaximize ? <IconButton aria-label="Maximize" onClick={onMaximize} children={<MaximizeIcon />} /> : null}
        {status && (
          <LinearProgress
            className={classes.indeterminateProgressBar}
            variant={status === 'indeterminate' ? 'indeterminate' : 'determinate'}
            value={status === 'indeterminate' ? null : status}
          />
        )}
      </Paper>
    </MinimizedBarPortal>
  ) : null;
}

export default MinimizedBar;
