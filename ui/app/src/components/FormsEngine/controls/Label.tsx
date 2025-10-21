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

import type { ControlProps } from '../types';
import Typography from '@mui/material/Typography';
import DOMPurify from 'dompurify';
import { getPropertyValue } from '../lib/formUtils';

export function Label(props: ControlProps) {
	const { field } = props;

	// region properties/validations
	const labelText: string = getPropertyValue(field.properties, 'text') as string;
	const renderAsHTML: boolean = getPropertyValue(field.properties, 'renderAsHTML') === true;
	// endregion

	return renderAsHTML ? (
		<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(labelText || '') }} />
	) : (
		<Typography variant="body2">{labelText || ''}</Typography>
	);
}

export default Label;
