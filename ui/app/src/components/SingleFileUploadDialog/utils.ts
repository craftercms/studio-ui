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
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { EnhancedDialogProps } from '../EnhancedDialog';

export interface SingleFileUploadDialogBaseProps {
  site: string;
  path: string;
  customFileName?: string;
  fileTypes?: [string];
}

export interface SingleFileUploadDialogProps extends SingleFileUploadDialogBaseProps, EnhancedDialogProps {
  onClose(): void;
  onClosed?(): void;
  onUploadStart?(): void;
  onUploadComplete?(result: any): void;
  onUploadError?({ file, error, response }): void;
}

export interface SingleFileUploadDialogStateProps extends SingleFileUploadDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onUploadStart?: StandardAction;
  onUploadComplete?: StandardAction;
  onUploadError?: StandardAction<{ error: any; file: any; response: any }>;
}

export interface SingleFileUploadDialogContainerProps
  extends SingleFileUploadDialogBaseProps,
    Pick<
      SingleFileUploadDialogProps,
      'site' | 'customFileName' | 'fileTypes' | 'onUploadStart' | 'onUploadComplete' | 'onUploadError'
    > {}

export interface SingleFileUploadDialogUIProps extends SingleFileUploadDialogContainerProps {}
