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

import Group from '../../models/Group';
import React from 'react';
import User from '../../models/User';
import { onSubmittingAndOrPendingChangeProps } from '../../utils/hooks/useEnhancedDialogState';
import { EnhancedDialogProps } from '../EnhancedDialog';

export interface EditGroupBaseProps {
  group?: Group;
}

export interface EditGroupDialogProps extends EditGroupBaseProps, EnhancedDialogProps {
  onGroupSaved(group: Group): void;
  onGroupDeleted(group: Group): void;
  onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
}

export interface EditGroupDialogContainerProps
  extends EditGroupBaseProps,
    Pick<EditGroupDialogProps, 'onClose' | 'onGroupSaved' | 'onGroupDeleted' | 'onSubmittingAndOrPendingChange'> {}

export interface GroupEditDialogUIProps {
  group?: Group;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  isEdit: boolean;
  isDirty: boolean;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onDeleteGroup?(group: Group): void;
  onSave(): void;
  onCancel(): void;
  onChangeValue(value: { key: string; value: string }): void;
  onAddMembers?(members: (string | number)[]): void;
  onRemoveMembers?(members: (string | number)[]): void;
  users?: User[];
  members?: User[];
  inProgressIds?: (string | number)[];
}
