/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import React, { ReactNode } from 'react';
import ContentInstance from '../../../models/ContentInstance';

export interface DefaultFieldDiffViewProps {
  contentA: ContentInstance;
  contentB: ContentInstance;
  renderContent: (content) => ReactNode;
  noContent?: ReactNode;
  verticalLayout?: boolean;
}

export function DefaultFieldDiffView(props: DefaultFieldDiffViewProps) {
  const {
    contentA,
    contentB,
    renderContent,
    noContent = (
      <Box>
        <Typography color="textSecondary">no content set</Typography>
      </Box>
    ),
    verticalLayout = false
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        alignItems: verticalLayout ? 'center' : 'flex-start',
        justifyContent: 'space-around',
        flexDirection: verticalLayout ? 'column' : 'row',
        '> div': {
          flexGrow: verticalLayout && 1
        }
      }}
    >
      {contentA ? renderContent(contentA) : noContent}
      {verticalLayout && <Divider sx={{ width: '100%', mt: 1, mb: 1 }} />}
      {contentB ? renderContent(contentB) : noContent}
    </Box>
  );
}

export default DefaultFieldDiffView;
