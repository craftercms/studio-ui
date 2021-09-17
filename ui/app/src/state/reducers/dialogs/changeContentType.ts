/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import {
  changeContentTypeDialogClosed,
  closeChangeContentTypeDialog,
  showChangeContentTypeDialog
} from '../../actions/dialogs';
import { ChangeContentTypeDialogStateProps } from '../../../components/ChangeContentTypeDialog/utils';

const initialState: ChangeContentTypeDialogStateProps = {
  open: false,
  isSubmitting: null,
  isMinimized: null,
  hasPendingChanges: null,
  compact: false,
  item: null,
  rootPath: '/site/website',
  selectedContentType: null
};

export default createReducer<ChangeContentTypeDialogStateProps>(initialState, {
  [showChangeContentTypeDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeChangeContentTypeDialog(),
    onClosed: changeContentTypeDialogClosed(),
    onDismiss: closeChangeContentTypeDialog(),
    ...payload,
    open: true
  }),
  [closeChangeContentTypeDialog.type]: (state) => ({
    ...state,
    open: false
  }),
  [changeContentTypeDialogClosed.type]: () => initialState
});
