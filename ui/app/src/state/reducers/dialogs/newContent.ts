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

import { createAction, createReducer } from '@reduxjs/toolkit';
import StandardAction from '../../../models/StandardAction';
import GlobalState from '../../../models/GlobalState';
import { NewContentDialogStateProps } from '../../../modules/Content/Authoring/NewContentDialog';

export const showNewContentDialog = createAction<Partial<NewContentDialogStateProps>>(
  'SHOW_NEW_CONTENT_DIALOG'
);

export const closeNewContentDialog = createAction<StandardAction>('CLOSE_NEW_CONTENT_DIALOG');

export const dismissNewContentDialog = createAction<StandardAction>('DISMISS_NEW_CONTENT_DIALOG');

export default createReducer<GlobalState['dialogs']['newContent']>(
  { open: false, site: '', compact: false, previewItem: { name: '', internalName: '', uri: '' } },
  {
    [showNewContentDialog.type]: (state, { payload }) => ({
      ...payload,
      open: true,
      onClose: closeNewContentDialog(),
      onDismiss: dismissNewContentDialog()
    }),
    [closeNewContentDialog.type]: (state, { payload }) => ({
      onClose: state.onClose,
      onDismiss: state.onDismiss,
      open: false
    }),
    [dismissNewContentDialog.type]: (state, { payload }) => ({
      onClose: state.onClose,
      onDismiss: state.onDismiss,
      open: false
    })
  }
);
