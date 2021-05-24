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

const tabsHeight = 450;
const useStyles = makeStyles((theme) =>
  createStyles({
    diffTab: {
      height: tabsHeight,
      overflowX: 'auto'
    },
    diffContent: {
      fontSize: '14px',
      background: 'none',
      border: 'none'
    },
    splitView: {
      height: Math.floor(tabsHeight / 2),
      overflowX: 'auto'
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
          <pre className={classes.diffContent}>{fileDiff.diff}</pre>
        </div>
      )}

      {tab === 1 && (
        <div className={classes.diffTab}>
          <div className={classes.splitView}>
            <pre className={classes.diffContent}> {fileDiff.studioVersion}</pre>
          </div>
          <div className={classes.splitView}>
            <pre className={classes.diffContent}>{fileDiff.remoteVersion}</pre>
          </div>
        </div>
      )}
    </>
  );
}

export default RemoteRepositoriesDiffDialogUI;
