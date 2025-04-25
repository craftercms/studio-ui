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

import React from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import useContentTypes from '../../../hooks/useContentTypes';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import { TypeBuilderControl } from '../utils';
import { createPresenceTable } from '../../../utils/array';
import useSpreadState from '../../../hooks/useSpreadState';
import { EmptyState } from '../../EmptyState';
import { FormattedMessage } from 'react-intl';

export interface ContentTypesSelectorProps extends TypeBuilderControl {
	value: string;
}

/**
 * Enables the selection of multiple content types using a checkbox group layout.
 */
export function ContentTypesSelector(props: ContentTypesSelectorProps) {
	const { field, value, setValue } = props;
	const maxLength = field.validations.maxLength?.value;
	const contentTypes = useContentTypes();
	const [selectedLookup, setSelectedLookup] = useSpreadState<Record<string, boolean>>(
		createPresenceTable(value ? value.split(',') : [])
	);

	const handleToggle = (value: string) => () => {
		const isSelected = selectedLookup[value];
		const newSelectedLookup = { ...selectedLookup, [value]: !isSelected };

		setSelectedLookup(newSelectedLookup);
		const selectedArray = Object.entries(newSelectedLookup)
			.filter(([, value]) => value)
			.map(([key]) => key);
		setValue(selectedArray.join(','));
	};

	return (
		<FormsEngineField field={field} max={maxLength}>
			<List>
				{Object.values(contentTypes).length === 0 ? (
					<EmptyState title={<FormattedMessage defaultMessage="No content types available" />} />
				) : (
					Object.values(contentTypes).map((contentType) => (
						<ListItem key={contentType.id} sx={{ bgcolor: 'background.paper', p: 0 }}>
							<ListItemButton onClick={handleToggle(contentType.id)} dense>
								<ListItemIcon sx={{ py: 1 }}>
									{selectedLookup[contentType.id] ? (
										<CheckBoxRoundedIcon color="primary" />
									) : (
										<CheckBoxOutlineBlankRoundedIcon />
									)}
								</ListItemIcon>
								<ListItemText primary={contentType.name} />
							</ListItemButton>
						</ListItem>
					))
				)}
			</List>
		</FormsEngineField>
	);
}

export default ContentTypesSelector;
