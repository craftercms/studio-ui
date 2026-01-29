/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import { useAtomValue, useSetAtom, useStore as useJotaiStore } from 'jotai/index';
import { useDispatch, useSelector, useStore as useReduxStore } from 'react-redux';
import GlobalState, { DialogStackItem } from '../../../models/GlobalState';
import { FormattedMessage, useIntl } from 'react-intl';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import React, { useContext } from 'react';
import { FormsEngineFormContextApi, ItemMetaContext, StableFormContext } from './formsEngineContext';
import {
	composePathForType,
	createObjectWithSystemProps,
	extractAtomValues,
	getBasePath,
	getFileNameValueFromPath,
	showAlert
} from './formUtils';
import { FormSavePromiseResult, FormsEngineProps } from '../FormsEngine';
import { XmlKeys } from './formConsts';
import { fromString } from '../../../utils/xml';
import { moveAndUpdateContent, writeContent } from '../../../services/content';
import { AjaxError } from 'rxjs/ajax';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { buildContentXml } from './valueSerializers';
import { flushSync } from 'react-dom';
import LookupTable from '../../../models/LookupTable';
import { checkMinimumSaveRequirementsFulfilled, isInternalNameValid } from './validators';
import ContentType from '../../../models/ContentType';
import { updateDialogState } from '../../../state/actions/dialogStack';
import { FormsEngineDialogProps } from '../FormsEngineDialog';

export interface UseSaveFormProps {
	createPath?: string;
	isRepeatMode: boolean;
	isCreateMode: boolean;
	isEmbedded: boolean;
	onBeforeSave?: FormsEngineProps['onSave'];
	onSave?: FormsEngineProps['onSave'];
	dialogId?: string;
	onClose?(): void;
}

const wrapOnSaveProp: (onSaveProp: FormsEngineProps['onSave']) => FormsEngineProps['onSave'] = (onSaveProp) => (args) =>
	onSaveProp?.(args) ?? Promise.resolve({ close: false });

