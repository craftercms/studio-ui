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
import { HistoryDialogStateProps } from '../../../modules/Content/History/HistoryDialog';

export const showHistoryDialog = createAction<Partial<HistoryDialogStateProps>>(
  'SHOW_HISTORY_DIALOG'
);

export const closeHistoryDialog = createAction<StandardAction>('CLOSE_HISTORY_DIALOG');

export default createReducer<GlobalState['dialogs']['history']>(
  { open: false,
    site: "",
    path: ""
  },
  {
    [showHistoryDialog.type]: (state, { payload }) => ({
      open: true,
      site: payload.site,
      path: payload.path,
      onClose: closeHistoryDialog()
    }),
    [closeHistoryDialog.type]: (state) => ({ open: false, site: "", path: "", onClose: state.onClose })
  }
);
