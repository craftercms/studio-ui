/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License version 3 as published by
 *  the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { createReducer } from '@reduxjs/toolkit';
import GlobalState from '../../../models/GlobalState';
import { closePublishDialog, publishDialogClosed, showPublishDialog } from '../../actions/dialogs';

export default createReducer<GlobalState['dialogs']['publish']>(
  { open: false },
  {
    [showPublishDialog.type]: (state, { payload }) => ({
      onClose: closePublishDialog(),
      onDismiss: closePublishDialog(),
      ...payload,
      open: true
    }),
    [closePublishDialog.type]: (state) => ({ open: false, onClose: state.onClose }),
    [publishDialogClosed.type]: () => ({ open: false })
  }
);
