/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { createAction } from '@reduxjs/toolkit';
import { DialogStackItem } from '../../models/GlobalState';
import { EnhancedDialogProps } from '../../components/EnhancedDialog';

export const pushDialog = /*#__PURE__*/ createAction<Partial<DialogStackItem> & Pick<DialogStackItem, 'component'>>(
	'PUSH_DIALOG'
);

export const popDialog = /*#__PURE__*/ createAction<{ id: string }>('POP_DIALOG');

export const updateDialogState = /*#__PURE__*/ createAction<{ id: string; props: unknown }>('UPDATE_DIALOG_STATE');

// FE2 TODO: Perhaps discard these actions and leave the existing showWidgetDialog family of actions
export const pushNonDialog = /*#__PURE__*/ createAction<
	Partial<DialogStackItem & { dialogProps: EnhancedDialogProps }> & Pick<DialogStackItem, 'component'>
>('PUSH_NON_DIALOG');

export const updateNonDialogState = /*#__PURE__*/ createAction<{
	id: string;
	props: unknown;
	dialogProps?: EnhancedDialogProps;
}>('UPDATE_NON_DIALOG_STATE');
