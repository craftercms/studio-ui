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
import { closeDependenciesDialog, dependenciesDialogClosed, showDependenciesDialog } from '../../actions/dialogs';
import { DependenciesDialogStateProps } from '../../../components/DependenciesDialog/utils';

const initialState: DependenciesDialogStateProps = {
  isMinimized: null,
  isSubmitting: null,
  hasPendingChanges: null,
  open: false,
  rootPath: '/site/website'
};

export default createReducer<GlobalState['dialogs']['dependencies']>(initialState, {
  [showDependenciesDialog.type]: (state, { payload }) => ({
    ...state,
    onClose: closeDependenciesDialog(),
    onClosed: dependenciesDialogClosed(),
    ...payload,
    open: true
  }),
  [closeDependenciesDialog.type]: (state) => ({ ...state, open: false }),
  [dependenciesDialogClosed.type]: () => initialState
});
