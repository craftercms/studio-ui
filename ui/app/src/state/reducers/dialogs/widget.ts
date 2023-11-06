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

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { closeWidgetDialog, showWidgetDialog, updateWidgetDialog, widgetDialogClosed } from '../../actions/dialogs';
import { WidgetDialogStateProps } from '../../../components/WidgetDialog/utils';

const initialState: WidgetDialogStateProps = {
  open: false,
  isMinimized: null,
  isSubmitting: null,
  hasPendingChanges: null,
  title: null,
  widget: null
};

export default createReducer<GlobalState['dialogs']['widget']>(initialState, (builder) => {
  builder
    .addCase(showWidgetDialog, (state, { payload }) => ({
      ...state,
      onClose: closeWidgetDialog(),
      onClosed: widgetDialogClosed(),
      onMinimize: updateWidgetDialog({ isMinimized: true }),
      onMaximize: updateWidgetDialog({ isMinimized: false }),
      ...(payload as Partial<WidgetDialogStateProps>),
      open: true
    }))
    .addCase(updateWidgetDialog, (state, { payload }) => ({
      ...state,
      ...(payload as Partial<WidgetDialogStateProps>)
    }))
    .addCase(closeWidgetDialog, (state) => ({
      ...state,
      open: false
    }))
    .addCase(widgetDialogClosed, () => initialState);
});
