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
import { PropsWithChildren } from 'react';

export interface UploadDialogBaseProps {
  open: boolean;
  path: string;
  site: string;
  maxSimultaneousUploads?: number;
}

export type UploadDialogProps = PropsWithChildren<
  UploadDialogBaseProps & {
    onClose(): void;
    onClosed?(): void;
  }
>;

export interface UploadDialogStateProps extends UploadDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface UploadDialogContainerProps extends UploadDialogProps {
  hasPendingChanges: boolean;
  setPendingChanges?(pending: boolean): void;
  onMinimized?(): void;
}
