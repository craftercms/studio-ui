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

import { EnhancedDialogProps } from '../EnhancedDialog';
import { onSubmittingAndOrPendingChangeProps } from '../../utils/hooks/useEnhancedDialogState';
import { Resource } from '../../models/Resource';
import { SandboxItem } from '../../models/Item';
import { FullSxRecord, PartialSxRecord } from '../../models/CustomRecord';

export interface UninstallPluginDialogBaseProps {
  pluginId: string;
}

export interface UninstallPluginDialogProps extends UninstallPluginDialogBaseProps, EnhancedDialogProps {
  onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
  onComplete?();
}

export interface UninstallPluginDialogContainerProps
  extends UninstallPluginDialogBaseProps,
    Pick<UninstallPluginDialogProps, 'onComplete' | 'onClose' | 'isSubmitting' | 'onSubmittingAndOrPendingChange'> {}

export interface UninstallPluginDialogBodyProps {
  isSubmitting: boolean;
  pluginId: string;
  resource: Resource<SandboxItem[]>;
  password?: string;
  sx?: UninstallPluginDialogBodyPartialSx;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onSubmit(): void;
}

export type UninstallPluginDialogBodyClassKey = 'content' | 'emphasisedText' | 'loadingStateWrapper';

export type UninstallPluginDialogBodyFullSx = FullSxRecord<UninstallPluginDialogBodyClassKey>;

export type UninstallPluginDialogBodyPartialSx = PartialSxRecord<UninstallPluginDialogBodyClassKey>;
