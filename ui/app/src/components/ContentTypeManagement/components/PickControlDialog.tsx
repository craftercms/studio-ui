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

import React, { useMemo } from 'react';
import { EnhancedDialogProps } from '../../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import controlDescriptors from '../descriptors/controls';
import { nou } from '../../../utils/object';
import { ContentType, ContentTypeField } from '../../../models';
import PickFieldDialog from './PickFieldDialog';
import { BuiltInControlType } from '../../FormsEngine/lib/controlMap';

export interface PickControlDialogProps extends EnhancedDialogProps {
	sectionId: string;
	type: ContentType;
	fieldIdPath?: string;
	onInsertField: (fieldType: string, position: number) => void;
}

const types = Object.values(controlDescriptors).sort((a, b) => (a?.name > b?.name ? 1 : -1));

export const basicFieldsIds: BuiltInControlType[] = [
	'file-name',
	'auto-filename',
	'internal-name',
	'disabled',
	'page-nav-order',
	'locale-selector'
];

export function PickControlDialog(props: PickControlDialogProps) {
	const { onInsertField, type, sectionId, fieldIdPath, ...dialogProps } = props;
	const { sectionFields } = useMemo(() => {
		let sectionFields: ContentTypeField[];
		if (nou(fieldIdPath)) {
			// If fieldIdPath is null or undefined (not a composed id path), get the sectionFields from the root of 'type'.
			// Here we retrieve the array of ids so we can ensure the order of the fields.
			const sectionFieldIds = type.sections.find((section) => section.id === sectionId)?.fields;
			sectionFields = sectionFieldIds?.map((fieldId) => type.fields[fieldId]) ?? [];
		} else {
			// If fieldIdPath has a value (composed id path), get the sectionFields from the specified path.
			const fieldPathParts = fieldIdPath.split('.');
			let subFields = type.fields;
			fieldPathParts.forEach((fieldPathPart) => {
				subFields = subFields?.[fieldPathPart]?.fields ?? {};
			});
			sectionFields = Object.values(subFields);
		}
		return { sectionFields };
	}, [fieldIdPath, sectionId, type]);

	return (
		<PickFieldDialog
			{...dialogProps}
			onInsert={onInsertField}
			type={type}
			title={<FormattedMessage defaultMessage="Insert Control" />}
			typesFullList={types}
			typesCurrentList={sectionFields}
			basicFieldsIds={basicFieldsIds}
		/>
	);
}

export default PickControlDialog;
