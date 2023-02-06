/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { ConfirmDialogStateClassKey } from '../ConfirmDialog';

export interface NoTemplateDialogProps {
  open: boolean;
  type?: 'save' | 'saveAndClose';
  imageUrl?: string;
  onSave(): void;
  onTemplateCreated(templateUrl: string): void;
  onTemplateSelected(templateUrl: string): void;
  onStay(): void;
  onCancel?(): void;
}

export interface NoTemplateDialogContainerProps extends Omit<NoTemplateDialogProps, 'open'> {
  classes?: Partial<Record<ConfirmDialogStateClassKey, string>>;
}
