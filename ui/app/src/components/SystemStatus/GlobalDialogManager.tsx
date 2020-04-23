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

import React, { lazy, Suspense, useLayoutEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import StandardAction from '../../models/StandardAction';
import { Dispatch } from 'redux';
import { useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import { MinimizedBar } from './MinimizedBar';
import { maximizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import GlobalState from '../../models/GlobalState';
import { isPlainObject } from '../../utils/object';

const ConfirmDialog = lazy(() => import('../UserControl/ConfirmDialog'));
const ErrorDialog = lazy(() => import('./ErrorDialog'));
const NewContentDialog = lazy(() => import('../../modules/Content/Authoring/NewContentDialog'));
const HistoryDialog = lazy(() => import('../../modules/Content/History/HistoryDialog'));
const PublishDialog = lazy(() => import('../../modules/Content/Publish/PublishDialog'));
const DependenciesDialog = lazy(() => import('../../modules/Content/Dependencies/DependenciesDialog'));
const DeleteDialog = lazy(() => import('../../modules/Content/Delete/DeleteDialog'));

function createCallback(
  action: StandardAction,
  dispatch: Dispatch
): (output?: unknown) => void {
  return action
    ? (output) => dispatch({
      type: action.type,
      ...(isPlainObject(output) || Boolean(action.payload) ? {
        payload: {
          ...action.payload,
          ...(isPlainObject(output) ? { output } : {})
        }
      } : {})
    })
    : null;
}

export const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      right: '0',
      bottom: '20px',
      display: 'flex',
      position: 'fixed',
      flexDirection: 'row-reverse',
      width: '100%',
      overflow: 'auto',
      padding: '2px 20px'
    }
  })
);

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
        onDismiss={createCallback(state.confirm.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Error */}
      <ErrorDialog
        error={state.error.error}
        onClose={createCallback(state.error.onClose, dispatch)}
        onDismiss={createCallback(state.error.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Edit (Embedded Legacy Editor) */}

      {/* endregion */}

      {/* region Publish */}
      <PublishDialog
        open={state.publish.open}
        items={state.publish.items}
        scheduling={state.publish.scheduling}
        onClose={createCallback(state.publish.onClose, dispatch)}
        onDismiss={createCallback(state.publish.onDismiss, dispatch)}
        onSuccess={createCallback(state.publish.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Create Content */}
      <NewContentDialog
        open={state.newContent.open}
        site={state.newContent.site}
        previewItem={state.newContent.previewItem}
        compact={state.newContent.compact}
        onClose={createCallback(state.newContent.onClose, dispatch)}
        onDismiss={createCallback(state.newContent.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Dependencies */}
      <DependenciesDialog
        open={state.dependencies.open}
        item={state.dependencies.item}
        dependenciesShown={state.dependencies.dependenciesShown}
        onClose={createCallback(state.dependencies.onClose, dispatch)}
        onDismiss={createCallback(state.dependencies.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Delete */}
      <DeleteDialog
        open={state.delete.open}
        items={state.delete.items}
        onClose={createCallback(state.delete.onClose, dispatch)}
        onDismiss={createCallback(state.delete.onDismiss, dispatch)}
        onSuccess={createCallback(state.delete.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region History */}
      <HistoryDialog
        open={state.history.open}
        item={state.history.item}
        current={state.history.current}
        compare={state.history.compare}
        rowsPerPage={state.history.rowsPerPage}
        page={state.history.page}
        byId={state.history.byId}
        error={state.history.error}
        isFetching={state.history.isFetching}
        onClose={createCallback(state.history.onClose, dispatch)}
        onDismiss={createCallback(state.history.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Minimized Dialogs */}
      <MinimizedDialogManager state={state} dispatch={dispatch} />
      {/* endregion */}
      {/* region Auth Monitor */}
      {/* TODO: Move auth monitor here */}
      {/* endregion */}
    </Suspense>
  );
}

function MinimizedDialogManager({ state, dispatch }: {
  state: GlobalState['dialogs'];
  dispatch: Dispatch;
}) {
  const classes = useStyles({});
  const [el] = useState<HTMLElement>(() => {
    const elem = document.createElement('div');
    elem.className = classes.wrapper;
    return elem;
  });
  const inventory = useMemo(
    () => Object.values(state.minimizedDialogs).filter((tab) => tab.minimized),
    [state.minimizedDialogs]
  );
  useLayoutEffect(() => {
    if (inventory.length) {
      document.body.appendChild(el);
      return () => {
        document.body.removeChild(el);
      };
    }
  }, [el, inventory]);
  return inventory.length
    ? ReactDOM.createPortal(
      inventory.map(({ id, title, subtitle, status }) => (
        <MinimizedBar
          key={id}
          title={title}
          subtitle={subtitle}
          status={status}
          onMaximized={createCallback(maximizeDialog({ id }), dispatch)}
        />
      )),
      el
    )
    : null;
}

export default React.memo(GlobalDialogManager);
