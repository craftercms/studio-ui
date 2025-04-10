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

import React, { useMemo, useState } from 'react';
import { Box, ListItemIcon, ListItemText } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { DialogBody } from '../../DialogBody';
import { DialogFooter } from '../../DialogFooter';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { SearchBar, SearchBarProps } from '../../SearchBar';
import controlDescriptors from '../descriptors/controls';
import { applyTranslations, PartialContentType } from '../utils';
import { nou } from '../../../utils/object';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { ContentType, ContentTypeField } from '../../../models';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import LookupTable from '../../../models/LookupTable';

export interface PickControlDialogProps extends EnhancedDialogProps {
	sectionId: string;
	type: ContentType;
	fieldIdPath?: string;
	onInsertField: (fieldType: string, position: number) => void;
}

const fieldTypes = Object.values(controlDescriptors).sort((a, b) => (a?.name > b?.name ? 1 : -1));

function PickControlDialogBody(props: PickControlDialogProps) {
	const { type, sectionId, fieldIdPath, onClose, onInsertField } = props;
	const [searchTerm, setSearchTerm] = useState('');
	const { formatMessage } = useIntl();
	const [selectedControl, setSelectedControl] = useState<PartialContentType>(undefined);
	const [selectedView, setSelectedView] = useState<number>(0);
	const [position, setPosition] = useState<number>(0);
	const { sectionFieldIds, sectionFields } = useMemo(() => {
		let sectionFieldIds: string[];
		let sectionFields: LookupTable<ContentTypeField>;
		if (nou(fieldIdPath)) {
			// If fieldIdPath is null or undefined (not a composed id path), get the sectionFields from the root of 'type'.
			sectionFieldIds = type.sections.find((section) => section.id === sectionId)?.fields;
			sectionFields = type.fields;
		} else {
			// If fieldIdPath has a value (composed id path), get the sectionFields from the specified path.
			const fieldPathParts = fieldIdPath.split('.');
			let subFields = type.fields;
			fieldPathParts.forEach((fieldPathPart) => {
				subFields = subFields[fieldPathPart]?.fields;
			});
			sectionFieldIds = Object.values(subFields)?.map((field) => field.id);
			sectionFields = subFields;
		}
		return { sectionFieldIds, sectionFields };
	}, [fieldIdPath, sectionId, type]);

	const onSecondaryAction = (e: React.MouseEvent) => {
		if (selectedView === 0) {
			onClose?.(e, null);
		} else {
			setSelectedView(0);
		}
	};

	const onPrimaryAction = () => {
		if (selectedView === 0) {
			setSelectedView(1);
		} else {
			onInsertField(selectedControl.id, position);
		}
	};

	const filteredFields = fieldTypes
		.map((type) => applyTranslations(type, formatMessage))
		.filter(
			(field) =>
				field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				field.description.toLowerCase().includes(searchTerm.toLowerCase())
		);

	const handleSearchChange: SearchBarProps['onChange'] = (value) => {
		setSearchTerm(value);
	};

	return (
		<>
			<DialogBody sx={{ transition: 'height 0.3s ease-in-out', minHeight: '40vh' }}>
				{selectedView === 0 ? (
					<>
						<SearchBar keyword={searchTerm} onChange={handleSearchChange} />
						<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
							{filteredFields.map((field, index) => (
								<ListItemButton
									key={index}
									onClick={() => setSelectedControl(field)}
									selected={selectedControl?.id === field.id}
								>
									<ListItemIcon>
										<StarBorderIcon />
									</ListItemIcon>
									<ListItemText primary={field.name} secondary={field.description} />
								</ListItemButton>
							))}
						</Box>
					</>
				) : (
					<Box>
						<Box sx={{ display: 'flex', mb: 1 }}>
							<Box display="flex" alignItems="center">
								<Tooltip title={<FormattedMessage defaultMessage="Back to control selection" />}>
									<IconButton onClick={() => setSelectedView(0)}>
										<ArrowBackRoundedIcon />
									</IconButton>
								</Tooltip>
							</Box>
							<ListItem>
								<ListItemIcon>
									<StarBorderIcon />
								</ListItemIcon>
								<ListItemText primary={selectedControl.name} secondary={selectedControl.description} />
							</ListItem>
						</Box>
						<FormControl>
							<FormLabel id="controlInsertionRadioGroupLabel">
								<FormattedMessage defaultMessage="Pick the position for the new control:" />
							</FormLabel>
						</FormControl>
						<RadioGroup
							aria-labelledby="controlInsertionRadioGroupLabel"
							name="controlInsertionRadioGroupLabel"
							value={position}
							onChange={(e) => setPosition(parseInt(e.target.value))}
							sx={{ padding: '10px' }}
						>
							<FormControlLabel
								control={<Radio />}
								value={0}
								sx={{ marginBottom: '10px' }}
								slotProps={{ typography: { variant: 'body2' } }}
								label={<FormattedMessage defaultMessage="Insert first" />}
							/>
							{sectionFieldIds?.map((fieldId, index) => (
								<FormControlLabel
									key={fieldId}
									control={<Radio />}
									value={index + 1}
									sx={{ marginBottom: '10px' }}
									slotProps={{ typography: { variant: 'body2' } }}
									label={
										index + 1 === sectionFieldIds.length ? (
											<FormattedMessage
												defaultMessage='Insert last (after "{sectionName}")'
												values={{ sectionName: sectionFields[fieldId]?.name ?? fieldId }}
											/>
										) : (
											<FormattedMessage
												defaultMessage='Insert after "{sectionName}"'
												values={{ sectionName: sectionFields[fieldId]?.name ?? fieldId }}
											/>
										)
									}
								/>
							))}
						</RadioGroup>
					</Box>
				)}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={onSecondaryAction}>
					{selectedView === 0 ? (
						<FormattedMessage defaultMessage="Cancel" />
					) : (
						<FormattedMessage defaultMessage="Back" />
					)}
				</SecondaryButton>
				<PrimaryButton disabled={nou(selectedControl)} onClick={() => onPrimaryAction()}>
					{selectedView === 0 ? (
						<FormattedMessage defaultMessage="Select" />
					) : (
						<FormattedMessage defaultMessage="Accept" />
					)}
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function PickControlDialog({
	onInsertField,
	type,
	sectionId,
	fieldIdPath,
	...dialogProps
}: PickControlDialogProps) {
	return (
		<EnhancedDialog open title={<FormattedMessage defaultMessage="Insert Control" />} maxWidth="sm" {...dialogProps}>
			<PickControlDialogBody
				{...dialogProps}
				type={type}
				sectionId={sectionId}
				fieldIdPath={fieldIdPath}
				onInsertField={onInsertField}
			/>
		</EnhancedDialog>
	);
}

export default PickControlDialog;
