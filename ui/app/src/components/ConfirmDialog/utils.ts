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
import { ReactNode } from 'react';
import { CSSObject as CSSProperties } from 'tss-react';
import StandardAction from '../../models/StandardAction';
import { DialogProps } from '@mui/material/Dialog';

export type ConfirmDialogStateClassKey = 'dialog' | 'dialogImage' | 'dialogBody' | 'dialogTitle' | 'dialogFooter';
export type ConfirmDialogStateStyles = Partial<Record<ConfirmDialogStateClassKey, CSSProperties>>;

export interface ConfirmDialogBaseProps {
  title?: ReactNode;
  body?: ReactNode;
  hideBackdrop?: boolean;
  imageUrl?: string;
  disableEnforceFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  styles?: ConfirmDialogStateStyles;
}

export interface ConfirmDialogProps extends ConfirmDialogBaseProps, Omit<DialogProps, 'title' | 'classes'> {
  classes?: Partial<Record<ConfirmDialogStateClassKey, string>>;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  okButtonText?: ReactNode;
  cancelButtonText?: ReactNode;
  onOk?(): void;
  onCancel?(): void;
  onClosed?(): void;
}

export interface ConfirmDialogStateProps extends ConfirmDialogBaseProps, Pick<DialogProps, 'open'> {
  onOk?: StandardAction;
  onCancel?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  okButtonText?: string;
  cancelButtonText?: string;
}
