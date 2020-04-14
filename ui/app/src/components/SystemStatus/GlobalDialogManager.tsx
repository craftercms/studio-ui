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

import React, { lazy, Suspense } from 'react';
import StandardAction from '../../models/StandardAction';
import { Dispatch } from 'redux';
import { useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';

const ConfirmDialog = lazy(() => import('../UserControl/ConfirmDialog'));
const ErrorDialog = lazy(() => import('./ErrorDialog'));
const HistoryDialog = lazy(() => import('../../modules/Content/History/HistoryDialog'));
const PublishDialog = lazy(() => import('../../modules/Content/Publish/PublishDialog'));

function createCallback(
  action: StandardAction,
  dispatch: Dispatch,
  fallbackAction?: StandardAction
): () => void {
  return action ? () => dispatch(action) : fallbackAction ? () => dispatch(fallbackAction) : null;
}

function GlobalDialogManager() {
  const state = useSelection((state) => state.dialogs);
  const dispatch = useDispatch();
  return (
    <Suspense fallback="">
      {/* region Confirm */}
      <ConfirmDialog
        open={state.confirm.open}
        title={state.confirm.title}
        body={state.confirm.body}
        onOk={createCallback(state.confirm.onOk, dispatch)}
        onCancel={createCallback(state.confirm.onCancel, dispatch)}
        onClose={createCallback(state.confirm.onClose, dispatch)}
      />
      {/* endregion */}

      {/* region Error */}
      <ErrorDialog error={state.error.error} onClose={createCallback(state.error.onClose, dispatch)} />
      {/* endregion */}

      {/* region Edit (Embedded Legacy Editor) */}

      {/* endregion */}

      {/* region Publish */}
      <PublishDialog
        open={state.publish.open}
        items={state.publish.items}
        scheduling={state.publish.scheduling}
        onClose={createCallback(state.publish.onClose, dispatch)}
        onSuccess={createCallback(state.publish.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Create Content */}

      {/* endregion */}

      {/* region Dependencies */}

      {/* endregion */}

      {/* region Delete */}

      {/* endregion */}

      {/* region History */}
      <HistoryDialog
        open={state.history.open}
        path={state.history.path}
        onClose={createCallback(state.history.onClose, dispatch)}
      />
      {/* endregion */}

      {/* region SnackBar(s) */}

      {/* endregion */}
    </Suspense>
  );
}

export default React.memo(GlobalDialogManager);
