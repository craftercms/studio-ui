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

import React from 'react';
import StandardAction from '../../models/StandardAction';
import { Dispatch } from 'redux';
import { useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import ConfirmDialog from '../UserControl/ConfirmDialog';

function createCallback(
  action: StandardAction,
  dispatch: Dispatch,
  fallbackAction?: StandardAction
): () => void {
  return action ? () => dispatch(action) : fallbackAction ? () => dispatch(fallbackAction) : null;
}

function DialogManager() {
  const state = useSelection((state) => state.dialogs);
  const dispatch = useDispatch();
  return (
    <ConfirmDialog
      open={state.confirm.open}
      title={state.confirm.title}
      body={state.confirm.body}
      onOk={createCallback(state.confirm.onOk, dispatch)}
      onCancel={createCallback(state.confirm.onCancel, dispatch)}
      onClose={createCallback(state.confirm.onClose, dispatch)}
    />
  );
}

export default React.memo(DialogManager);
