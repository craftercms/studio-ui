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
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import { Theme } from '@material-ui/core';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import { ProgressBar } from '../BulkUpload';
import StandardAction from '../../models/StandardAction';
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme: Theme) => createStyles({
  wrapper: {
    display: 'flex',
    position: 'absolute',
    bottom: '20px',
    right: '20px'
  },
  root: {
    display: 'flex',
    padding: '10px 14px',
    alignItems: 'center',
    marginLeft: '20px'
  },
  title: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '14px',
    marginLeft: '15px'
  }
}));

function createCallback(
  action: StandardAction,
  dispatch: Dispatch,
  fallbackAction?: StandardAction
): () => void {
  return action ? () => dispatch(action) : fallbackAction ? () => dispatch(fallbackAction) : null;
}

interface MinimizedBarProps {
  title: string;
  subtitle?: string;
  status?: any;

  onMaximized?(): void;
}

function MinimizedBar(props: MinimizedBarProps) {
  const { title, onMaximized, subtitle, status } = props;
  const classes = useStyles({});
  return (
    <Paper className={classes.root}>
      <Typography variant="h6">{title}</Typography>
      {
        subtitle &&
        <Typography variant="subtitle1" className={classes.subtitle}>{subtitle}</Typography>
      }
      {onMaximized ? (
        <IconButton aria-label="close" onClick={onMaximized}>
          <AddRoundedIcon/>
        </IconButton>
      ) : null}
      {
        status &&
        <ProgressBar status={status.status} progress={status.progress}/>
      }
    </Paper>
  )
}

export interface tab {
  id: string;
  title: string;
  subtitle?: string;
  onMaximized?: StandardAction;
}

export interface DialogTabsManagerStateProps {
  tabs: tab [];
}

export default function DialogsTabsManager(props: DialogTabsManagerStateProps) {
  const classes = useStyles({});
  const { tabs } = props;
  const dispatch = useDispatch();
  return (
    <div className={classes.wrapper}>
      {
        tabs.map(tab =>
          <MinimizedBar
            key={tab.id}
            title={tab.title}
            subtitle={tab.subtitle}
            onMaximized={createCallback(tab.onMaximized, dispatch)}
          />
        )
      }
    </div>
  );
}
