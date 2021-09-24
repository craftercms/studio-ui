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

import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

export interface PreviewDialogBaseProps {
  type: string;
  title: string;
  subtitle?: string;
  mode?: string;
  url?: string;
  content?: string;
}

export interface PreviewDialogProps extends PreviewDialogBaseProps, Omit<EnhancedDialogProps, 'title'> {}

export interface PreviewDialogStateProps extends PreviewDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface PreviewDialogContainerProps extends PreviewDialogBaseProps, Pick<PreviewDialogProps, 'onClose'> {}
