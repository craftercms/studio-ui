/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { applyContentNameRules } from '../../../utils/content';
import { FormsEngineField } from '../components/FormsEngineField';
import InputAdornment from '@mui/material/InputAdornment';
import { ControlProps } from '../types';
import { useItemMetaContext, useStableFormContext } from '../lib/formsEngineContext';
import { useAtom, useAtomValue } from 'jotai';
import { PrimitiveAtom } from 'jotai/index';
import { fetchLegacyContentType } from '../../../services/contentTypes';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { popDialog, pushDialog } from '../../../state/actions/dialogStack';
import { createComponentId } from '../../../utils/system';
import { nanoid } from 'nanoid';
import { nnou } from '../../../utils/object';
import { isFieldReadOnly } from '../lib/formUtils';
import { checkPathExistence } from '../../../services/content';
import { ensureSingleSlash } from '../../../utils/string';
import type { Dispatch } from 'redux';

export interface SlugProps extends ControlProps {
	value: string;
}

// TODO: Check behaviour for embedded components. Seems to be hidden on current engine.
export function Slug(props: SlugProps) {
	const { field, readonly: formReadonly, contentType, autoFocus } = props;
	const { atoms } = useStableFormContext();
	const { path, pathInSite } = useItemMetaContext();
	const formContext = useStableFormContext();
	const isNewForm = nnou(formContext.props?.create);
	const htmlId = useId();
	if (field.id === 'fileName') {
		throw new Error('Detected field ID "fileName" instead "file-name" at the "Slug" Control.');
	}
	const isPage = contentType?.type === 'page';
	const [isContentAsFolder, setIsContentAsFolder] = useState<boolean>(isPage);
	const isFolder = field.id === 'file-name' && isPage && isContentAsFolder;
	const fieldId = isFolder ? 'folder-name' : field.id;
	const [value, setValue] = useAtom(atoms.valueByFieldId[fieldId] as PrimitiveAtom<string>);
	const validityState = useAtomValue(atoms.validationByFieldId[fieldId]);
	const [pathExists, setPathExists] = useState<boolean>(false);
	const webUrlRoot = ensureSingleSlash(`${pathInSite.replace('/site/website', '/')}/`);
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();

	// region field properties/validations
	const readonly: boolean = isFieldReadOnly(field, formReadonly);
	// endregion

	// This is the value without `.xml` suffix (if applicable).
	const presentationalValue = useMemo(() => {
		return value.replace('.xml', '');
	}, [value]);

	useEffect(() => {
		if (contentType?.id && siteId) {
			// Set isFetching and add a loader
			fetchLegacyContentType(siteId, contentType.id).subscribe({
				next: ({ contentAsFolder }) => {
					setIsContentAsFolder(contentAsFolder);
				},
				error: (err) => {
					console.error('Error fetching content type for FileName control:', err);
				}
			});
		}
	}, [contentType?.id, siteId]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => {
		let newValue = applyContentNameRules(e.currentTarget.value);
		// Add back the `.xml` suffix if applicable.
		newValue = !isFolder ? `${newValue}.xml` : newValue;
		setValue(newValue);

		const newPath = ensureSingleSlash(`${pathInSite}/${newValue}${isFolder ? '/index.xml' : ''}`);
		checkPathExistence(siteId, newPath).subscribe({
			next: (exists) => {
				setPathExists(exists);
			},
			error: (err) => {
				console.error('Error checking path existence for FileName control:', err);
			}
		});
	};

	const handleEdit = () => {
		const itemValue = isFolder ? `${value}/index.xml` : value;
		const itemPath = path.replace(`${itemValue}`, '');
		const id = nanoid();

		showRenameDialog(
			itemPath,
			itemValue,
			(newName: string) => {
				let updatedName = newName;
				// if folder, remove `/index.xml`
				if (isFolder && newName.endsWith('/index.xml')) {
					updatedName = newName.replace('/index.xml', '');
				}
				setValue(updatedName);
				dispatch(popDialog({ id }));
			},
			dispatch
		);
	};

	return (
		<FormsEngineField
			isValid={validityState.isValid && !(isNewForm && pathExists)} // TODO: this should not go in here, but validator is not async
			htmlFor={htmlId}
			field={field}
			min={field.validations.minValue?.value}
			max={field.validations.maxLength?.value}
			length={presentationalValue.length}
		>
			<OutlinedInput
				autoFocus={autoFocus}
				fullWidth
				id={htmlId}
				value={presentationalValue}
				onChange={handleChange}
				disabled={!isNewForm || readonly}
				startAdornment={
					<InputAdornment position="start" title={webUrlRoot} sx={{ mr: 0 }}>
						{webUrlRoot}
					</InputAdornment>
				}
				endAdornment={
					!isNewForm && (
						<Tooltip title={<FormattedMessage defaultMessage="Edit" />}>
							<IconButton onClick={handleEdit} disabled={readonly}>
								<EditOutlinedIcon />
							</IconButton>
						</Tooltip>
					)
				}
			/>
		</FormsEngineField>
	);
}

function showRenameDialog(path: string, value: string, onRenamed: (newName: string) => void, dispatch: Dispatch) {
	const id = nanoid();
	dispatch(
		pushDialog({
			id,
			component: createComponentId('RenameContentDialog'),
			props: { path, value, onRenamed }
		})
	);

	return null;
}

export default Slug;
