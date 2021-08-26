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

import { DetailedItem } from '../../models/Item';
import { ApiResponse } from '../../models/ApiResponse';
import StandardAction from '../../models/StandardAction';
import { GoLiveResponse } from '../../services/publishing';

export type ApiState = { error: ApiResponse; submitting: boolean; fetchingDependencies: boolean };

export type PublishDialogResourceInput = { items: DetailedItem[]; publishingChannels: any[]; apiState: ApiState };

export type PublishDialogResourceBody = Omit<PublishDialogResourceInput, 'apiState'>;

export interface ExtendedGoLiveResponse extends GoLiveResponse {
  schedule: 'now' | 'custom';
  environment: string;
  type: 'submit' | 'publish';
  items: DetailedItem[];
}

export interface DependenciesResultObject {
  items1: string[];
  items2: string[];
}

export interface PublishDialogBaseProps {
  items?: DetailedItem[];
  // if null it means the dialog should determinate which one to use
  scheduling?: 'now' | 'custom';
}

export interface PublishDialogStateProps extends PublishDialogBaseProps {
  open: boolean;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
  onSuccess?: StandardAction;
}

export interface InternalDialogState {
  emailOnApprove: boolean;
  requestApproval: boolean;
  environment: string;
  submissionComment: string;
  scheduling: 'now' | 'custom';
  scheduledDateTime: any;
  publishingChannel: string;
  selectedItems: string[];
  scheduledTimeZone: string;
}

export const updateCheckedList = (path: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(path) ? path : [path]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

export const paths = (checked: any) =>
  Object.entries({ ...checked })
    .filter(([, value]) => value === true)
    .map(([key]) => key);
