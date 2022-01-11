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

import { WidgetDescriptor } from '../Widget';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState, onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import { LookupTable } from '../../models';

interface WidgetDialogBaseProps {
  title: string;
  widget: WidgetDescriptor;
  extraProps?: any;
}

export interface WidgetDialogProps extends WidgetDialogBaseProps, Omit<EnhancedDialogProps, 'title'> {
  title: string;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export interface WidgetDialogStateProps extends WidgetDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onMaximize?: StandardAction;
  onMinimize?: StandardAction;
}
