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

import ContentType from '../../../models/ContentType';
import React, { useState } from 'react';
import Select, { SelectProps } from '@mui/material/Select';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { DialogBody } from '../../DialogBody';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { DialogFooter } from '../../DialogFooter';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { camelize } from '../../../utils/string';
import useEnhancedDialogContext from '../../EnhancedDialog/useEnhancedDialogContext';
import type { ButtonProps } from '@mui/material/Button';
import { onSubmittingAndOrPendingChangeProps } from '../../../hooks/useEnhancedDialogState';

export interface CreateTypeDialogBaseProps {
	onAccept(typeData: Pick<ContentType, 'id' | 'name' | 'type'>): void;
	onSubmittingAndOrPendingChange(value: onSubmittingAndOrPendingChangeProps): void;
}

export interface CreateTypeDialogProps extends EnhancedDialogProps, CreateTypeDialogBaseProps {}

export function CreateTypeDialog(props: CreateTypeDialogProps) {
	// Make sure to extract all non-dialog props.
	const { onAccept, onSubmittingAndOrPendingChange, ...dialogProps } = props;
	return (
		<EnhancedDialog
			maxWidth="xs"
			fullWidth
			title={<FormattedMessage defaultMessage="Create Content Type" />}
			{...dialogProps}
		>
			<CreateTypeDialogBody onAccept={onAccept} onSubmittingAndOrPendingChange={onSubmittingAndOrPendingChange} />
		</EnhancedDialog>
	);
}

const prefixes = {
	page: '/page/',
	component: '/component/'
};

function CreateTypeDialogBody(props: CreateTypeDialogBaseProps) {
	const { onAccept, onSubmittingAndOrPendingChange } = props;
	const [type, setType] = useState<'page' | 'component'>('page');
	const [name, setName] = useState<string>('');
	const [id, setId] = useState<string>('');
	const [prefix, setPrefix] = useState<string>('');
	const dialogContext = useEnhancedDialogContext();
	const validateAndSubmit = () => {
		// TODO: Validate before accepting
		if (!validate(id, name, type)) return;
		onAccept?.({ type, name, id: `${prefixes[type] ?? ''}${id}` });
	};
	const handleChange: SelectProps['onChange'] = (e) => {
		const archetype = e.target.value as keyof typeof prefixes;
		onSubmittingAndOrPendingChange({ hasPendingChanges: true });
		setType(archetype);
		setPrefix(prefixes[archetype] ?? '');
	};
	const handleLabelBlur: TextFieldProps['onBlur'] = () => {
		setId(suggestTypeId(name));
	};
	const handleNameChange = (name: string) => {
		setName(name);
		onSubmittingAndOrPendingChange({ hasPendingChanges: true });
	};
	const handleIdChange = (id: string) => {
		setId(id);
		onSubmittingAndOrPendingChange({ hasPendingChanges: true });
	};
	const handleAccept: ButtonProps['onClick'] = () => {
		validateAndSubmit();
	};
	const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault();
		validateAndSubmit();
	};
	return (
		<form onSubmit={handleFormSubmit}>
			<DialogBody>
				<FormControl fullWidth>
					<InputLabel id="archetypeSelectLabel">
						<FormattedMessage defaultMessage="Archetype" />
					</InputLabel>
					<Select
						id="archetypeSelect"
						value={type}
						labelId="archetypeSelectLabel"
						label={<FormattedMessage defaultMessage="Archetype" />}
						onChange={handleChange}
						autoFocus
					>
						<MenuItem value="page">
							<FormattedMessage defaultMessage="Page" />
						</MenuItem>
						<MenuItem value="component">
							<FormattedMessage defaultMessage="Component" />
						</MenuItem>
						{/* Post v5 TODO: List archetypes from config */}
					</Select>
				</FormControl>
				<TextField
					margin="normal"
					value={name}
					label={<FormattedMessage defaultMessage="Label" />}
					onChange={(e) => handleNameChange(e.target.value)}
					onBlur={handleLabelBlur}
				/>
				<TextField
					margin="dense"
					value={id}
					label={<FormattedMessage defaultMessage="Identifier" />}
					slotProps={{ input: { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } }}
					onChange={(e) => handleIdChange(e.target.value)}
				/>
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => dialogContext?.onClose?.(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton type="submit" onClick={handleAccept}>
					<FormattedMessage defaultMessage="Accept" />
				</PrimaryButton>
			</DialogFooter>
		</form>
	);
}

function validate(id: string, name: string, type: string): boolean {
	return true;
}

function transformId(value: string): string {
	return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function suggestTypeId(label: string): string {
	let camelized = camelize(label.replace(/\s/g, '-'));
	camelized = camelized.charAt(0).toLowerCase() + camelized.substring(1);
	return transformId(camelized);
}

export default CreateTypeDialog;
