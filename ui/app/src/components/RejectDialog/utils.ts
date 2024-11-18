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
import { SandboxItem } from '../../models/Item';
import { ApiResponse } from '../../models/ApiResponse';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import React from 'react';
import { CannedMessage } from '../../services/configuration';

export type ApiState = { error: ApiResponse };
export type Source = { items: SandboxItem[]; published: boolean; cannedMessages: CannedMessage[]; error: ApiResponse };
export type Return = Partial<Source>;

export interface RejectDialogContentUIProps {
  items: SandboxItem[];
  checkedItems: string[];
  onUpdateChecked?(value?: string): void;
  classes?: any;
}

export interface RejectDialogUIProps {
  items: SandboxItem[];
  cannedMessages: CannedMessage[];
  checkedItems: string[];
  rejectionReason: string;
  rejectionComment: string;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  published: boolean;
  error: ApiResponse;
  onRejectionReasonChange?(value: string): void;
  onCommentChange?(value: string): void;
  onUpdateChecked?(value?: string): void;
  onReject?(): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onDismiss?(): void;
}

export interface RejectDialogBaseProps {
  items?: SandboxItem[];
}

export interface RejectDialogProps extends RejectDialogBaseProps, EnhancedDialogProps {
  onRejectSuccess?(response?: any): any;
}

export interface RejectDialogStateProps extends RejectDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onRejectSuccess?: StandardAction;
}

export interface RejectDialogContainerProps
  extends RejectDialogBaseProps,
    Pick<RejectDialogProps, 'isSubmitting' | 'onRejectSuccess' | 'onClose'> {}
