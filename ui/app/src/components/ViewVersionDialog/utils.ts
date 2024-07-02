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

import { EntityState } from '../../models/EntityState';
import ContentType from '../../models/ContentType';
import { DialogHeaderStateAction } from '../DialogHeader';
import { DialogHeaderActionProps } from '../DialogHeaderAction';
import { ApiResponse } from '../../models/ApiResponse';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';

export interface VersionViewProps {
  version: {
    content: string;
    path: string;
    site: string;
    versionNumber: string;
  };
}

export interface ViewVersionDialogBaseProps {
  error: ApiResponse;
  isFetching: boolean;
  version: any;
}

export interface ViewVersionDialogProps extends ViewVersionDialogBaseProps, EnhancedDialogProps {
  contentTypesBranch: EntityState<ContentType>;
  leftActions?: DialogHeaderActionProps[];
  rightActions?: DialogHeaderActionProps[];
}

export interface ViewVersionDialogStateProps extends ViewVersionDialogBaseProps, EnhancedDialogState {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface ViewVersionDialogContainerProps
  extends ViewVersionDialogBaseProps,
    Pick<ViewVersionDialogProps, 'contentTypesBranch'> {}
