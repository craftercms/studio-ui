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

import React, { lazy, Suspense, useEffect, useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import StandardAction from '../../models/StandardAction';
import { Dispatch } from 'redux';
import { useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MinimizedBar } from './MinimizedBar';
import { maximizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import GlobalState from '../../models/GlobalState';
import { isPlainObject } from '../../utils/object';
import PathSelectionDialog from '../Dialogs/PathSelectionDialog';
import { useSnackbar } from 'notistack';
import { getHostToHostBus } from '../../modules/Preview/previewContext';
import { filter } from 'rxjs/operators';
import { showSystemNotification } from '../../state/actions/system';

const ViewVersionDialog = lazy(() => import('../../modules/Content/History/ViewVersionDialog'));
const CompareVersionsDialog = lazy(() => import('../../modules/Content/History/CompareVersionsDialog'));
const RejectDialog = lazy(() => import('../Dialogs/RejectDialog'));
const EditSiteDialog = lazy(() => import('../../modules/System/Sites/Edit/EditSiteDialog'));
const ConfirmDialog = lazy(() => import('../Dialogs/ConfirmDialog'));
const ErrorDialog = lazy(() => import('./ErrorDialog'));
const NewContentDialog = lazy(() => import('../../modules/Content/Authoring/NewContentDialog'));
const ChangeContentTypeDialog = lazy(() => import('../../modules/Content/Authoring/ChangeContentTypeDialog'));
const HistoryDialog = lazy(() => import('../../modules/Content/History/HistoryDialog'));
const PublishDialog = lazy(() => import('../../modules/Content/Publish/PublishDialog'));
const DependenciesDialog = lazy(() => import('../../modules/Content/Dependencies/DependenciesDialog'));
const DeleteDialog = lazy(() => import('../../modules/Content/Delete/DeleteDialog'));
const WorkflowCancellationDialog = lazy(() => import('../Dialogs/WorkflowCancellationDialog'));
const LegacyFormDialog = lazy(() => import('../Dialogs/LegacyFormDialog'));
const LegacyCodeEditorDialog = lazy(() => import('../Dialogs/LegacyCodeEditorDialog'));
const CreateFolderDialog = lazy(() => import('../Dialogs/CreateFolderDialog'));
const CopyItemsDialog = lazy(() => import('../Dialogs/CopyDialog'));
const CreateFileDialog = lazy(() => import('../Dialogs/CreateFileDialog'));
const BulkUploadDialog = lazy(() => import('../Dialogs/UploadDialog'));
const PreviewDialog = lazy(() => import('../Dialogs/PreviewDialog'));
const ItemMenu = lazy(() => import('../ItemMenu/ItemMenu'));
const AuthMonitor = lazy(() => import('../SystemStatus/AuthMonitor'));

// @formatter:off
function createCallback(action: StandardAction, dispatch: Dispatch): (output?: unknown) => void {
  // prettier-ignore
  return action ? (output: any) => {
    const hasPayload = Boolean(action.payload);
    const hasOutput = Boolean(output) && isPlainObject(output);
    const payload = (hasPayload && !hasOutput)
      // If there's a payload in the original action and there
      // is no output from the resulting callback, simply use the
      // original payload
      ? action.payload
      // Otherwise, if there's no payload but there is an output sent
      // to the resulting callback, use the output as the payload
      : (!hasPayload && hasOutput)
        ? output
        : (
          (hasPayload && hasOutput)
            // If there's an output and a payload, merge them both into a single object.
            // We're supposed to be using objects for all our payloads, otherwise this
            // could fail with literal native values such as strings or numbers.
            ? Array.isArray(action.payload)
              // If it's an array, assume is a BATCH_ACTIONS action payload; each item
              // of the array should be an action, so merge each item with output.
              ? action.payload.map((a) => ({ ...a, payload: { ...a.payload, ...output } }))
              // If it's not an array, it's a single action. Merge with output.
              : { ...action.payload, ...output }
            // Later, we check if there's a payload to add it
            : false
        );
    dispatch({
      type: action.type,
      ...(payload ? { payload } : {})
    });
  } : null;
}
// @formatter:on

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
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const versionsBranch = useSelection((state) => state.versions);
  const permissions = useSelection((state) => state.content.items.permissionsByPath);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$
      .pipe(filter((e) => e.type === showSystemNotification.type))
      .subscribe(({ payload }) => {
        enqueueSnackbar(payload.message, payload.options);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [enqueueSnackbar]);

  return (
    <Suspense fallback="">
      {/* region Confirm */}
      <ConfirmDialog
        open={state.confirm.open}
        title={state.confirm.title}
        body={state.confirm.body}
        styles={state.confirm.styles}
        imageUrl={state.confirm.imageUrl}
        hideBackdrop={state.confirm.hideBackdrop}
        onOk={createCallback(state.confirm.onOk, dispatch)}
        onCancel={createCallback(state.confirm.onCancel, dispatch)}
        onClose={createCallback(state.confirm.onClose, dispatch)}
        onClosed={createCallback(state.confirm.onClosed, dispatch)}
        onDismiss={createCallback(state.confirm.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Error */}
      <ErrorDialog
        open={state.error.open}
        error={state.error.error}
        onClose={createCallback(state.error.onClose, dispatch)}
        onClosed={createCallback(state.error.onClosed, dispatch)}
        onDismiss={createCallback(state.error.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Edit (LegacyFormDialog) */}
      <LegacyFormDialog
        open={state.edit.open}
        src={state.edit.src}
        inProgress={state.edit.inProgress}
        onClose={createCallback(state.edit.onClose, dispatch)}
        onClosed={createCallback(state.edit.onClosed, dispatch)}
        onDismiss={createCallback(state.edit.onDismiss, dispatch)}
        onSaveSuccess={createCallback(state.edit.onSaveSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region LegacyCodeEditorDialog */}
      <LegacyCodeEditorDialog
        open={state.codeEditor.open}
        src={state.codeEditor.src}
        inProgress={state.codeEditor.inProgress}
        onClose={createCallback(state.codeEditor.onClose, dispatch)}
        onClosed={createCallback(state.codeEditor.onClosed, dispatch)}
        onDismiss={createCallback(state.codeEditor.onDismiss, dispatch)}
        onSuccess={createCallback(state.codeEditor.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Publish */}
      <PublishDialog
        open={state.publish.open}
        items={state.publish.items}
        scheduling={state.publish.scheduling}
        onClose={createCallback(state.publish.onClose, dispatch)}
        onClosed={createCallback(state.publish.onClosed, dispatch)}
        onDismiss={createCallback(state.publish.onDismiss, dispatch)}
        onSuccess={createCallback(state.publish.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Create Content */}
      <NewContentDialog
        open={state.newContent.open}
        item={state.newContent.item}
        rootPath={state.newContent.rootPath}
        compact={state.newContent.compact}
        onContentTypeSelected={createCallback(state.newContent.onContentTypeSelected, dispatch)}
        onClose={createCallback(state.newContent.onClose, dispatch)}
        onClosed={createCallback(state.newContent.onClosed, dispatch)}
        onDismiss={createCallback(state.newContent.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Change ContentType */}
      <ChangeContentTypeDialog
        open={state.changeContentType.open}
        item={state.changeContentType.item}
        rootPath={state.changeContentType.rootPath}
        compact={state.changeContentType.compact}
        selectedContentType={state.changeContentType.selectedContentType}
        onContentTypeSelected={createCallback(state.changeContentType.onContentTypeSelected, dispatch)}
        onClose={createCallback(state.changeContentType.onClose, dispatch)}
        onClosed={createCallback(state.changeContentType.onClosed, dispatch)}
        onDismiss={createCallback(state.changeContentType.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Dependencies */}
      <DependenciesDialog
        open={state.dependencies.open}
        item={state.dependencies.item}
        rootPath={state.dependencies.rootPath}
        dependenciesShown={state.dependencies.dependenciesShown}
        onClose={createCallback(state.dependencies.onClose, dispatch)}
        onClosed={createCallback(state.dependencies.onClosed, dispatch)}
        onDismiss={createCallback(state.dependencies.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Delete */}
      <DeleteDialog
        open={state.delete.open}
        items={state.delete.items}
        isFetching={state.delete.isFetching}
        onClose={createCallback(state.delete.onClose, dispatch)}
        onClosed={createCallback(state.delete.onClosed, dispatch)}
        onDismiss={createCallback(state.delete.onDismiss, dispatch)}
        onSuccess={createCallback(state.delete.onSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region History */}
      <HistoryDialog
        open={state.history.open}
        versionsBranch={versionsBranch}
        permissions={permissions?.[versionsBranch?.item?.path]}
        onClose={createCallback(state.history.onClose, dispatch)}
        onClosed={createCallback(state.history.onClosed, dispatch)}
        onDismiss={createCallback(state.history.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region View Versions */}
      <ViewVersionDialog
        open={state.viewVersion.open}
        isFetching={state.viewVersion.isFetching}
        error={state.viewVersion.error}
        rightActions={state.viewVersion.rightActions?.map((action) => ({
          ...action,
          onClick: createCallback(action.onClick, dispatch)
        }))}
        version={state.viewVersion.version}
        contentTypesBranch={contentTypesBranch}
        onClose={createCallback(state.viewVersion.onClose, dispatch)}
        onClosed={createCallback(state.viewVersion.onClosed, dispatch)}
        onDismiss={createCallback(state.viewVersion.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Compare Versions */}
      <CompareVersionsDialog
        open={state.compareVersions.open}
        isFetching={state.compareVersions.isFetching}
        error={state.compareVersions.error}
        rightActions={state.compareVersions.rightActions?.map((action) => ({
          ...action,
          onClick: createCallback(action.onClick, dispatch)
        }))}
        contentTypesBranch={contentTypesBranch}
        selectedA={versionsBranch?.selected[0] ? versionsBranch.byId[versionsBranch.selected[0]] : null}
        selectedB={versionsBranch?.selected[1] ? versionsBranch.byId[versionsBranch.selected[1]] : null}
        versionsBranch={versionsBranch}
        disableItemSwitching={state.compareVersions.disableItemSwitching}
        onClose={createCallback(state.compareVersions.onClose, dispatch)}
        onClosed={createCallback(state.compareVersions.onClosed, dispatch)}
        onDismiss={createCallback(state.compareVersions.onDismiss, dispatch)}
      />
      {/* endregion */}

      {/* region Minimized Dialogs */}
      <MinimizedDialogManager state={state} dispatch={dispatch} />
      {/* endregion */}

      {/* region Auth Monitor */}
      <AuthMonitor />
      {/* endregion */}

      {/* region Workflow Cancellation */}
      <WorkflowCancellationDialog
        open={state.workflowCancellation.open}
        items={state.workflowCancellation.items}
        onClose={createCallback(state.workflowCancellation.onClose, dispatch)}
        onClosed={createCallback(state.workflowCancellation.onClosed, dispatch)}
        onDismiss={createCallback(state.workflowCancellation.onDismiss, dispatch)}
        onContinue={createCallback(state.workflowCancellation.onContinue, dispatch)}
      />
      {/* endregion */}

      {/* region Reject */}
      <RejectDialog
        open={state.reject.open}
        items={state.reject.items}
        onClose={createCallback(state.reject.onClose, dispatch)}
        onClosed={createCallback(state.reject.onClosed, dispatch)}
        onDismiss={createCallback(state.reject.onDismiss, dispatch)}
        onRejectSuccess={createCallback(state.reject.onRejectSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Create Folder */}
      <CreateFolderDialog
        open={state.createFolder.open}
        path={state.createFolder.path}
        rename={state.createFolder.rename}
        value={state.createFolder.value}
        allowBraces={state.createFolder.allowBraces}
        onClose={createCallback(state.createFolder.onClose, dispatch)}
        onClosed={createCallback(state.createFolder.onClosed, dispatch)}
        onCreated={createCallback(state.createFolder.onCreated, dispatch)}
        onRenamed={createCallback(state.createFolder.onRenamed, dispatch)}
      />
      {/* endregion */}

      {/* region Create File */}
      <CreateFileDialog
        open={state.createFile.open}
        path={state.createFile.path}
        type={state.createFile.type}
        allowBraces={state.createFile.allowBraces}
        onClose={createCallback(state.createFile.onClose, dispatch)}
        onClosed={createCallback(state.createFile.onClosed, dispatch)}
        onCreated={createCallback(state.createFile.onCreated, dispatch)}
      />
      {/* endregion */}

      {/* region Create Folder */}
      <CopyItemsDialog
        open={state.copy.open}
        title={state.copy.title}
        subtitle={state.copy.subtitle}
        item={state.copy.item}
        onClose={createCallback(state.copy.onClose, dispatch)}
        onClosed={createCallback(state.copy.onClosed, dispatch)}
        onOk={createCallback(state.copy.onOk, dispatch)}
      />
      {/* endregion */}

      {/* region Bulk Upload */}
      <BulkUploadDialog
        open={state.upload.open}
        path={state.upload.path}
        site={state.upload.site}
        maxSimultaneousUploads={state.upload.maxSimultaneousUploads}
        onClose={createCallback(state.upload.onClose, dispatch)}
        onClosed={createCallback(state.upload.onClosed, dispatch)}
      />
      {/* endregion */}

      {/* region PreviewDialog */}
      <PreviewDialog
        open={state.preview.open}
        url={state.preview.url}
        type={state.preview.type}
        mode={state.preview.mode}
        title={state.preview.title}
        content={state.preview.content}
        onClose={createCallback(state.preview.onClose, dispatch)}
        onClosed={createCallback(state.preview.onClosed, dispatch)}
      />
      {/* endregion */}

      {/* region Edit Site */}
      <EditSiteDialog
        open={state.editSite.open}
        site={state.editSite.site}
        onClose={createCallback(state.editSite.onClose, dispatch)}
        onClosed={createCallback(state.editSite.onClosed, dispatch)}
        onDismiss={createCallback(state.editSite.onDismiss, dispatch)}
        onSaveSuccess={createCallback(state.editSite.onSaveSuccess, dispatch)}
      />
      {/* endregion */}

      {/* region Path Selection */}
      <PathSelectionDialog
        open={state.pathSelection.open}
        rootPath={state.pathSelection.rootPath}
        initialPath={state.pathSelection.initialPath}
        showCreateFolder={state.pathSelection.showCreateFolder}
        title={state.pathSelection.title}
        onClose={createCallback(state.pathSelection.onClose, dispatch)}
        onClosed={createCallback(state.pathSelection.onClosed, dispatch)}
        onOk={createCallback(state.pathSelection.onOk, dispatch)}
      />
      {/* endregion */}

      {/* region Item Menu */}
      <ItemMenu
        open={state.itemMenu.open}
        path={state.itemMenu.path}
        loaderItems={state.itemMenu.loaderItems}
        onClose={createCallback(state.itemMenu.onClose, dispatch)}
        anchorReference={state.itemMenu.anchorReference}
        anchorPosition={state.itemMenu.anchorPosition}
      />
      {/* endregion */}
    </Suspense>
  );
}

// @formatter:off
function MinimizedDialogManager({ state, dispatch }: { state: GlobalState['dialogs']; dispatch: Dispatch }) {
  const classes = useStyles({});

  const el = useMemo(() => {
    return document.createElement('div');
  }, []);

  useEffect(() => {
    el.className = classes.wrapper;
  }, [el, classes.wrapper]);

  const inventory = useMemo(() => Object.values(state.minimizedDialogs).filter((tab) => tab.minimized), [
    state.minimizedDialogs
  ]);
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
// @formatter:on

export default React.memo(GlobalDialogManager);
