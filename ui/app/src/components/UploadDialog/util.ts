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

import StandardAction from '../../models/StandardAction';
import { PropsWithChildren } from 'react';
import { XHRUploadOptions } from '@uppy/xhr-upload';
import { SuccessResponse, Uppy } from '@uppy/core';
import { UppyFile } from '@uppy/utils';
import UppyDashboardProps from '../UppyDashboard/UppyDashboardProps';

export interface UploadDialogBaseProps {
  open: boolean;
  path: string;
  site: string;
  maxSimultaneousUploads?: number;
  endpoint?: string;
  method?: XHRUploadOptions['method'];
  headers?: XHRUploadOptions['headers'];
  meta?: Record<string, unknown>;
  allowedMetaFields?: XHRUploadOptions['allowedMetaFields'];
  useFormData?: boolean;
  fieldName?: string;
  showRemoveButtonAfterComplete?: boolean;
  successfulUploadButton?: UppyDashboardProps['options']['successfulUploadButton'];
  // TODO: autoProceed doesn't work with at the Dashboard plugin level
  // autoProceed?: boolean;
}

export type UploadDialogProps = PropsWithChildren<
  UploadDialogBaseProps & {
    onClose(): void;
    onClosed?(): void;
    onFileAdded?(data: { file: UppyFile; uppy: Uppy }): void;
    onUploadSuccess?(data: { file: UppyFile | undefined; response: SuccessResponse }): void;
    validateStatus?(statusCode: number, responseText: string, response: unknown): boolean;
    getResponseData?(responseText: string, response: unknown): any;
    getResponseError?(responseText: string, xhr: unknown): Error;
  }
>;

export interface UploadDialogStateProps extends UploadDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onFileAdded?: StandardAction<{ file: UppyFile; uppy: Uppy; [key: string]: unknown }>;
  onUploadSuccess?: StandardAction<{ file: UppyFile; response: SuccessResponse; [key: string]: unknown }>;
}

export interface UploadDialogContainerProps extends UploadDialogProps {
  hasPendingChanges: boolean;
  setPendingChanges?(pending: boolean): void;
  onMinimized?(): void;
}
