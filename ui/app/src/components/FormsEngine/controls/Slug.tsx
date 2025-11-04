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

import OutlinedInput, { OutlinedInputProps } from '@mui/material/OutlinedInput';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { applyContentNameRules } from '../../../utils/content';
import { FormsEngineField } from '../components/FormsEngineField';
import InputAdornment from '@mui/material/InputAdornment';
import { ControlProps } from '../types';
import { useItemMetaContext, useStableFormContext } from '../lib/formsEngineContext';
import { useAtom, useAtomValue } from 'jotai';
import { PrimitiveAtom } from 'jotai/index';
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
import useDebouncedInput from '../../../hooks/useDebouncedInput';
import type { Subscription } from 'rxjs';

export interface SlugProps extends ControlProps {
	value: string;
}

// TODO: Check behaviour for embedded components. Seems to be hidden on current engine.
export function Slug(props: SlugProps) {
	const { field, readonly: formReadonly, contentType, autoFocus } = props;
	const { atoms } = useStableFormContext();
	const { path, pathInSite, contentAsFolder } = useItemMetaContext();
	const formContext = useStableFormContext();
	const isNewForm = nnou(formContext.props?.create);
	const htmlId = useId();
	if (field.id === 'fileName') {
		throw new Error('Detected field ID "fileName" instead "file-name" at the "Slug" Control.');
	}
	const isPage = contentType?.type === 'page';
	const isFolder = field.id === 'file-name' && isPage && contentAsFolder;
	const fieldId = isFolder ? 'folder-name' : field.id;
	const [value, setValue] = useAtom(atoms.valueByFieldId[fieldId] as PrimitiveAtom<string>);
	// WithInitialValue is not exported
	const initialValue = (atoms.valueByFieldId[fieldId] as PrimitiveAtom<string> & { init: string }).init;
	const validityState = useAtomValue(atoms.validationByFieldId[fieldId]);
	const [pathExists, setPathExists] = useState<boolean>(false);
	const pathCheckSubscriptionRef = useRef<Subscription | null>(null);
	const webUrlRoot = ensureSingleSlash(`${pathInSite.replace('/site/website', '/')}/`);
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();

	useEffect(() => {
		return () => {
			pathCheckSubscriptionRef.current?.unsubscribe();
		};
	}, []);

	const onKeyword$ = useDebouncedInput((newPath) => {
		pathCheckSubscriptionRef.current?.unsubscribe();
		pathCheckSubscriptionRef.current = checkPathExistence(siteId, newPath).subscribe({
			next: (exists) => {
				setPathExists(exists);
			},
			error: (err) => {
				console.error('Error checking path existence.', err);
			}
		});
	}, 500);

	// region field properties/validations
	const readonly: boolean = isFieldReadOnly(field, formReadonly);
	// endregion

	// This is the value without `.xml` suffix (if applicable).
	const presentationalValue = useMemo(() => {
		return value.replace('.xml', '');
	}, [value]);

	const handleChange: OutlinedInputProps['onChange'] = (e) => {
		let newValue = applyContentNameRules(e.currentTarget.value);
		// Add back the `.xml` suffix if applicable.
		newValue = !isFolder ? `${newValue}.xml` : newValue;
		setValue(newValue);

		const newPath = ensureSingleSlash(`${pathInSite}/${newValue}${isFolder ? '/index.xml' : ''}`);
		onKeyword$.next(newPath);
	};

	const handleEdit = () => {
		const itemValue = isFolder ? `${value}/index.xml` : value;
		const itemInitialValue = isFolder ? `${initialValue}/index.xml` : initialValue;
		const itemPath = path.replace(`${itemInitialValue}`, '');
		const id = nanoid();

		showRenameDialog(
			id,
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
			isValid={validityState.isValid && !(isNewForm && pathExists)}
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

function showRenameDialog(
	id: string,
	path: string,
	value: string,
	onRenamed: (newName: string) => void,
	dispatch: Dispatch
) {
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

/*
	TODO:
	 - Retrieval of content-as-folder (comes from config.xml, used to be in API1 response)
	 - Check embedded behavior
	 - UM to put config.xml values in form-definition
	 - Validate if new
	 - Check showWarnOnEdit property from control descriptor.
*/
