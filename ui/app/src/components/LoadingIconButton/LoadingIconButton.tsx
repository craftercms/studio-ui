/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton';

export function LoadingIconButton(props: LoadingButtonProps) {
  const { sx, ...rest } = props;

  return (
    <LoadingButton
      {...rest}
      sx={{
        borderRadius: '50%',
        padding: '8px',
        minWidth: 0,
        color: (theme) => (theme.palette.mode === 'dark' ? 'white' : theme.palette.grey[600]),
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
        },
        ...sx
      }}
    >
      {props.children}
    </LoadingButton>
  );
}

export default LoadingIconButton;
