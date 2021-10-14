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
import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';

export interface DragGhostElementProps {
  sx?: SxProps<Theme>;
  label: string;
}

export function DragGhostElement(props: DragGhostElementProps) {
  return (
    <Box
      className="craftercms-dragged-element"
      sx={{
        display: 'block',
        maxWidth: 200,
        backgroundColor: 'common.white',
        color: 'text.secondary',
        padding: '5px 10px',
        borderRadius: 1,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        position: 'absolute',
        // top: -1000,
        left: -1000,
        ...props.sx
      }}
    >
      {props.label}
    </Box>
  );
}

export default DragGhostElement;
