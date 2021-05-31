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

import { Resource } from '../../models/Resource';
import { FileDiff } from '../../models/Repository';
import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AceEditor from '../AceEditor';
import RemoteRepositoriesDiffDialogSplitView from './RemoteRepositoriesDiffDialogSplitView';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';

const tabsHeight = 450;
const useStyles = makeStyles((theme) =>
  createStyles({
    diffTab: {
      height: tabsHeight,
      overflowX: 'auto',
      '& .ace_editor': {
        margin: 0
      }
    },
    diffContent: {
      fontSize: '14px',
      background: 'none',
      border: 'none'
    },
    splitView: {
      width: '100%',
      height: 'calc(100% - 24px)',
      '&.unChanged': {
        height: 'auto'
      }
    },
    labelsContainer: {
      width: 'calc(100% - 30px)',
      textAlign: 'center',
      backgroundColor: theme.palette.background.paper
    }
  })
);

export interface RemoteRepositoriesDiffDialogUIProps {
  resource: Resource<FileDiff>;
  tab: number;
}

export function RemoteRepositoriesDiffDialogUI(props: RemoteRepositoriesDiffDialogUIProps) {
  const { resource, tab } = props;
  const fileDiff = resource.read();
  const classes = useStyles();

  return (
    <>
      {tab === 0 && (
        <div className={classes.diffTab}>
          <AceEditor mode="ace/mode/diff" autoFocus={false} readOnly value={fileDiff.diff} />
        </div>
      )}

      {tab === 1 && (
        <div className={classes.diffTab}>
          <Grid container className={classes.labelsContainer}>
            <Grid item xs={6}>
              <Typography variant="body1">
                <FormattedMessage id="words.local" defaultMessage="Local" />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <FormattedMessage id="words.remote" defaultMessage="Remote" />
              </Typography>
            </Grid>
          </Grid>
          <RemoteRepositoriesDiffDialogSplitView diff={fileDiff} className={classes.splitView} />
        </div>
      )}
    </>
  );
}

export default RemoteRepositoriesDiffDialogUI;
