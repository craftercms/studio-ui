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

import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import StandardAction from '../../models/StandardAction';
import { DetailedItem } from '../../models';

export interface RenameAssetBaseProps {
  path: string;
  type: 'controller' | 'template' | 'asset';
  dependantItems: DetailedItem[];
  value?: string;
  allowBraces?: boolean;
}

export interface RenameAssetProps extends RenameAssetBaseProps, EnhancedDialogProps {
  onRenamed?(response: { path: string; name: string }): void;
}

export interface RenameAssetStateProps extends RenameAssetBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onRenamed?: StandardAction;
}

export interface RenameAssetContainerProps
  extends Pick<RenameAssetProps, 'path' | 'value' | 'allowBraces' | 'onRenamed' | 'onClose' | 'type'> {
  dependantItems: DetailedItem[];
}
