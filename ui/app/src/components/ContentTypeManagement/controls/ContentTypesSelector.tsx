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

import React, { useId, useState } from 'react';
import FormsEngineField from '../../FormsEngine/components/FormsEngineField';
import { ControlProps } from '../../FormsEngine/types';
import useContentTypes from '../../../hooks/useContentTypes';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';

export interface ContentTypesSelectorProps extends ControlProps {
	value: string;
}

/**
 * Enables the selection of multiple content types using a checkbox group layout.
 */
export function ContentTypesSelector(props: ContentTypesSelectorProps) {
	const { field, value, setValue, autoFocus } = props;
	const htmlId = useId();
	const maxLength = field.validations.maxLength?.value;
	const contentTypes = useContentTypes();
	const [selected, setSelected] = useState<string[]>(value ? value.split(',') : []);

	const handleToggle = (value: string) => () => {
		const currentIndex = selected.indexOf(value);
		const newSelected = [...selected];

		if (currentIndex === -1) {
			newSelected.push(value);
		} else {
			newSelected.splice(currentIndex, 1);
		}

		setSelected(newSelected);
		setValue(newSelected.join(','));
	};

	return (
		<FormsEngineField htmlFor={htmlId} field={field} max={maxLength}>
			<List>
				{Object.values(contentTypes).map((contentType) => (
					<ListItem key={contentType.id} sx={{ bgcolor: 'background.paper', p: 0 }}>
						<ListItemButton onClick={handleToggle(contentType.id)} dense>
							<ListItemIcon sx={{ py: 1 }}>
								{selected.includes(contentType.id) ? (
									<CheckBoxRoundedIcon color="primary" />
								) : (
									<CheckBoxOutlineBlankRoundedIcon />
								)}
							</ListItemIcon>
							<ListItemText primary={contentType.name} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</FormsEngineField>
	);
}

export default ContentTypesSelector;
