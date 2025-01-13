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

import { FileDiff } from '../../models/Repository';
import React from 'react';

import AceEditor from '../AceEditor/AceEditor';
import ConflictedPathDiffDialogSplitView from './ConflictedPathDiffDialogSplitView';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';

const tabsHeight = 450;

export interface RemoteRepositoriesDiffDialogUIProps {
  fileDiff: FileDiff;
  tab: number;
}

export function ConflictedPathDiffDialogUI(props: RemoteRepositoriesDiffDialogUIProps) {
  const { fileDiff, tab } = props;

  return (
    <Box
      sx={{
        height: tabsHeight,
        overflowX: 'auto',
        '& .ace_editor': {
          margin: 0
        }
      }}
    >
      {tab === 0 && <AceEditor mode="ace/mode/diff" autoFocus={false} readOnly value={fileDiff.diff} />}

      {tab === 1 && (
        <>
          <Grid
            container
            sx={{
              width: 'calc(100% - 30px)',
              textAlign: 'center',
              backgroundColor: (theme) => theme.palette.background.paper
            }}
          >
            <Grid size={6}>
              <Typography variant="body1">
                <FormattedMessage id="words.local" defaultMessage="Local" />
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body1">
                <FormattedMessage id="words.remote" defaultMessage="Remote" />
              </Typography>
            </Grid>
          </Grid>
          <ConflictedPathDiffDialogSplitView
            diff={fileDiff}
            sx={{
              width: '100%',
              height: 'calc(100% - 24px)',
              '&.unChanged': {
                height: 'auto'
              }
            }}
          />
        </>
      )}
    </Box>
  );
}

export default ConflictedPathDiffDialogUI;
