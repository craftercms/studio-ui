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

import React from 'react';
import { FullSxRecord } from '../../models';
import { PasswordStrengthDisplay, PasswordStrengthDisplayProps } from '../PasswordStrengthDisplay';
import Popper, { PopperProps } from '@mui/material/Popper';
import Paper from '@mui/material/Paper';

export type PasswordStrengthDisplayPopperClassKey = 'root' | 'paper';
export type PasswordStrengthDisplayPopperFullSx = FullSxRecord<PasswordStrengthDisplayPopperClassKey>;

export interface PasswordStrengthDisplayPopperProps extends PasswordStrengthDisplayProps, PopperProps {}

function getStyles(): PasswordStrengthDisplayPopperFullSx {
  return {
    root: {
      zIndex: (theme) => theme.zIndex.modal
    },
    paper: {
      padding: '10px',
      margin: '10px 0'
    }
  };
}

export function PasswordStrengthDisplayPopper(props: PasswordStrengthDisplayPopperProps) {
  const { value, passwordRequirementsMinComplexity, onValidStateChanged, sxs, ...rest } = props;
  const sx = getStyles();

  return (
    <Popper {...rest} sx={sx.root}>
      <Paper elevation={3} sx={sx.paper}>
        <PasswordStrengthDisplay
          value={value}
          passwordRequirementsMinComplexity={passwordRequirementsMinComplexity}
          onValidStateChanged={onValidStateChanged}
          sxs={sxs}
        />
      </Paper>
    </Popper>
  );
}

export default PasswordStrengthDisplayPopper;
