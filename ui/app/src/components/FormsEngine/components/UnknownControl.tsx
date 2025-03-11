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

import Alert from '@mui/material/Alert';
import React from 'react';
import { ContentTypeField } from '../../../models';
import { FormsEngineField } from './FormsEngineField';

export const UnknownControl = ({ field }: { field: ContentTypeField }) => (
	<FormsEngineField field={field}>
		<Alert
			severity="error"
			variant="outlined"
			sx={(theme) => ({ border: 'none', strong: { fontWeight: theme.typography.fontWeightMedium } })}
		>
			Unable to render{' '}
			<strong>
				<em>
					{field.name} ({field.id})
				</em>
			</strong>
			. No mapping found in the system for the <strong>{field.type}</strong> type.
		</Alert>
	</FormsEngineField>
);
