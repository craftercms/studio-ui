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

import React, { useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	ListItem,
	ListItemIcon,
	ListItemText,
	TextField,
	Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { DialogBody } from '../../DialogBody';
import { DialogFooter } from '../../DialogFooter';
import ListItemButton from '@mui/material/ListItemButton';
import { SearchBar, SearchBarProps } from '../../SearchBar';
import controlDescriptors from '../descriptors/controls';

export interface PickControlDialogProps extends EnhancedDialogProps {}

const fieldTypes = Object.values(controlDescriptors).sort((a, b) => (a?.name > b?.name ? 1 : -1));

function PickControlDialogBody({ open, onClose }: PickControlDialogProps) {
	const [searchTerm, setSearchTerm] = useState('');

	const handleSearchChange: SearchBarProps['onChange'] = (value) => {
		setSearchTerm(value);
	};

	const filteredFields = fieldTypes.filter(
		(field) =>
			field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			field.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<>
			<DialogBody sx={{ transition: 'height 0.3s ease-in-out' }}>
				<SearchBar keyword={searchTerm} onChange={handleSearchChange} />
				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
					{filteredFields.map((field, index) => (
						<ListItemButton key={index}>
							<ListItemIcon>
								<StarBorderIcon />
							</ListItemIcon>
							<ListItemText primary={field.name} secondary={field.description} />
						</ListItemButton>
					))}
				</Box>
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => onClose?.(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton>
					<FormattedMessage defaultMessage="Accept" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

// Usage example
export default function PickControlDialog({ ...dialogProps }: PickControlDialogProps) {
	return (
		<EnhancedDialog open title={<FormattedMessage defaultMessage="Pick a Control" />} maxWidth="sm" {...dialogProps}>
			<PickControlDialogBody {...dialogProps} />
		</EnhancedDialog>
	);
}
