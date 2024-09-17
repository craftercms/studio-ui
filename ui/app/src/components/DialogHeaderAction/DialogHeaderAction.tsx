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

import IconButton from '@mui/material/IconButton';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import Button, { ButtonProps } from '@mui/material/Button';

export interface DialogHeaderActionProps extends ButtonProps {
  icon: SystemIconDescriptor;
  text?: string;
  tooltip?: string;
}

export function DialogHeaderAction(props: DialogHeaderActionProps) {
  const { icon, text, tooltip, disabled = false, ...rest } = props;
  return tooltip ? (
    <Tooltip title={disabled ? '' : tooltip}>
      {text ? (
        <Button {...rest} startIcon={<SystemIcon icon={icon} />} disabled={disabled} size="large">
          {text}
        </Button>
      ) : (
        <IconButton {...rest} disabled={disabled} size="large">
          <SystemIcon icon={icon} />
        </IconButton>
      )}
    </Tooltip>
  ) : text ? (
    <Button {...rest} startIcon={<SystemIcon icon={icon} />} disabled={disabled} size="large">
      {text}
    </Button>
  ) : (
    <IconButton {...rest} disabled={disabled} size="large">
      <SystemIcon icon={icon} />
    </IconButton>
  );
}

export default DialogHeaderAction;
