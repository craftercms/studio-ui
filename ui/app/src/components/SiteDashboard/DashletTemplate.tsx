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

import React, { PropsWithChildren } from 'react';
import { CommonDashletProps, parseDashletContentHeight } from './utils';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Box, { BoxProps } from '@mui/material/Box';
import { UNDEFINED } from '../../utils/constants';

export function DashletTemplate(
  props: PropsWithChildren<
    CommonDashletProps & {
      title: React.ReactNode;
      actionsBar?: React.ReactNode;
      actionsBarHeight?: number;
      headerAction?: React.ReactNode;
      sx?: Partial<{
        card: BoxProps['sx'];
        content: BoxProps['sx'];
        header: BoxProps['sx'];
        actionsBar: BoxProps['sx'];
      }>;
    }
  >
) {
  const {
    sx,
    children,
    actionsBar,
    title,
    borderLeftColor,
    contentHeight: contentHeightProp,
    actionsBarHeight = 35,
    headerAction
  } = props;
  const contentHeight = contentHeightProp
    ? // Subtract toolbar height to avoid misalignment with other widgets
      parseDashletContentHeight(contentHeightProp) - (actionsBar ? actionsBarHeight : 0)
    : UNDEFINED;
  return (
    <Card sx={{ borderLeft: 5, borderLeftColor, ...sx?.card }}>
      {/* region Header */}
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', component: 'h2' }}
        action={headerAction}
        sx={sx?.header}
      />
      {/* endregion */}
      <Divider />
      {actionsBar && (
        <Box
          display="flex"
          sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', pr: 1, pl: 1, ...sx?.actionsBar }}
        >
          {actionsBar}
        </Box>
      )}
      {/* region Body */}
      <CardContent sx={{ overflow: 'auto', height: parseDashletContentHeight(contentHeight), pt: 0, ...sx?.content }}>
        {children}
      </CardContent>
      {/* endregion */}
    </Card>
  );
}

export default DashletTemplate;
