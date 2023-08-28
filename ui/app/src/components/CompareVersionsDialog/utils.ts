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

import { DialogHeaderStateAction } from '../DialogHeader';
import StandardAction from '../../models/StandardAction';
import ApiResponse from '../../models/ApiResponse';
import { ItemHistoryEntry, VersionsStateProps } from '../../models/Version';
import { EntityState } from '../../models/EntityState';
import ContentType from '../../models/ContentType';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { DialogHeaderActionProps } from '../DialogHeaderAction';

export interface CompareVersionsDialogBaseProps {
  error: ApiResponse;
  isFetching: boolean;
  disableItemSwitching?: boolean;
}

export interface CompareVersionsDialogProps extends CompareVersionsDialogBaseProps, EnhancedDialogProps {
  versionsBranch: VersionsStateProps;
  selectedA: ItemHistoryEntry;
  selectedB: ItemHistoryEntry;
  contentTypesBranch?: EntityState<ContentType>;
  rightActions?: DialogHeaderActionProps[];
}

export interface CompareVersionsDialogStateProps extends CompareVersionsDialogBaseProps, EnhancedDialogState {
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface CompareVersionsDialogContainerProps
  extends CompareVersionsDialogBaseProps,
    Pick<
      CompareVersionsDialogProps,
      'contentTypesBranch' | 'versionsBranch' | 'selectedA' | 'selectedB' | 'disableItemSwitching'
    > {}
