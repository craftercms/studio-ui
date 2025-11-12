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
import { useDispatch, useStore as useReduxStore } from 'react-redux';
import GlobalState from '../../../models/GlobalState';
import { FormattedMessage, useIntl } from 'react-intl';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import React, { useContext } from 'react';
import { FormsEngineFormContextApi, ItemMetaContext, StableFormContext } from './formsEngineContext';
import { createObjectWithSystemProps, extractAtomValues, showAlert } from './formUtils';
import { FormSavePromiseResult, FormsEngineProps } from '../FormsEngine';
import { XmlKeys } from './formConsts';
import { fromString } from '../../../utils/xml';
import { ensureSingleSlash } from '../../../utils/string';
import { moveAndUpdateContent, writeContent } from '../../../services/content';
import { AjaxError } from 'rxjs/ajax';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { buildContentXml } from './valueSerializers';
import { flushSync } from 'react-dom';
import LookupTable from '../../../models/LookupTable';
import { checkMinimumSaveRequirementsFulfilled } from './validators';
import ContentType from '../../../models/ContentType';

export interface UseSaveFormProps {
	createPath?: string;
	isRepeatMode: boolean;
	isCreateMode: boolean;
	isEmbedded: boolean;
	onBeforeSave?: FormsEngineProps['onSave'];
	onSave?: FormsEngineProps['onSave'];
	stackIndex: number;
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
	const changedFieldIds = stableFormContext.changedFieldIds;
	const formContextApi = useContext(FormsEngineFormContextApi);
	const setIsSubmitting = useSetAtom(stableFormContext.atoms.isSubmitting);
	const closeAfterSave = useAtomValue(stableFormContext.atoms.closeAfterSave);
	const versionComment = useAtomValue(stableFormContext.atoms.versionComment);
	const setHasPendingChanges = useSetAtom(stableFormContext.atoms.hasPendingChanges);
	const onSave = wrapOnSaveProp(props.onSave);

	return () => {
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

		Promise.all(
			Object.values(stableFormContext.atoms.validationByFieldId).map((validityDataAtom) => jotai.get(validityDataAtom))
		).then((validityStates) => {
			// Put system properties in before creating the XML
			const saveAsDraft = validityStates.some((state) => !state.isValid);

			complementValuesWithSystemProps(id, values, contentObject, contentType, saveAsDraft);
			// Validate minimum requirements to save as draft. Execution stops if minimum reqs aren't fulfilled.
			if (!checkMinimumSaveRequirementsFulfilled(values)) {
				return showAlert({
					dispatch,
					message: formatMessage(
						{ defaultMessage: 'You need a {fileName} and {internalName} at a minimum to save content.' },
						{
							fileName: contentType.fields[XmlKeys.fileName].name,
							internalName: contentType.fields[XmlKeys.internalName].name
						}
					)
				});
			}
			const xml = buildContentXml(values, store.getState().contentTypes.byId);
			// Embedded handled here. If true, execution ends inside if statement.
			if (isEmbedded) {
				const dom = fromString(xml);
				(onSave?.({ dom, xml, values, versionComment }) as Promise<FormSavePromiseResult>)?.then(onSavePromiseHandler);
				return;
			}
			setIsSubmitting(true);
			let path: string;
			const isRename =
				!isCreateMode && (changedFieldIds.has(XmlKeys['fileName']) || changedFieldIds.has(XmlKeys['folderName']));
			if (isCreateMode) {
				path = ensureSingleSlash(`${createPath}/${values[XmlKeys.folderName]}/${values[XmlKeys.fileName]}`);
			} /* is a plain update (page or component) */ else {
				if (isRename) {
					const newRelativePath = isPage
						? ensureSingleSlash(`${values[XmlKeys.folderName]}/index.xml`)
						: (values[XmlKeys.fileName] as string);

					// Having a path like `/site/website/tests/index.xml`, I need to update folder-name and file-name, so I need to
					// replace `tests/index.xml` with `${folderName}/${fileName}` (e.g. `my-new-folder/my-new-file.xml`)
					const pathParts = itemPath.split('/');
					// Remove the last two parts (folder-name and file-name) if page, otherwise just the file-name
					const partsToRemove = isPage ? 2 : 1;
					pathParts.splice(-partsToRemove, partsToRemove, newRelativePath);
					path = pathParts.join('/');
				} else {
					path = itemPath;
				}
			}

			const saveActionCallbacks = {
				next() {
					const dom = fromString(xml);
					// TODO: when renaming, if form it not set to be closed, then the form will have the old path and values,
					//  causing it to break. Should we trigger a re-fetch of state/etc?
					(onSave?.({ dom, xml, values, versionComment, path }) as Promise<FormSavePromiseResult>)?.then(
						onSavePromiseHandler
					);
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

			// TODO: validateActionPolicy. See FE1 saveFn.
			// TODO: write-content url on FE1 sends phase, path, fileName, contentType QSAs. Important?
			// TODO: Cancel packages when needed.
			// If not create mode and file-name or folder-name changed, need to moveAndUpdateContent
			// Use xmlKeys
			if (!isCreateMode && (changedFieldIds.has(XmlKeys['fileName']) || changedFieldIds.has(XmlKeys['folderName']))) {
				moveAndUpdateContent(siteId, itemPath, path, xml).subscribe(saveActionCallbacks);
			} else {
				// TODO: Temporary playground save path. Remove.
				// path = '/site/website/fe2-save-result.xml';
				writeContent(siteId, path, xml).subscribe(saveActionCallbacks);
			}
		});
	};
}

function complementValuesWithSystemProps(
	id: string,
	values: LookupTable<unknown>,
	contentObject: LookupTable<unknown>,
	contentType: ContentType,
	saveAsDraft: boolean
): void {
	Object.assign(
		values,
		createObjectWithSystemProps(contentType, {
			[XmlKeys.modelId]: id,
			[XmlKeys.internalName]: values[XmlKeys.internalName] as string,
			[XmlKeys.fileName]: (values[XmlKeys.fileName] ?? contentObject[XmlKeys.fileName]) as string,
			[XmlKeys.folderName]: (values[XmlKeys.folderName] ?? contentObject[XmlKeys.folderName]) as string,
			[XmlKeys.dateCreated]: contentObject[XmlKeys.dateCreated] as string,
			[XmlKeys.dateCreatedDt]: contentObject[XmlKeys.dateCreatedDt] as string,
			[XmlKeys.savedAsDraft]: saveAsDraft
		})
	);
}

export default useSaveForm;