export function useSaveForm(props: UseSaveFormProps) {
	const jotai = useJotaiStore();
	const store = useReduxStore<GlobalState>();
	const dispatch = useDispatch();
	const { formatMessage } = useIntl();
	const siteId = useActiveSiteId();
	const { isEmbedded, isRepeatMode, isCreateMode, onClose, createPath } = props;
	const { id, contentType, contentObject, path: itemPath } = useContext(ItemMetaContext);
	const isPage = contentType.type === 'page';
	const stableFormContext = useContext(StableFormContext);
	const formContextApi = useContext(FormsEngineFormContextApi);
	const setIsSubmitting = useSetAtom(stableFormContext.atoms.isSubmitting);
	const closeAfterSave = useAtomValue(stableFormContext.atoms.closeAfterSave);
	const versionComment = useAtomValue(stableFormContext.atoms.versionComment);
	const setHasPendingChanges = useSetAtom(stableFormContext.atoms.hasPendingChanges);
	const onSave = wrapOnSaveProp(props.onSave);
	const fileName = useAtomValue(stableFormContext.atoms.fileName);
	const initialFileName = itemPath ? getFileNameValueFromPath(itemPath, isPage) : '';
	const dialogState = useSelector(
		(state: GlobalState) => state.dialogStack.byId[props.dialogId] as DialogStackItem<FormsEngineDialogProps>
	);

	return async () => {
		const values = extractAtomValues(jotai, stableFormContext.atoms.valueByFieldId);
		const onSavePromiseHandler = ({ close }: FormSavePromiseResult) => {
			flushSync(() => {
				setIsSubmitting(false);
				setHasPendingChanges(false);
				// TODO: What would `setValuesCheckpoint` do if called on a repeat group form?
				!isRepeatMode && formContextApi.setValuesCheckpoint(values);
			});
			(close || closeAfterSave) && onClose?.();
		};
		// Repeat handled here. If true, execution ends inside if statement.
		if (isRepeatMode) {
			(onSave?.({ values, versionComment }) as Promise<FormSavePromiseResult>)?.then(onSavePromiseHandler);
			return;
		}

		const validityStates = await Promise.all(
			Object.values(stableFormContext.atoms.validationByFieldId).map((validityDataAtom) => jotai.get(validityDataAtom))
		);
		// Put system properties in before creating the XML
		const saveAsDraft = validityStates.some((state) => !state.isValid);

		complementValuesWithSystemProps(id, values, contentObject, contentType, saveAsDraft);
		const { [XmlKeys.fileName]: _, ...valuesWithoutFileName } = values;
		const xml = buildContentXml(valuesWithoutFileName, store.getState().contentTypes.byId);
		// Embedded handled here. If true, execution ends inside if statement.
		if (isEmbedded) {
			// Validate minimum embedded requirements to save as draft. Execution stops if minimum reqs aren't fulfilled.
			if (!isInternalNameValid(values)) {
				return showAlert({
					dispatch,
					message: formatMessage(
						{ defaultMessage: 'You need an {internalName} at a minimum to save content.' },
						{ internalName: contentType.fields[XmlKeys.internalName].name }
					)
				});
			}

			const dom = fromString(xml);
			(onSave?.({ dom, xml, values, versionComment }) as Promise<FormSavePromiseResult>)?.then(onSavePromiseHandler);
			return;
		}
		setIsSubmitting(true);
		let path: string;
		let renamePath: string;
		const isRename = !isCreateMode && fileName !== initialFileName;
		if (isCreateMode) {
			path = composePathForType(createPath, fileName, contentType);
		} /* is a plain update (page or component) */ else {
			if (isRename) {
				const basePath = getBasePath(itemPath, isPage);
				path = composePathForType(basePath, fileName, contentType);
				renamePath = path;
			} else {
				path = itemPath;
			}
		}

		const saveActionCallbacks = {
			next() {
				const dom = fromString(xml);
				(onSave?.({ dom, xml, values, versionComment, path }) as Promise<FormSavePromiseResult>)?.then((result) => {
					onSavePromiseHandler(result);
					const shouldClose = result.close || closeAfterSave;
					if (isRename && dialogState && !shouldClose) {
						dispatch(
							updateDialogState({
								id: props.dialogId,
								props: {
									formProps: {
										...dialogState.props.formProps,
										update: { path: renamePath, dialogId: props.dialogId }
									}
								}
							})
						);
					}
				});
			},
			error(error: AjaxError) {
				setIsSubmitting(false);
				showAlert({
					dispatch,
					children: (
						<Box>
							<Typography marginBottom={1}>
								<FormattedMessage defaultMessage="An error occurred trying to save the form" />
							</Typography>
							<Typography variant="body2" color="textSecondary">
								{error.response.response?.message ?? error.response.message}
							</Typography>
						</Box>
					)
				});
			}
		};

		// Validate minimum requirements to save as draft. Execution stops if minimum reqs aren't fulfilled.
		const minimumRequirementsFullfilled = await checkMinimumSaveRequirementsFulfilled(
			jotai.get(stableFormContext.atoms.validationByFieldId[XmlKeys['fileName']]),
			values
		);
		if (!minimumRequirementsFullfilled) {
			setIsSubmitting(false);
			return showAlert({
				dispatch,
				message: formatMessage(
					{ defaultMessage: 'You need a valid {fileName} and {internalName} at a minimum to save content.' },
					{
						fileName: contentType.fields[XmlKeys.fileName].name,
						internalName: contentType.fields[XmlKeys.internalName].name
					}
				)
			});
		}

		// TODO: validateActionPolicy. See FE1 saveFn.
		// TODO: write-content url on FE1 sends phase, path, fileName, contentType QSAs. Important?
		// TODO: Cancel packages when needed.
		if (isRename) {
			moveAndUpdateContent(siteId, itemPath, path, xml).subscribe(saveActionCallbacks);
		} else {
			writeContent(siteId, path, xml).subscribe(saveActionCallbacks);
		}
	};
}

function complementValuesWithSystemProps(
	id: string,
	values: LookupTable<unknown>,
	contentObject: LookupTable<unknown>,
	contentType: ContentType,
	saveAsDraft: boolean
): void {
	const systemProps = createObjectWithSystemProps(contentType, {
		[XmlKeys.modelId]: id,
		[XmlKeys.internalName]: values[XmlKeys.internalName] as string,
		[XmlKeys.dateCreated]: contentObject[XmlKeys.dateCreated] as string,
		[XmlKeys.dateCreatedDt]: contentObject[XmlKeys.dateCreatedDt] as string,
		[XmlKeys.savedAsDraft]: saveAsDraft
	});

	// Do not overwrite any existing value.
	for (const key in systemProps) {
		if (!(key in values)) {
			values[key] = systemProps[key];
		}
	}
}

export default useSaveForm;
