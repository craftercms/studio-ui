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
import GlobalState from '../../../models/GlobalState';
import { closeEditSiteDialog, editSiteDialogClosed, showEditSiteDialog } from '../../actions/dialogs';
import { EditSiteDialogStateProps } from '../../../modules/System/Sites/Edit/EditSiteDialog';

const initialState: EditSiteDialogStateProps = {
  open: false,
  site: null
};

export default createReducer<GlobalState['dialogs']['editSite']>(initialState, {
  [showEditSiteDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeEditSiteDialog(),
    onClosed: editSiteDialogClosed(),
    onDismiss: closeEditSiteDialog(),
    onSaveSuccess: closeEditSiteDialog(),
    ...payload,
    open: true
  }),
  [closeEditSiteDialog.type]: (state) => ({ ...state, open: false }),
  [editSiteDialogClosed.type]: (state) => initialState
});
