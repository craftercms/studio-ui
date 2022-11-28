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
import Popover from '@mui/material/Popover';
import useStyles from './styles';
import { Site } from '../../models/Site';
import { PagedArray } from '../../models/PagedArray';
import User from '../../models/User';
import AuditGridFilterPopoverBody from './AuditGridFilterPopoverBody';

export interface AuditGridFilterPopoverProps {
  open: boolean;
  filterId: 'operationTimestamp' | 'siteId' | 'user' | 'origin' | 'operations' | 'target';
  anchorPosition: {
    top: number;
    left: number;
  };
  value?: string;
  dateFrom?: string;
  dateTo?: string;
  timezone?: string;
  options?: {
    sites: Site[];
    users: PagedArray<User>;
    operations: { id: string; value: string; name: string }[];
    origins: { id: string; value: string; name: string }[];
    timezones: string[];
  };
  onClose(): void;
  onTimezoneSelected(timezone: string): void;
  onResetFilter(id: string | string[]): void;
  onFilterChange(fieldId: string, value: any): void;
}

export function AuditGridFilterPopover(props: AuditGridFilterPopoverProps) {
  const { open, anchorPosition, onClose } = props;
  const { classes } = useStyles();
  return (
    <Popover
      open={open}
      anchorPosition={anchorPosition}
      anchorReference="anchorPosition"
      onClose={onClose}
      classes={{ paper: classes.popover }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <AuditGridFilterPopoverBody {...props} />
    </Popover>
  );
}

export default AuditGridFilterPopover;
