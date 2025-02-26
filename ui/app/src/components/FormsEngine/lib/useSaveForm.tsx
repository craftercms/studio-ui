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
import { writeContent } from '../../../services/content';
import { AjaxError } from 'rxjs/ajax';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { buildContentXml } from './valueSerializers';

export interface UseSaveFormProps {
	createPath?: string;
	isRepeatMode: boolean;
	isCreateMode: boolean;
	isEmbedded: boolean;
	onBeforeSave?: FormsEngineProps['onSave'];
	onSave?: FormsEngineProps['onSave'];
	onClose?(): void;
}

export function useSaveForm(props: UseSaveFormProps) {
	const jotai = useJotaiStore();
	const store = useReduxStore<GlobalState>();
	const dispatch = useDispatch();
	const { formatMessage } = useIntl();
	const siteId = useActiveSiteId();
	const { isEmbedded, isRepeatMode, isCreateMode, onSave, onClose, createPath } = props;
	const { id, contentType, contentObject, path: itemPath } = useContext(ItemMetaContext);
	const stableFormContext = useContext(StableFormContext);
	const formContextApi = useContext(FormsEngineFormContextApi);
	const setIsSubmitting = useSetAtom(stableFormContext.atoms.isSubmitting);
	const versionComment = useAtomValue(stableFormContext.atoms.versionComment);
	const setHasPendingChanges = useSetAtom(stableFormContext.atoms.hasPendingChanges);
	const onSavePromiseHandler = ({ close }: FormSavePromiseResult) => {
		close && onClose?.();
	};
	return () => {
		// TODO: Run necessary validations to ensure the form is ready to be saved.
		const values = extractAtomValues(jotai, stableFormContext.atoms.valueByFieldId);
		// Repeat handled here. If true, execution ends inside if statement.
		if (isRepeatMode) {
			setHasPendingChanges(false);
			onSave?.({ values, versionComment })?.then(onSavePromiseHandler);
			return;
		}
		// Put system properties in before creating the XML
		Object.assign(
			values,
			createObjectWithSystemProps(contentType, {
				[XmlKeys.modelId]: id,
				[XmlKeys.internalName]: values[XmlKeys.internalName] as string,
				[XmlKeys.fileName]: (values[XmlKeys.fileName] ?? contentObject[XmlKeys.fileName]) as string,
				[XmlKeys.folderName]: (values[XmlKeys.folderName] ?? contentObject[XmlKeys.folderName]) as string,
				[XmlKeys.dateCreated]: contentObject[XmlKeys.dateCreated] as string,
				[XmlKeys.dateCreatedDt]: contentObject[XmlKeys.dateCreatedDt] as string,
				[XmlKeys.savedAsDraft]: Object.values(stableFormContext.atoms.validationByFieldId).some(
					(validityDataAtom) => !jotai.get(validityDataAtom).isValid
				)
			})
		);
		console.log(values, contentType);
		// Validate minimum requirements to save as draft. Execution stops if minimum reqs aren't fulfilled.
		if (
			[values[XmlKeys.fileName], values[XmlKeys.folderName]].join('').trim() === '' ||
			values[XmlKeys.internalName].toString().trim() === ''
		) {
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
			setHasPendingChanges(false);
			const dom = fromString(xml);
			onSave?.({ dom, xml, values, versionComment })?.then(onSavePromiseHandler);
			return;
		}
		setIsSubmitting(true);
		let path: string;
		if (isCreateMode) {
			path = ensureSingleSlash(`${createPath}/${values[XmlKeys.folderName]}/${values[XmlKeys.fileName]}`);
		} /* is a plain update (page or component) */ else {
			path = itemPath;
		}
		// TODO: Temporary playground save path. Remove.
		// path = '/site/website/fe2-save-result.xml';
		writeContent(siteId, path, xml).subscribe({
			next() {
				setIsSubmitting(false);
				setHasPendingChanges(false);
				formContextApi.setValuesCheckpoint(values);
				const dom = fromString(xml);
				onSave?.({ dom, xml, values, versionComment })?.then(onSavePromiseHandler);
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
		});
	};
}
