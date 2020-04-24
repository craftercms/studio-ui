/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { APIError } from '../../../models/GlobalState';
import { LegacyVersion } from '../../../models/version';
import { DialogHeaderAction, DialogHeaderStateAction } from '../../../components/DialogHeader';
import StandardAction from '../../../models/StandardAction';
import React from 'react';

interface compare {
  a: string;
  b: string;
}

interface CompareVersionsDialogBaseProps {
  open: boolean;
  error: APIError;
  isFetching: boolean;
  compare: compare;
}

interface CompareVersionsDialogProps extends CompareVersionsDialogBaseProps {
  versions: LegacyVersion[];
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  onClose(): void;
  onDismiss(): void;
}

interface CompareVersionsDialogStateProps extends CompareVersionsDialogBaseProps {
  lefctActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

function CompareVersionsDialog(props: CompareVersionsDialogProps) {
  return (
    <p>CompareVersionsDialog</p>
  )
}
