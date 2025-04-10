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

import { EnhancedDialogProps } from '../../EnhancedDialog';
import { ContentType } from '../../../models';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import dataSourceDescriptors from '../descriptors/dataSources';
import PickFieldDialog, { PickFieldDialogProps } from './PickFieldDialog';

export interface PickDataSourceDialogProps extends EnhancedDialogProps {
	type: ContentType;
	onInsert: PickFieldDialogProps['onInsert'];
}

const types = Object.values(dataSourceDescriptors).sort((a, b) => (a?.name > b?.name ? 1 : -1));

export function PickDataSourceDialog(props: PickDataSourceDialogProps) {
	return (
		<PickFieldDialog
			{...props}
			title={<FormattedMessage defaultMessage="Insert Data Source" />}
			typesFullList={types}
			typesCurrentList={props.type.dataSources}
		/>
	);
}

export default PickDataSourceDialog;
