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
import { EmbeddedLegacyEditorsStateProps } from '../../../modules/Preview/EmbeddedLegacyEditors';

export const showEmbeddedLegacyEditors = createAction<Partial<EmbeddedLegacyEditorsStateProps>>(
  'SHOW_EMBEDDED_LEGACY_EDITORS'
);

export const closeEmbeddedLegacyEditors = createAction<StandardAction>(
  'CLOSE_EMBEDDED_LEGACY_EDITORS'
);

export default createReducer<GlobalState['dialogs']['embeddedLegacyEditors']>(
  { dialogConfig: {}, setDialogConfig: {} },
  {
    [showEmbeddedLegacyEditors.type]: (state, { payload }) => ({
      ...payload,
      dialogConfig: {
        ...payload.dialogConfig,
        open: true
      }
    }),
    [closeEmbeddedLegacyEditors.type]: (state, { payload }) => ({
      dialogConfig: {
        ...payload.dialogConfig,
        open: false
      }
    })
  }
);
