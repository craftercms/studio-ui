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
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';
import { Resource } from '../../models/Resource';
import React, { ReactNode } from 'react';
import LookupTable from '../../models/LookupTable';
import { DependencySelectionProps } from '../../modules/Content/Dependencies/DependencySelection';
import { FetchDependenciesResponse } from '../../services/dependencies';

export interface PublishDialogResourceInput {
  items: DetailedItem[];
  publishingTargets: any[];
  error: ApiResponse;
  submitting: boolean;
}

export type PublishDialogResourceBody = Omit<PublishDialogResourceInput, 'submitting' | 'error'>;

export interface ExtendedGoLiveResponse extends GoLiveResponse {
  schedule: 'now' | 'custom';
  publishingTarget: string;
  type: 'submit' | 'publish';
  items: DetailedItem[];
}

export interface PublishDialogBaseProps {
  items?: DetailedItem[];
  // if null it means the dialog should determinate which one to use
  scheduling?: 'now' | 'custom';
}

export interface PublishDialogProps extends PublishDialogBaseProps, EnhancedDialogProps {
  onSuccess?(response?: ExtendedGoLiveResponse): any;
}

export interface PublishDialogStateProps extends PublishDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onSuccess?: StandardAction;
}

export interface PublishDialogContainerProps
  extends PublishDialogBaseProps,
    Pick<PublishDialogProps, 'isSubmitting' | 'onSuccess' | 'onClose'> {}

export interface InternalDialogState {
  emailOnApprove: boolean;
  requestApproval: boolean;
  publishingTarget: string;
  submissionComment: string;
  scheduling: 'now' | 'custom';
  scheduledDateTime: any;
  publishingChannel: string;
  scheduledTimeZone: string;
  error: ApiResponse;
  fetchingDependencies: boolean;
}

export interface PublishDialogUIProps {
  resource: Resource<PublishDialogResourceBody>;
  publishingTargetsStatus: string;
  onPublishingChannelsFailRetry(): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  handleSubmit: any;
  isSubmitting: boolean;
  submitDisabled: boolean;
  state: InternalDialogState;
  selectedItems: LookupTable<boolean>;
  onItemClicked: DependencySelectionProps['onItemClicked'];
  dependencies: FetchDependenciesResponse;
  onSelectAll(): void;
  onSelectAllSoftDependencies(): void;
  onClickShowAllDeps?: any;
  showEmailCheckbox?: boolean;
  showRequestApproval: boolean;
  classes?: any;
  submitLabel: ReactNode;
  mixedPublishingDates?: boolean;
  mixedPublishingTargets?: boolean;
  submissionCommentRequired: boolean;
  onPublishingArgumentChange(e: React.ChangeEvent<HTMLInputElement>): void;
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
