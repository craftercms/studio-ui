/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { ofType } from 'redux-observable';
import { filter, ignoreElements, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { NEVER, of } from 'rxjs';
import { camelize, dasherize } from '../../utils/string';
import {
	closeCodeEditorDialog,
	closeCompareVersionsDialog,
	closeConfirmDialog,
	closeDeleteDialog,
	closeDependenciesDialog,
	closeHistoryDialog,
	closeNewContentDialog,
	closePublishDialog,
	closeRenameAssetDialog,
	closeSingleFileUploadDialog,
	closeViewVersionDialog,
	fetchContentVersion,
	fetchContentVersionComplete,
	fetchContentVersionFailed,
	fetchDeleteDependencies,
	fetchRenameAssetDependants,
	newContentCreationComplete,
	showCodeEditorDialog,
	showEditDialog,
	updateCodeEditorDialog,
	updateEditDialogConfig
} from '../actions/dialogs';
import { fetchDeleteDependencies as fetchDeleteDependenciesService, fetchDependant } from '../../services/dependencies';
import { fetchContentXML, fetchItemVersion } from '../../services/content';
import { catchAjaxError } from '../../utils/ajax';
import { batchActions } from '../actions/misc';
import { asArray } from '../../utils/array';
import { changeCurrentUrl, requestWorkflowCancellationDialogOnResult } from '../actions/preview';
import { CrafterCMSEpic } from '../store';
import { formEngineMessages } from '../../env/i18n-legacy';
import infoGraphic from '../../assets/information.svg';
import { nnou, nou } from '../../utils/object';
import { getHostToGuestBus } from '../../utils/subjects';
import { unlockItem } from '../actions/content';
import { parseLegacyItemToContentItem } from '../../utils/content';
import { LegacyItem } from '../../models';
import { generateDialogId } from '../../utils/dialogs';
import { LegacyFormDialogStateProps } from '../../components/LegacyFormDialog/utils';
import { CodeEditorDialogStateProps, type PreviewDialogStateProps } from '../../components';
import { popDialog, pushDialog, updateDialogState } from '../actions/dialogStack';
import { nanoid } from 'nanoid';

function getDialogNameFromType(type: string): string {
	let name = getDialogActionNameFromType(type);
	return camelize(dasherize(name.toLowerCase()));
}

function getDialogActionNameFromType(type: string): string {
	return type.replace(/(CLOSE_)|(_DIALOG)/g, '');
}

function getDialogState(type: string, state: GlobalState): { onClose: StandardAction } {
	const stateName = getDialogNameFromType(type);
	const dialog = state.dialogs[stateName];
	if (!dialog) {
		console.error(`[epics/dialogs] Unable to retrieve dialog state from "${stateName}" action`);
	}
	return dialog;
}

const dialogEpics: CrafterCMSEpic[] = [
	// region onClose Actions
	(action$, state$) =>
		action$.pipe(
			ofType(
				closeConfirmDialog.type,
				closePublishDialog.type,
				closeDeleteDialog.type,
				closeNewContentDialog.type,
				closeHistoryDialog.type,
				closeViewVersionDialog.type,
				closeCompareVersionsDialog.type,
				closeDependenciesDialog.type,
				closeSingleFileUploadDialog.type
			),
			withLatestFrom(state$),
			map(([{ type, payload }, state]) => {
				// Setting both onDismiss & onClose to the "CLOSE_*_DIALOG" action, allows escape
				// and backdrop click to work. MUI dialogs will call onClose either when escape is
				// pressed or the backdrop is clicked which is fine. When onDismiss is called, however
				// the MUI dialog would later also call the onClose action and this causes a infinite
				// "loop" of "CLOSE_*_DIALOG" actions. The filter insures the actions to be called
				// don't include the "CLOSE_*_DIALOG" action to avoid said loop.
				const onClose = getDialogState(type, state)?.onClose;

				return [
					// In the case of batch actions, save the additional BATCH_ACTIONS action itself
					// and jump straight to the actions to dispatch.
					...asArray(payload?.type === batchActions.type ? payload.payload : payload),
					...asArray(onClose?.type === batchActions.type ? onClose.payload : onClose)
				].filter((action) => Boolean(action) && action.type && action.type !== type);
			}),
			filter((actions) => actions.length > 0),
			switchMap((actions) => actions)
		),
	// endregion
	// region fetchContentVersion
	(action$, state$) =>
		action$.pipe(
			ofType(fetchContentVersion.type),
			withLatestFrom(state$),
			switchMap(([{ payload }, state]) =>
				fetchItemVersion(state.sites.active, payload.path, payload.versionNumber).pipe(
					map(fetchContentVersionComplete),
					catchAjaxError(fetchContentVersionFailed)
				)
			)
		),
	// endregion
	// region newContentCreationComplete
	(action$, state$) =>
		action$.pipe(
			ofType(newContentCreationComplete.type),
			filter(({ payload }) => payload.item?.isPage && payload.item.isPreviewable),
			map(({ payload }) => changeCurrentUrl(payload.redirectUrl))
		),
	// endregion
	// region fetchDeleteDependencies
	(action$, state$) =>
		action$.pipe(
			ofType(fetchDeleteDependencies.type),
			withLatestFrom(state$),
			switchMap(
				([
					{
						payload: { paths, dialogId }
					},
					state
				]) =>
					fetchDeleteDependenciesService(state.sites.active, paths).pipe(
						map((response) => {
							return updateDialogState({
								id: dialogId,
								props: {
									isFetching: false,
									dependentItems: response.dependentItems,
									childItems: response.childItems
								}
							});
						}),
						catchAjaxError((error) => updateDialogState({ id: dialogId, props: { error, isFetching: false } }))
					)
			)
		),
	// endregion
	// region showEditDialog, showCodeEditorDialog
	(action$, state$, { getIntl, store }) =>
		action$.pipe(
			ofType(showEditDialog.type, showCodeEditorDialog.type),
			withLatestFrom(state$),
			switchMap(([{ type, payload }, state]) => {
				// If state.path isn't null and the payload.path is different, it means another form is getting opened.
				// To avoid losing state of the form, we disallow this and show a dialog indicating to close the current
				// form before opening another.
				let showValidation = false;

				const dialogId = generateDialogId(type);
				const dialogState = state.dialogStack.byId[dialogId];

				if (dialogState) {
					if (type === showEditDialog.type) {
						showValidation =
							payload.path !== (dialogState.props as LegacyFormDialogStateProps).path ||
							payload.iceGroupId !== (dialogState.props as LegacyFormDialogStateProps).iceGroupId ||
							payload.modelId !== (dialogState.props as LegacyFormDialogStateProps).modelId;
					} else {
						showValidation = payload.path !== (dialogState.props as CodeEditorDialogStateProps).path;
					}
				}

				if (nou(payload.path) || !showValidation) {
					// If showEditDialog action is called while the dialog is already open & minimized, we maximize it.
					// Differences in the showEditDialog payload — to what's on the state — are ignored, except for the path,
					// which is used to check if it's the same form that's getting opened.

					if (dialogState) {
						const { isMinimized, updateDialogAction } =
							type === showEditDialog.type
								? {
										isMinimized: (dialogState.props as LegacyFormDialogStateProps).isMinimized,
										updateDialogAction: updateEditDialogConfig
									}
								: {
										isMinimized: (dialogState.props as CodeEditorDialogStateProps).isMinimized,
										updateDialogAction: updateCodeEditorDialog
									};
						if (isMinimized === true) {
							return of(updateDialogAction({ isMinimized: false }));
						}
					} else {
						return NEVER;
					}
				} else {
					const dialogId = nanoid();
					return of(
						pushDialog({
							id: dialogId,
							component: 'craftercms.components.ConfirmDialog',
							props: {
								body: getIntl().formatMessage(formEngineMessages.inProgressConfirmation),
								imageUrl: infoGraphic,
								onOk: () => store.dispatch(popDialog({ id: dialogId }))
							}
						})
					);
				}
			})
		),
	// endregion
	// region showPreviewDialog
	(action$, state$) =>
		action$.pipe(
			ofType(pushDialog.type),
			withLatestFrom(state$),
			filter(([{ payload }, state]) => {
				return (
					payload.component === 'craftercms.components.PreviewDialog' &&
					payload.props.type === 'editor' &&
					nnou(payload.props.url) &&
					nou((state.dialogStack.byId[payload.id]?.props as PreviewDialogStateProps)?.content)
				);
			}),
			switchMap(([{ payload }, state]) =>
				fetchContentXML(state.sites.active, payload.props.url).pipe(
					map((content) => updateDialogState({ id: payload.id, props: { content } }))
				)
			)
		),
	// endregion
	// region requestWorkflowCancellationDialogOnResult
	(action$) =>
		action$.pipe(
			ofType(requestWorkflowCancellationDialogOnResult.type),
			tap((action) => {
				const hostToGuest$ = getHostToGuestBus();
				hostToGuest$.next(action);
			}),
			ignoreElements()
		),
	// endregion
	// TODO: how to handle this in the new dialogs system?
	// region closeCodeEditorDialog
	// Moved unlock from dialog to epics since the container has no visibility of the backdrop click close and
	// was hence unable to unlock the item in all cases.
	(action$, state$) =>
		action$.pipe(
			ofType(closeCodeEditorDialog.type),
			withLatestFrom(state$),
			filter(([, state]) => {
				const username = state.user.username;
				const item = state.content.itemsByPath[state.dialogs.codeEditor.path];
				return item.stateMap.locked && item.lockOwner.username === username;
			}),
			map(([, state]) => unlockItem({ path: state.dialogs.codeEditor.path }))
		),
	// endregion
	// region renameAssetDialog
	(action$, state$) =>
		action$.pipe(
			ofType(fetchRenameAssetDependants.type),
			withLatestFrom(state$),
			switchMap(([{ payload }, state]) =>
				fetchDependant(state.sites.active, payload.path).pipe(
					takeUntil(action$.pipe(ofType(closeRenameAssetDialog.type))),
					map((response: LegacyItem[]) => {
						const dependantItems = parseLegacyItemToContentItem(response);
						return updateDialogState({
							id: payload.dialogId,
							props: { dependantItems, fetchingDependantItems: false }
						});
					}),
					catchAjaxError((error) =>
						updateDialogState({
							id: payload.dialogId,
							props: { error, fetchingDependantItems: false }
						})
					)
				)
			)
		)
	// endregion
] as CrafterCMSEpic[];

export default dialogEpics;
